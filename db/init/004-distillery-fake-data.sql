-- Données simulées : trois tubes fictifs, tirés de la maquette de l'écran 3.
-- Aucune donnée réelle. Toutes les lignes portent simulated = true.

INSERT INTO tubes (slug, name, kind, simulated) VALUES
  ('yuzu-patisserie', 'Yuzu en pâtisserie', 'catalogue', true),
  ('pistache', 'Pistache', 'catalogue', true),
  ('cafe-cardamome', 'Café cardamome', 'new', true);

-- Verdicts des tubes, avec la lecture de l'IA (simulée)
INSERT INTO verdicts
  (tube_id, verdict, reasons, confidence, ai_summary, ai_what_would_change, simulated)
SELECT t.id, v.verdict, v.reasons, v.confidence, v.ai_summary, v.ai_what_would_change, true
FROM (VALUES
  (
    'yuzu-patisserie', 'durable',
    ARRAY['7 gouttes sur 9 sont durables, dans plusieurs villes et plusieurs types de sources.'],
    0.82,
    'Le yuzu s’installe en pâtisserie : on le retrouve sur des cartes de restaurant, en boulangerie et en grande surface, sur plus d’un an. Les deux pics sur les réseaux sociaux n’expliquent pas la tendance, ils l’accompagnent.',
    'Un recul du yuzu dans les cartes de saison du printemps, ou un retrait des produits en grande surface, ferait passer le tube en buzz.'
  ),
  (
    'pistache', 'buzz',
    ARRAY['4 gouttes sur 6 viennent d’un seul pic sur les réseaux sociaux.'],
    0.67,
    'La pistache vit un pic porté par une recette virale. Les signaux durables existent mais restent rares : la hausse tient surtout à quelques semaines de vidéos.',
    'Une présence stable de la pistache dans les gammes permanentes des marques, au-delà de l’été, ferait passer le tube en durable.'
  ),
  (
    'cafe-cardamome', 'durable',
    ARRAY['3 gouttes sur 5 sont durables, mais elles sont encore peu nombreuses.'],
    0.58,
    'Le café à la cardamome apparaît dans des cafés de spécialité et dans une gamme de capsules. Les signaux sont encore peu nombreux : la lecture est fragile.',
    'Si les cafés de spécialité retirent la boisson de leur carte d’hiver, le tube passerait en buzz.'
  )
) AS v (slug, verdict, reasons, confidence, ai_summary, ai_what_would_change)
JOIN tubes t ON t.slug = v.slug;

