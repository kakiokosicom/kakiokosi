#!/usr/bin/env python3
"""
セルフホスト用フォントサブセット生成（SEO監査 2026-06-18 / Performance対応）
─────────────────────────────────────────────────────────────────────────
背景: 旧構成は Google Fonts の css2 を読み込んでおり、344KB の render-blocking
CSS + fonts.googleapis.com / fonts.gstatic.com への 3rd-party 接続 + 124
unicode-range サブセット×3ウェイトで「ページ毎」に約1MBのフォントを取得していた。

本スクリプトは Noto Sans JP(400/700) と Noto Serif JP(900) を、
  - サイト全コンテンツ(D1 posts/pages 全文) の実使用グリフ
  - 常用漢字(2,136) + 仮名/約物/ラテン/IPA等の基底レンジ
の和集合に**サブセット**し、1ウェイト=1ファイルの woff2 として public/fonts/ に出力する。
→ サイト全体で1回ダウンロード→immutable キャッシュ共有。3rd-party CSS は撤廃。
合計約1.6MB（全サブセット自前ホスト時の約18MBを回避）。tofu はコーパス由来のため現行
コンテンツでゼロ、常用漢字で将来記事も概ね保護。

前提: fontTools + brotli（`python3 -c "import fontTools,brotli"` が通ること）、
      ネットワーク（ソースVFと常用漢字リストを取得）、wrangler が本番D1にアクセス可。
新しい記事が大量に増えてレアな漢字が出た場合は再実行して public/fonts/ を更新・コミット。

使い方: python3 scripts/generate-fonts.py
"""
import json, re, os, subprocess, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public/fonts")
CACHE = "/tmp/fontwork"
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36"
DB = "kakiokosi-db"
os.makedirs(OUT, exist_ok=True)
os.makedirs(CACHE, exist_ok=True)


def fetch(url, path):
    if os.path.exists(path) and os.path.getsize(path) > 1000:
        return
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=120) as r, open(path, "wb") as f:
        f.write(r.read())


def d1_text(sql):
    out = subprocess.run(
        ["npx", "wrangler", "d1", "execute", DB, "--remote", "--json", "--command", sql],
        capture_output=True, text=True, check=True, cwd=ROOT,
        env={**os.environ}, errors="replace",
    ).stdout
    rows = json.loads(out[out.index("["):])[0]["results"]
    return "".join(row["t"] for row in rows)


def build_charset():
    chars = set()
    # 1) サイト全コンテンツ（全ステータス＝将来公開される etc 原液も含む）
    chars |= set(d1_text("SELECT COALESCE(title,'')||' '||COALESCE(excerpt,'')||' '||COALESCE(content,'') t FROM posts"))
    chars |= set(d1_text("SELECT COALESCE(title,'')||' '||COALESCE(content,'') t FROM pages"))
    # 2) UI文字列（app/ workers/ の日本語リテラル）
    lit = subprocess.run(
        ["grep", "-rhoE", r'[぀-ヿ一-鿿][^"`<]*', os.path.join(ROOT, "app"), os.path.join(ROOT, "workers")],
        capture_output=True, text=True, errors="replace",
    ).stdout
    chars |= set(lit)
    # 3) 常用漢字 2,136（公式数で検算）
    fetch("https://raw.githubusercontent.com/davidluzgouveia/kanji-data/master/kanji-jouyou.json", f"{CACHE}/joyo.json")
    joyo = [k for k in json.load(open(f"{CACHE}/joyo.json")).keys() if len(k) == 1]
    assert len(joyo) == 2136, f"joyo count unexpected: {len(joyo)}"
    chars |= set(joyo)
    # 4) 基底レンジ（コーパス非依存で必ず含める）
    def rng(a, b):
        chars.update(chr(c) for c in range(a, b + 1))
    for a, b in [
        (0x20, 0x7E), (0xA0, 0xFF),       # ASCII / Latin-1
        (0x100, 0x24F),                    # Latin Extended-A/B
        (0x250, 0x2AF), (0x2B0, 0x2FF),    # IPA / spacing modifiers（音声記号: ə ɪ ʃ 等）
        (0x300, 0x36F),                    # combining diacritics
        (0x2000, 0x206F), (0x2070, 0x209F), (0x20A0, 0x20BF),  # punctuation / sub-sup / currency
        (0x2100, 0x214F), (0x2190, 0x21FF), (0x2200, 0x22FF),  # letterlike / arrows / math
        (0x2460, 0x24FF), (0x25A0, 0x25FF), (0x2600, 0x26FF),  # enclosed / shapes / symbols
        (0x3000, 0x303F), (0x3040, 0x309F), (0x30A0, 0x30FF),  # CJK punct / hiragana / katakana
        (0x31F0, 0x31FF), (0xFE00, 0xFE0F), (0xFF00, 0xFFEF),  # kana ext / variation selectors / fullwidth
    ]:
        rng(a, b)
    # 制御・サロゲート・置換文字を除去
    chars = {c for c in chars if c.isprintable() and not (0xD800 <= ord(c) <= 0xDFFF) and ord(c) != 0xFFFD}
    return chars


