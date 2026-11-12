-- Thèmes des tubes, pour le filtre « Thème » de la Distillerie.
-- Ajout au schéma de 003 : à signaler à l'équipe Data, qui écrit dans tubes.
-- Plusieurs thèmes par tube ; un tableau vide veut dire « sans thème ».

ALTER TABLE tubes ADD COLUMN themes TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX tubes_themes_idx ON tubes USING GIN (themes);

-- Données simulées
UPDATE tubes SET themes = ARRAY['Pâtisseries'] WHERE slug = 'yuzu-patisserie';
UPDATE tubes SET themes = ARRAY['Pâtisseries', 'Confiserie'] WHERE slug = 'pistache';
UPDATE tubes SET themes = ARRAY['Cafétéria', 'Boissons'] WHERE slug = 'cafe-cardamome';
