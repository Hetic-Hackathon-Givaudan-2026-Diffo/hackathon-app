# Polices servies en local

La démo doit marcher sans Internet : la police est dans le dépôt, sans dépendance npm. Elle est déclarée par `@font-face` dans `web/src/ui/styles/theme.css`.

Une seule famille sur tous les écrans : IBM Plex Sans. La hiérarchie passe par la taille et la graisse. Les chiffres et les dates utilisent `font-variant-numeric: tabular-nums` pour rester alignés.

| Fichier                                | Police            | Usage                |
| -------------------------------------- | ----------------- | -------------------- |
| `ibm-plex-sans-latin-400-normal.woff2` | IBM Plex Sans 400 | Texte                |
| `ibm-plex-sans-latin-600-normal.woff2` | IBM Plex Sans 600 | Titres, texte appuyé |

- Source : paquet Fontsource 5.3.0 (`@fontsource/ibm-plex-sans`), téléchargé depuis cdn.jsdelivr.net.
- Sous-ensemble latin seulement : il couvre le français (accents, guillemets, apostrophe typographique).
- Licence : SIL Open Font License 1.1, texte complet dans `OFL-IBM-Plex-Sans.txt`, à garder avec la police.
