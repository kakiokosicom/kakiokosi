-- Fix 運営/運営情報/運営について → 運営会社 (consistency)
UPDATE pages SET content = REPLACE(content, '<h2>運営について</h2>', '<h2>運営会社</h2>') WHERE slug = 'about';
UPDATE pages SET content = REPLACE(content, '<tr><th>運営</th>', '<tr><th>運営会社</th>') WHERE slug = 'about';
UPDATE pages SET content = REPLACE(content, '<h2>運営情報</h2>', '<h2>運営会社</h2>') WHERE slug = 'contact';
-- Fix company page bracket style
UPDATE pages SET content = REPLACE(content, '株式会社ユリカ(英文名 YURIKA,K.K.)', '株式会社ユリカ（YURIKA,K.K.）') WHERE slug = 'company';
