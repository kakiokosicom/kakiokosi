-- Add source_url column for original video/audio URL
ALTER TABLE posts ADD COLUMN source_url TEXT DEFAULT NULL;
