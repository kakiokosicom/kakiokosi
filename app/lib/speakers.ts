/**
 * 記事ごとの「話者（登壇者・発言者）」エンティティ。
 *
 * 書き起こし記事の主役は、書き起こした編集部（author）ではなく、元の講演・
 * インタビューで「話した人」。各話者を Wikidata QID と紐づけ、Article schema の
 * `about` に Person として出力することで、検索エンジン/AI に「この記事は誰について
 * 語っているか」をエンティティ単位で伝える（ナレッジグラフ連携・E-E-A-T）。
 *
 * 全 QID は Wikidata API で人物実体(P31=Q5)・職業を確認した検証済みの値。
 * Wikidata に項目が無い話者（登丸賢美 等）や、単一話者が定まらないまとめ記事は
 * 収録しない。
 */
export type Speaker = { name: string; wikidata: string };

export const SPEAKERS: Record<number, Speaker[]> = {
  72: [{ name: "孫正義", wikidata: "Q717038" }, { name: "三木谷浩史", wikidata: "Q5366748" }],
  73: [{ name: "三木谷浩史", wikidata: "Q5366748" }],
  75: [{ name: "孫正義", wikidata: "Q717038" }],
  76: [{ name: "孫正義", wikidata: "Q717038" }],
  77: [{ name: "孫正義", wikidata: "Q717038" }],
  78: [{ name: "米倉誠一郎", wikidata: "Q11604004" }],
  79: [{ name: "田村耕太郎", wikidata: "Q6433885" }],
  82: [{ name: "マーク・ザッカーバーグ", wikidata: "Q36215" }],
  85: [{ name: "菅直人", wikidata: "Q47846" }, { name: "谷垣禎一", wikidata: "Q463331" }],
  86: [{ name: "小沢一郎", wikidata: "Q459998" }],
  87: [{ name: "スティーブ・ジョブズ", wikidata: "Q19837" }],
  89: [{ name: "村上春樹", wikidata: "Q134798" }],
  91: [{ name: "JR", wikidata: "Q1312565" }],
  93: [{ name: "バラク・オバマ", wikidata: "Q76" }],
  102: [{ name: "ジェイソン・フリード", wikidata: "Q23795888" }],
  119: [{ name: "マーク・ザッカーバーグ", wikidata: "Q36215" }],
  121: [{ name: "デレク・シヴァーズ", wikidata: "Q5262357" }],
  123: [{ name: "セバスチャン・スラン", wikidata: "Q62901" }],
  125: [{ name: "アレックス・マッコー", wikidata: "Q130782278" }],
  127: [
    { name: "スティーブ・ジョブズ", wikidata: "Q19837" },
    { name: "ラリー・エリソン", wikidata: "Q92759" },
    { name: "エド・キャットムル", wikidata: "Q93161" },
  ],
  129: [
    { name: "スティーブ・ジョブズ", wikidata: "Q19837" },
    { name: "ラリー・エリソン", wikidata: "Q92759" },
    { name: "エド・キャットムル", wikidata: "Q93161" },
  ],
  133: [{ name: "バラク・オバマ", wikidata: "Q76" }],
  135: [{ name: "ジュリアン・アサンジ", wikidata: "Q360" }],
  153: [{ name: "ドナルド・ノーマン", wikidata: "Q92804" }],
  157: [{ name: "スティーブ・ジョブズ", wikidata: "Q19837" }],
  183: [{ name: "村上春樹", wikidata: "Q134798" }],
  185: [{ name: "マーク・ザッカーバーグ", wikidata: "Q36215" }],
  202: [{ name: "キャメロン・ヘロルド", wikidata: "Q18921892" }],
  211: [
    { name: "エレズ・リーバーマン・エイデン", wikidata: "Q5385746" },
    { name: "ジャン=バティスト・ミシェル", wikidata: "Q23657155" },
  ],
  213: [{ name: "前田敦子", wikidata: "Q1154232" }],
  311: [{ name: "孫正義", wikidata: "Q717038" }, { name: "佐々木俊尚", wikidata: "Q7827741" }],
  323: [{ name: "大久保嘉人", wikidata: "Q311209" }],
  325: [{ name: "本田圭佑", wikidata: "Q202054" }],
  641: [{ name: "本田圭佑", wikidata: "Q202054" }],
  643: [{ name: "ホセ・ムヒカ", wikidata: "Q9094" }],
  881: [{ name: "シェリル・サンドバーグ", wikidata: "Q234653" }],
};

/** Article schema の about 用に Person[] を生成（話者が無い記事は空配列） */
export function speakerAbout(postId: number) {
  return (SPEAKERS[postId] || []).map((s) => ({
    "@type": "Person" as const,
    name: s.name,
    sameAs: `https://www.wikidata.org/wiki/${s.wikidata}`,
  }));
}
