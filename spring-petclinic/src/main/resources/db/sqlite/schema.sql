DROP TABLE IF EXISTS vet_specialties;
DROP TABLE IF EXISTS vets;
DROP TABLE IF EXISTS specialties;
DROP TABLE IF EXISTS visits;
DROP TABLE IF EXISTS pets;
DROP TABLE IF EXISTS types;
DROP TABLE IF EXISTS owners;

CREATE TABLE vets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT,
  last_name TEXT
);
CREATE INDEX idx_vets_last_name ON vets (last_name);

CREATE TABLE specialties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT
);
CREATE INDEX idx_specialties_name ON specialties (name);

CREATE TABLE vet_specialties (
  vet_id INTEGER NOT NULL,
  specialty_id INTEGER NOT NULL,
  FOREIGN KEY (vet_id) REFERENCES vets (id),
  FOREIGN KEY (specialty_id) REFERENCES specialties (id)
);

CREATE TABLE types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT
);
CREATE INDEX idx_types_name ON types (name);

CREATE TABLE owners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT,
  last_name TEXT,
  address TEXT,
  city TEXT,
  telephone TEXT
);
CREATE INDEX idx_owners_last_name ON owners (last_name);

CREATE TABLE pets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  birth_date TEXT,
  type_id INTEGER NOT NULL,
  owner_id INTEGER,
  FOREIGN KEY (owner_id) REFERENCES owners (id),
  FOREIGN KEY (type_id) REFERENCES types (id)
);
CREATE INDEX idx_pets_name ON pets (name);

CREATE TABLE visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pet_id INTEGER,
  visit_date TEXT,
  description TEXT,
  FOREIGN KEY (pet_id) REFERENCES pets (id)
);
CREATE INDEX idx_visits_pet_id ON visits (pet_id);
