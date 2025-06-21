INSERT INTO vets VALUES (NULL, 'James', 'Carter');
INSERT INTO vets VALUES (NULL, 'Helen', 'Leary');
INSERT INTO vets VALUES (NULL, 'Linda', 'Douglas');
INSERT INTO vets VALUES (NULL, 'Rafael', 'Ortega');
INSERT INTO vets VALUES (NULL, 'Henry', 'Stevens');
INSERT INTO vets VALUES (NULL, 'Sharon', 'Jenkins');

INSERT INTO specialties VALUES (NULL, 'radiology');
INSERT INTO specialties VALUES (NULL, 'surgery');
INSERT INTO specialties VALUES (NULL, 'dentistry');

INSERT INTO vet_specialties VALUES (2, 1);
INSERT INTO vet_specialties VALUES (3, 2);
INSERT INTO vet_specialties VALUES (3, 3);
INSERT INTO vet_specialties VALUES (4, 2);
INSERT INTO vet_specialties VALUES (5, 1);

INSERT INTO types VALUES (NULL, 'cat');
INSERT INTO types VALUES (NULL, 'dog');
INSERT INTO types VALUES (NULL, 'lizard');
INSERT INTO types VALUES (NULL, 'snake');
INSERT INTO types VALUES (NULL, 'bird');
INSERT INTO types VALUES (NULL, 'hamster');

INSERT INTO owners VALUES (NULL, 'George', 'Franklin', '110 W. Liberty St.', 'Madison', '6085551023');
INSERT INTO owners VALUES (NULL, 'Betty', 'Davis', '638 Cardinal Ave.', 'Sun Prairie', '6085551749');
INSERT INTO owners VALUES (NULL, 'Eduardo', 'Rodriquez', '2693 Commerce St.', 'McFarland', '6085558763');
INSERT INTO owners VALUES (NULL, 'Harold', 'Davis', '563 Friendly St.', 'Windsor', '6085553198');
INSERT INTO owners VALUES (NULL, 'Peter', 'McTavish', '2387 S. Fair Way', 'Madison', '6085552765');
INSERT INTO owners VALUES (NULL, 'Jean', 'Coleman', '105 N. Lake St.', 'Monona', '6085552654');
INSERT INTO owners VALUES (NULL, 'Jeff', 'Black', '1450 Oak Blvd.', 'Monona', '6085555387');
INSERT INTO owners VALUES (NULL, 'Maria', 'Escobito', '345 Maple St.', 'Madison', '6085557683');
INSERT INTO owners VALUES (NULL, 'David', 'Schroeder', '2749 Blackhawk Trail', 'Madison', '6085559435');
INSERT INTO owners VALUES (NULL, 'Carlos', 'Estaban', '2335 Independence La.', 'Waunakee', '6085555487');

INSERT INTO pets VALUES (NULL, 'Leo', '2010-09-07', 1, 1);
INSERT INTO pets VALUES (NULL, 'Basil', '2012-08-06', 6, 2);
INSERT INTO pets VALUES (NULL, 'Rosy', '2011-04-17', 2, 3);
INSERT INTO pets VALUES (NULL, 'Jewel', '2010-03-07', 2, 3);
INSERT INTO pets VALUES (NULL, 'Iggy', '2010-11-30', 3, 4);
INSERT INTO pets VALUES (NULL, 'George', '2010-01-20', 4, 5);
INSERT INTO pets VALUES (NULL, 'Samantha', '2012-09-04', 1, 6);
INSERT INTO pets VALUES (NULL, 'Max', '2012-09-04', 1, 6);
INSERT INTO pets VALUES (NULL, 'Lucky', '2011-08-06', 5, 7);
INSERT INTO pets VALUES (NULL, 'Mulligan', '2007-02-24', 2, 8);
INSERT INTO pets VALUES (NULL, 'Freddy', '2010-03-09', 5, 9);
INSERT INTO pets VALUES (NULL, 'Lucky', '2010-06-24', 2, 10);
INSERT INTO pets VALUES (NULL, 'Sly', '2012-06-08', 1, 10);

INSERT INTO visits VALUES (NULL, 7, '2013-01-01', 'rabies shot');
INSERT INTO visits VALUES (NULL, 8, '2013-01-02', 'rabies shot');
INSERT INTO visits VALUES (NULL, 8, '2013-01-03', 'neutered');
INSERT INTO visits VALUES (NULL, 7, '2013-01-04', 'spayed');
