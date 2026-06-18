-- ============================================================================
-- 0035: 編集部注の年号誤り訂正（SEO監査 2026-06-16 調査で判明・E-E-A-T正確性）
--  85 : 党首討論は本文の動画タイトル「平成23年2月9日」より2011年（編集注の2010年は誤り）
--  185: Mobile Hack Tokyo でのザッカーバーグ来日講演は2012年（編集注の2014年は誤り）
-- idempotent: 対象文字列が無ければ no-op。
-- ============================================================================
UPDATE posts SET content=REPLACE(content,'2010年の党首討論','2011年の党首討論'),
  updated_at=datetime('now','+9 hours') WHERE id=85 AND instr(content,'2010年の党首討論')>0;
UPDATE posts SET content=REPLACE(content,'2014年、マーク・ザッカーバーグ','2012年、マーク・ザッカーバーグ'),
  updated_at=datetime('now','+9 hours') WHERE id=185 AND instr(content,'2014年、マーク・ザッカーバーグ')>0;
