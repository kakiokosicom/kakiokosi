-- Rename 株式会社コレカラ → 株式会社ユリカ, COREKARA Inc. → YURICA Inc.
UPDATE pages SET content = REPLACE(content, '株式会社コレカラ', '株式会社ユリカ') WHERE content LIKE '%株式会社コレカラ%';
UPDATE pages SET content = REPLACE(content, 'COREKARA Inc.', 'YURICA Inc.') WHERE content LIKE '%COREKARA Inc.%';