-- Les gouttes (signaux), chacune avec son verdict et au moins une raison
WITH drops (slug, observed_on, place, source_type, text, verdict, reasons) AS (
  VALUES
    -- yuzu-patisserie : 9 gouttes, 7 durables, 2 buzz
    ('yuzu-patisserie', DATE '2025-10-02', 'Paris', 'Carte de restaurant',
      'Tarte au yuzu ajoutée à la carte permanente d’un bistrot du 11e.', 'durable',
      ARRAY['Ajout à la carte permanente, pas à une carte éphémère.']),
    ('yuzu-patisserie', DATE '2025-12-11', 'Lyon', 'Boulangerie',
      'Éclair yuzu proposé toute l’année dans trois boutiques d’une même enseigne.', 'durable',
      ARRAY['Produit présent toute l’année, dans plusieurs boutiques.']),
    ('yuzu-patisserie', DATE '2026-02-20', 'Bordeaux', 'Grande surface',
      'Entremets yuzu framboise référencé au rayon surgelés.', 'durable',
      ARRAY['Référencement en grande surface : un engagement sur plusieurs mois.']),
    ('yuzu-patisserie', DATE '2026-03-08', 'France', 'Réseaux sociaux',
      'Vidéo de cheesecake au yuzu partagée massivement pendant une semaine.', 'buzz',
      ARRAY['Pic court, sans suite visible dans les points de vente.']),
    ('yuzu-patisserie', DATE '2026-04-15', 'Marseille', 'Carte de restaurant',
      'Deux restaurants proposent un dessert au yuzu sur leur carte de printemps.', 'durable',
      ARRAY['Deuxième saison de suite avec un dessert au yuzu dans la ville.']),
    ('yuzu-patisserie', DATE '2026-05-27', 'Lille', 'Presse spécialisée',
      'Article sur le yuzu comme agrume de référence des chefs pâtissiers.', 'durable',
      ARRAY['Presse professionnelle, lue par les acheteurs.']),
    ('yuzu-patisserie', DATE '2026-06-30', 'France', 'Réseaux sociaux',
      'Défi « macaron yuzu » relayé par des comptes de cuisine amateurs.', 'buzz',
      ARRAY['Défi viral, porté par un petit nombre de comptes.']),
    ('yuzu-patisserie', DATE '2026-08-19', 'Nantes', 'Boulangerie',
      'Une boulangerie artisanale remplace le citron par le yuzu dans sa tarte.', 'durable',
      ARRAY['Remplacement d’un produit existant, pas un ajout ponctuel.']),
    ('yuzu-patisserie', DATE '2026-10-05', 'Toulouse', 'Grande surface',
      'Une marque de distributeur lance des madeleines au yuzu.', 'durable',
      ARRAY['Lancement par une marque de distributeur, signe d’une demande installée.']),

    -- pistache : 6 gouttes, 2 durables, 4 buzz
    ('pistache', DATE '2026-03-12', 'Paris', 'Pâtisserie',
      'Une pâtisserie garde son flan pistache à la carte depuis deux ans.', 'durable',
      ARRAY['Produit présent depuis deux ans.']),
    ('pistache', DATE '2026-06-02', 'France', 'Réseaux sociaux',
      'Recette virale de tablette de chocolat fourrée pistache.', 'buzz',
      ARRAY['Pic lié à une seule recette virale.']),
    ('pistache', DATE '2026-06-18', 'France', 'Recherches en ligne',
      'Les recherches « chocolat pistache » triplent en deux semaines.', 'buzz',
      ARRAY['Hausse très rapide, typique d’un effet de mode.']),
    ('pistache', DATE '2026-07-04', 'Lyon', 'Grande surface',
      'Rupture de stock d’une tablette pistache en édition limitée.', 'buzz',
      ARRAY['Édition limitée, sans engagement dans la durée.']),
    ('pistache', DATE '2026-07-22', 'Nice', 'Glacier',
      'Un glacier ajoute un parfum pistache kadayif pour l’été.', 'buzz',
      ARRAY['Parfum de saison, retiré à la rentrée.']),
    ('pistache', DATE '2026-09-10', 'Strasbourg', 'Carte de restaurant',
      'Un restaurant inscrit un dessert pistache à sa carte d’automne.', 'durable',
      ARRAY['Présence maintenue après le pic de l’été.']),

    -- cafe-cardamome : 5 gouttes, 3 durables, 2 buzz
    ('cafe-cardamome', DATE '2026-01-14', 'Paris', 'Café de spécialité',
      'Un café de spécialité sert un latte cardamome toute l’année.', 'durable',
      ARRAY['Boisson à la carte permanente.']),
    ('cafe-cardamome', DATE '2026-04-03', 'France', 'Réseaux sociaux',
      'Tutoriel de café cardamome maison partagé par un influenceur.', 'buzz',
      ARRAY['Signal isolé, porté par un seul compte.']),
    ('cafe-cardamome', DATE '2026-06-21', 'Rennes', 'Café de spécialité',
      'Un deuxième café de spécialité ajoute la cardamome à sa carte.', 'durable',
      ARRAY['Adoption par un deuxième établissement, dans une autre ville.']),
    ('cafe-cardamome', DATE '2026-09-01', 'France', 'Grande surface',
      'Une marque lance des capsules café cardamome en gamme permanente.', 'durable',
      ARRAY['Gamme permanente, pas une édition limitée.']),
    ('cafe-cardamome', DATE '2026-10-20', 'Montpellier', 'Recherches en ligne',
      'Hausse ponctuelle des recherches « café cardamome » après une émission.', 'buzz',
      ARRAY['Hausse liée à une émission, retombée en une semaine.'])
),
inserted AS (
  INSERT INTO signaux (tube_id, observed_on, place, source_type, text, simulated)
  SELECT t.id, d.observed_on, d.place, d.source_type, d.text, true
  FROM drops d
  JOIN tubes t ON t.slug = d.slug
  RETURNING id, tube_id, text
)
INSERT INTO verdicts (tube_id, signal_id, verdict, reasons, simulated)
SELECT i.tube_id, i.id, d.verdict, d.reasons, true
FROM inserted i
JOIN drops d ON d.text = i.text;
