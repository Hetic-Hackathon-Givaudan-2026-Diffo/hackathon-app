# 0003. Utiliser React avec Vite pour le front

- Statut : acceptée
- Date : 2026-11-09
- Décideurs : Erica

## Contexte

Le prototype est présenté dans une vidéo de deux minutes et testé par le jury : il affiche surtout des graphiques et un tableau de bord. Une seule développeuse web code le front ; les Product et les Data n'y contribuent pas. Le front est en TypeScript (ADR 0001) et construit avec Vite.

## Options

1. React : s'installe dans Vite, sans changer le dev container ni la CI. Beaucoup de bibliothèques de graphiques. Peu de structure imposée.
2. Angular : une structure imposée, utile quand plusieurs développeurs partagent le code. Son propre outil (Angular CLI) remplace Vite, et beaucoup de concepts à apprendre seule.
3. Vite sans framework : rien à apprendre. Chaque graphique, formulaire et état de l'écran est à coder à la main.

## Décision

Nous choisissons React avec Vite et TypeScript, parce qu'une seule personne code le front et qu'il faut des graphiques rapidement.

## Conséquences

- Positives : des composants de graphiques prêts pour la démo ; les scripts `dev` et `build` de `web/` ne changent pas.
- Négatives, à accepter : React n'impose pas d'organisation des dossiers, nos conventions doivent être écrites dans `AGENTS.md`.
- À revoir si : un deuxième développeur web rejoint l'équipe et connaît mieux un autre framework.
