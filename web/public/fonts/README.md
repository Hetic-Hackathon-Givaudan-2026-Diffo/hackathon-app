# Polices servies en local

La démo doit marcher sans Internet : les polices sont dans le dépôt, sans dépendance npm. Elles sont déclarées par `@font-face` dans `web/src/ui/styles/theme.css`.

| Fichier                                | Police                       | Usage                       |
| -------------------------------------- | ---------------------------- | --------------------------- |
| `fraunces-latin-wght-normal.woff2`     | Fraunces, variable 100 à 900 | Titres                      |
| `fraunces-latin-wght-italic.woff2`     | Fraunces italique, variable  | Verdict, accents            |
| `ibm-plex-sans-latin-400-normal.woff2` | IBM Plex Sans 400            | Texte                       |
| `ibm-plex-sans-latin-600-normal.woff2` | IBM Plex Sans 600            | Texte appuyé                |
| `ibm-plex-mono-latin-*-normal.woff2`   | IBM Plex Mono 400, 500, 600  | Dates, chiffres, étiquettes |

- Source : paquets Fontsource 5.3.0 (`@fontsource-variable/fraunces`, `@fontsource/ibm-plex-sans`, `@fontsource/ibm-plex-mono`), téléchargés depuis cdn.jsdelivr.net.
- Sous-ensemble latin seulement : il couvre le français (accents, guillemets, apostrophe typographique).
- Licence : SIL Open Font License 1.1, texte complet dans les fichiers `OFL-*.txt`, à garder avec les polices.
