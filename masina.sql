DROP TYPE IF EXISTS tip_combustibil;
DROP TYPE IF EXISTS tip_masina;

CREATE TYPE tip_combustibil AS ENUM('benzina', 'motorina', 'electric', 'hibrid');
CREATE TYPE tip_masina AS ENUM('sedan', 'suv', 'hatchback', 'coupe', 'convertibil', 'minivan');

CREATE TABLE IF NOT EXISTS masini (
   id serial PRIMARY KEY,  -- 1. id: identificator unic numeric
   nume VARCHAR(50) UNIQUE NOT NULL,  -- 2. nume
   descriere TEXT,  -- 3. descriere
   pret NUMERIC(10,2) NOT NULL,  -- 7. preț
   an_fabricatie INT NOT NULL CHECK (an_fabricatie >= 1886 AND an_fabricatie <= extract(year from current_date)),  -- 8. a doua caracteristică numerică
   tip_combustibil tip_combustibil DEFAULT 'benzina',  -- 6. categorie mai puțin importantă (enum)
   consum_combustibil NUMERIC(4,2) NOT NULL CHECK (consum_combustibil >= 0),  -- a doua caracteristică numerică
   tip_masina tip_masina DEFAULT 'sedan',  -- 5. categorie (enum)
   dotari VARCHAR [],  -- 11. caracteristică cu mai multe valori
   garantie BOOLEAN NOT NULL DEFAULT TRUE,  -- 12. caracteristică booleană
   imagine VARCHAR(300),  -- 4. imagine
   data_adaugare TIMESTAMP DEFAULT current_timestamp  -- 9. caracteristică de tip Date
);


INSERT INTO masini (nume, descriere, pret, an_fabricatie, consum_combustibil, tip_combustibil, tip_masina, dotari, garantie, imagine) VALUES 
('Lamborghini Huracan', 'Mașină sport de înaltă performanță, design agresiv și putere impresionantă.', 250000.00 , 2022, 12.5, 'benzina', 'coupe', '{"navigație GPS", "scaune din piele", "tracțiune integrală"}', True, 'lamborghini-huracan.jpg'),

('Rolls Royce Dawn', 'Mașină de lux cu un design elegant și rafinat.', 350000.00 , 2023, 14.0, 'benzina', 'convertibil', '{"pilot automat", "scaune încălzite", "sistem audio premium"}', True, 'rolls-royce-dawn.jpg'),

('Mercedes AMG GT', 'Performanță și lux combinate într-un coupe sport.', 180000.00 , 2023, 10.2, 'benzina', 'coupe', '{"sistem de navigație", "scaune sport", "tracțiune integrală"}', True, 'mercedes-amg-gt.jpg'),

('Lamborghini Urus', 'SUV sport de lux, combină puterea cu spațiul și confortul.', 200000.00 , 2023, 12.0, 'benzina', 'suv', '{"navigație GPS", "scaune din piele", "tracțiune integrală"}', True, 'lamborghini-urus.jpg'),

('Skoda Superb', 'Sedan spațios și confortabil, ideal pentru drumuri lungi.', 35000.00 , 2022, 6.5, 'benzina', 'sedan', '{"aer condiționat", "sistem audio", "navigație GPS"}', True, 'skoda-superb.jpg'),

('Ford Mustang', 'Mașină iconică, combinație de stil clasic și performanță modernă.', 55000.00 , 2022, 9.8, 'benzina', 'coupe', '{"sistem audio premium", "scaune sport", "navigație GPS"}', True, 'ford-mustang.jpg'),

('Porsche 911', 'Coupé sport, perfect pentru cei care caută performanțe excepționale.', 150000.00 , 2023, 11.0, 'benzina', 'coupe', '{"sistem de navigație", "scaune din piele", "sistem audio Bose"}', True, 'porsche-911.jpg'),

('BMW i8', 'Mașină sport hibridă, combinație de putere și eficiență.', 140000.00 , 2023, 2.1, 'hibrid', 'coupe', '{"navigație GPS", "scaune din piele", "tracțiune integrală"}', True, 'bmw-i8.jpg'),

('Audi Q7', 'SUV de lux, oferă confort și tehnologie avansată.', 80000.00 , 2022, 9.5, 'motorina', 'suv', '{"aer condiționat", "sistem audio", "navigație GPS"}', True, 'audi-q7.jpg'),

('Jaguar F-Type', 'Mașină sport, combinație de performanță și eleganță.', 90000.00 , 2023, 10.9, 'benzina', 'coupe', '{"sistem de navigație", "scaune din piele", "tracțiune integrală"}', True, 'jaguar-f-type.jpg');
