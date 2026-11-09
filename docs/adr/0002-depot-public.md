# 0002. Garder le dépôt GitHub public

- Statut : acceptée
- Date : 2026-11-09
- Décideurs : Erica, Juan-Salvador, Flora, Valentin, Jae-heun

## Contexte

Le règlement du concours impose la confidentialité jusqu'à l'annonce des gagnants : rien en public sur le projet, et le prototype n'est jamais publié en ligne. L'équipe n'a pas de budget. Avec le plan gratuit de GitHub, les branches protégées et le ruleset ne fonctionnent que sur un dépôt public.

## Options

1. Dépôt public, organisation gratuite : 0 €, branches protégées et minutes de CI gratuites. Tout ce qui est poussé est visible par tous.
2. Dépôt privé avec le plan GitHub Team : le code reste caché. Payant par utilisateur et par mois, sauf si l'enseignant l'obtient via GitHub Education.
3. Dépôt privé avec le plan gratuit : le code reste caché, sans coût. Plus de branches protégées : n'importe qui peut pousser sur `main` et `develop`.

## Décision

Nous gardons le dépôt public, parce que l'équipe n'a pas de budget et que la protection de `main` et `develop` est indispensable à cinq.

## Conséquences

- Positives : aucun coût ; le ruleset et la CI `qualite` restent actifs.
- Négatives, à accepter : le dépôt ne contient que le code et les données fictives. Le concept, les hypothèses, les slides et la vidéo restent dans le Notion privé de l'équipe. Le README décrit le projet sans détail du brief.
- À revoir si : l'enseignant obtient le plan Team via GitHub Education, ou si le code lui-même révèle le concept avant les résultats.
