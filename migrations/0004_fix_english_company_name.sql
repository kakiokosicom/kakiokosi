-- Fix English company name: YURICA Inc. → YURIKA,K.K.
UPDATE pages SET content = REPLACE(content, 'YURICA Inc.', 'YURIKA,K.K.') WHERE content LIKE '%YURICA Inc.%';
