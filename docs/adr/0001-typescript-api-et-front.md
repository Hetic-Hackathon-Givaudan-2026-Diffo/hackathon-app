# 0001. Écrire l'API et le front en TypeScript, la Data/IA reste en Python

- Statut : acceptée
- Date : 2026-11-08
- Décideurs : Erica Diffo (tech-lead)

## Contexte

- Cet environnement a été préparé en une journée de TP, avant le hackathon.
  Le hackathon durera deux semaines, et le produit proposera des services assistés par l'IA. Le sujet précis n'est pas encore connu.

- L'équipe du hackathon n'est pas encore formée.
  Elle réunira des tech-leads (développement web), des profils Data/IA (Python, notebooks, modèles) et des profils Product (qui ne codent pas).
- Les machines de l'équipe ne sont pas encore connues : Windows, Mac ou Linux. L'environnement a été testé sur un PC Windows (x86_64) et un Mac Pro 2021.
  Tout tourne dans le dev container, avec Node 24 et Debian trixie, comme en production.
- Le squelette de test fonctionne : `api/` (Express), `web/` (Vite), espaces de travail npm, PostgreSQL 17, un appel à l'IA via Ollama, ESLint, Prettier et la CI `qualite`.

## Options

1. **TypeScript pour l'API et le front, Python pour la Data/IA dans son propre service.**
   Un seul langage côté web, typé du serveur à l'écran. La Data/IA garde ses outils.
   Inconvénient : deux langages dans le projet, donc un contrat d'API à tenir entre les deux.
2. **Python partout : l'API en FastAPI, à côté du code Data/IA.**
   Un seul langage pour le backend et la Data.
   Inconvénient : le front reste en JavaScript de toute façon, le dev container et la CI sont à refaire, et l'API dépendrait du rythme de l'équipe Data.
3. **Choisir dès maintenant les frameworks définitifs (par exemple NestJS et Angular).**
   Une structure imposée dès le départ.
   Inconvénient : le sujet et les équipes Data/IA et Product ne sont pas encore connus. Ce serait décider seule, avant de savoir ce que le prototype doit montrer.

## Décision

Nous choisissons l'option 1. L'API reste en Express et le front en Vite, en TypeScript, dans le monolithe `api/` + `web/` déjà testé. La Data/IA pourra écrire son service en Python (FastAPI) et l'exposer par une API documentée, que notre API appellera comme un fournisseur d'IA de plus.

Raisons : l'environnement fonctionne déjà, de l'écran à la base et à l'IA. Chaque équipe pourra coder dans le langage qu'elle maîtrise, et la Data/IA avancera sans attendre nos pull requests.

## Conséquences

- Positives : un npm run dev lance l'API et le front ; les erreurs de type sont détectées avant la démo.
- Négatives, à accepter : deux langages dans le projet, donc un contrat d'API à tenir avec la Data/IA.
- À revoir si : le sujet demande des écrans riches. Le framework du front (Angular, par exemple) fera alors l'objet d'un nouvel ADR.
