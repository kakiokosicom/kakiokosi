-- Rewrite regal (特定商取引法) page: update company info, remove old paid service references
UPDATE pages SET content = '<section>
<p>「書き起こし.com」（以下「本サービス」）は、株式会社ユリカが運営するメディアサイトです。現在、有料サービスの提供は行っておりませんが、特定商取引法第11条に基づき、以下のとおり表記いたします。</p>

<table>
<tr><th>販売事業者名</th><td>株式会社ユリカ（YURIKA,K.K.）</td></tr>
<tr><th>運営責任者</th><td>AI ATAKA</td></tr>
<tr><th>所在地</th><td>東京都渋谷区道玄坂1丁目10番8号 渋谷道玄坂東急ビル2F-C</td></tr>
<tr><th>お問い合わせ</th><td><a href="mailto:info@kakiokosi.com">info@kakiokosi.com</a>（原則メール対応）</td></tr>
<tr><th>電話番号</th><td>請求があった場合に遅滞なく開示いたします</td></tr>
<tr><th>販売価格</th><td>現在、有料サービスの提供はございません</td></tr>
<tr><th>商品代金以外の必要料金</th><td>インターネット接続料等はお客様のご負担となります</td></tr>
<tr><th>お支払い方法</th><td>該当なし（有料サービス開始時に別途定めます）</td></tr>
<tr><th>役務の提供時期</th><td>該当なし</td></tr>
<tr><th>返品・キャンセル</th><td>該当なし</td></tr>
</table>

<p style="margin-top: 2rem; color: #74777d; font-size: 0.875rem;">2011年6月27日 制定<br>2024年12月1日 改定</p>
</section>', title = '特定商取引法に基づく表記' WHERE slug = 'regal';
