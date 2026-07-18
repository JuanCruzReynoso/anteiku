-- Convert products.featured from text to boolean
ALTER TABLE products ALTER COLUMN featured TYPE boolean USING (featured = 'true');
ALTER TABLE products ALTER COLUMN featured SET DEFAULT false;