def subset_font(src, wght, stem, unicodes):
    """サブセットして content-hash 付き woff2 を出力。(filename, bytes) を返す。"""
    import hashlib
    from fontTools.ttLib import TTFont
    from fontTools.varLib.instancer import instantiateVariableFont
    from fontTools import subset
    f = TTFont(src)
    instantiateVariableFont(f, {"wght": wght}, inplace=True)
    ss = subset.Subsetter(options=subset.Options(flavor="woff2", layout_features="*", notdef_outline=True))
    ss.populate(unicodes=unicodes)
    ss.subset(f)
    f.flavor = "woff2"
    import io
    buf = io.BytesIO()
    f.save(buf)
    data = buf.getvalue()
    h = hashlib.sha256(data).hexdigest()[:8]
    name = f"{stem}.{h}.woff2"
    with open(os.path.join(OUT, name), "wb") as out:
        out.write(data)
    return name, len(data)


def main():
    print("▶ building charset from D1 content + joyo + base ranges …")
    chars = build_charset()
    unicodes = [ord(c) for c in chars]
    cjk = len([c for c in chars if 0x4E00 <= ord(c) <= 0x9FFF])
    print(f"  glyphs: {len(chars)} (CJK basic-range {cjk})")

    fetch("https://raw.githubusercontent.com/google/fonts/main/ofl/notosansjp/NotoSansJP%5Bwght%5D.ttf", f"{CACHE}/NotoSansJP-VF.ttf")
    fetch("https://raw.githubusercontent.com/google/fonts/main/ofl/notoserifjp/NotoSerifJP%5Bwght%5D.ttf", f"{CACHE}/NotoSerifJP-VF.ttf")

    # 既存の古いハッシュ付きwoff2を掃除（immutable運用のため毎回ユニーク名になる）
    for old in os.listdir(OUT):
        if old.endswith(".woff2"):
            os.remove(os.path.join(OUT, old))

    jobs = [
        (f"{CACHE}/NotoSansJP-VF.ttf", 400, "NotoSansJP-400", '"Noto Sans JP"', 400),
        (f"{CACHE}/NotoSansJP-VF.ttf", 700, "NotoSansJP-700", '"Noto Sans JP"', 700),
        (f"{CACHE}/NotoSerifJP-VF.ttf", 900, "NotoSerifJP-900", '"Noto Serif JP"', 900),
    ]
    total = 0
    faces = []
    for src, wght, stem, family, css_weight in jobs:
        name, n = subset_font(src, wght, stem, unicodes)
        total += n
        faces.append({"family": family, "weight": css_weight, "url": f"/fonts/{name}"})
        print(f"  {name}: {n:,} bytes")

    # マニフェスト（root.tsx が @font-face のインライン生成と preload に使う）
    manifest = (
        "// 自動生成: scripts/generate-fonts.py。手で編集しない。\n"
        "// content-hash 付きURLなので /fonts/*.woff2 を immutable キャッシュできる。\n"
        "export type FontFace = { family: string; weight: number; url: string };\n"
        "export const FONT_FACES: FontFace[] = " + json.dumps(faces, ensure_ascii=False, indent=2) + ";\n"
        "/** above-the-fold の本文フォント（preload 対象） */\n"
        "export const PRELOAD_FONT = " + json.dumps(faces[0]["url"]) + ";\n"
        "/** <style> に流し込む @font-face CSS（display:swap） */\n"
        "export const FONT_FACE_CSS = FONT_FACES.map(\n"
        "  (f) => `@font-face{font-family:${f.family};font-style:normal;font-weight:${f.weight};"
        "font-display:swap;src:url(${f.url}) format('woff2')}`\n"
        ").join(\"\");\n"
    )
    with open(os.path.join(ROOT, "app/lib/font-manifest.ts"), "w") as mf:
        mf.write(manifest)
    print(f"✓ total {total:,} bytes → {OUT}")
    print(f"✓ manifest → app/lib/font-manifest.ts")


if __name__ == "__main__":
    main()
