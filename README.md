# Hackathon App

Application web qui répond aux questions des utilisateurs grâce à une IA, et garde l'historique en base de données.

## La stack

- **API** : Node.js 24 + TypeScript + Express, dans `api/`
- **Front** : TypeScript + Vite, dans `web/`
- **Base de données** : PostgreSQL 17 · **IA** : Ollama (modèle `llama3.2:1b`) en local, un fournisseur commercial possible pour la démo

Tout tourne dans un **dev container** : un environnement identique pour toute l'équipe, sur macOS, Windows et Linux. Vous n'installez ni Node ni PostgreSQL sur votre ordinateur.

---

## Lancer la démo

Pour voir l'application sans VS Code : il suffit de **Docker** (Docker Desktop, ou Docker Engine avec Compose 2.24 ou plus).

```bash
git clone git@github.com:Hetic-Hackathon-Givaudan-2026-Diffo/hackathon-app.git
cd hackathon-app
docker compose up
```

Ouvrez **http://localhost:5173** quand le service `web` est prêt (`docker compose ps` l'affiche `healthy`). La première fois, comptez quelques minutes : Docker télécharge les images et installe les dépendances.

`docker compose up` démarre, dans l'ordre :

| Service | Rôle                                                  | Adresse               |
| ------- | ----------------------------------------------------- | --------------------- |
| `db`    | PostgreSQL, avec le schéma et les données simulées    | interne               |
| `ia`    | le service Data (FastAPI)                             | http://localhost:8000 |
| `deps`  | installe les dépendances Node une fois, puis s'arrête | aucune                |
| `api`   | l'API, une fois la base prête                         | http://localhost:3000 |
| `web`   | le front, une fois l'API prête                        | http://localhost:5173 |

- **Arrêter** : `Ctrl+C`, ou `docker compose down` depuis un autre terminal.
- **Repartir d'une base vide** : `docker compose down`, supprimez `db/data/`, puis `docker compose up`.
- **Configuration de l'API** : les valeurs de `api/.env.example`, remplacées par celles de `api/.env` s'il existe. Aucun fichier `.env` n'est nécessaire.
- **Ports** : 3000, 5173 et 8000 doivent être libres. Ne lancez pas `npm run dev` dans le dev container en même temps que la démo.

---

## 1. Installer les prérequis (une seule fois)

| Outil                                                                 | Où le trouver         |
| --------------------------------------------------------------------- | --------------------- |
| **Docker Desktop** (macOS, Windows) ou Docker Engine (Linux)          | docker.com            |
| **VS Code** + l'extension **Dev Containers**                          | code.visualstudio.com |
| **Git**, avec votre nom, votre e-mail et une clé SSH ajoutée à GitHub | git-scm.com           |
| **Ollama**, puis le modèle : `ollama pull llama3.2:1b`                | ollama.com/download   |

> **Sous Windows** : activez le moteur **WSL 2** dans Docker Desktop, et travaillez **dans WSL** (terminal Ubuntu), jamais dans `C:\`. Sinon la base de données refuse souvent de démarrer.
>
> **Sous Linux** : Ollama doit écouter sur toutes les interfaces (`OLLAMA_HOST=0.0.0.0`, voir la FAQ d'Ollama).

## 2. Démarrer le projet (15 minutes)

**Étape 1 : cloner le dépôt** (sous Windows, dans un terminal Ubuntu/WSL)

```bash
git clone git@github.com:Hetic-Hackathon-Givaudan-2026-Diffo/hackathon-app.git
code hackathon-app
```

**Étape 2 : ouvrir dans le conteneur**

Dans VS Code : `F1` → **Dev Containers: Reopen in Container**. La première fois, comptez quelques minutes. Les dépendances et le fichier `api/.env` sont créés automatiquement.

**Étape 3 : lancer l'application**

Dans le terminal de VS Code :

```bash
npm run dev
```

Ouvrez **http://localhost:5173** : la page affiche « API OK · PostgreSQL 17… ». Posez une question à l'IA, la réponse s'affiche et s'enregistre en base.

---

## 3. Les commandes utiles

Toutes se tapent dans le terminal de VS Code, **dans le conteneur**.

| Commande                              | Rôle                                            |
| ------------------------------------- | ----------------------------------------------- |
| `npm run dev`                         | lance l'API (port 3000) et le front (port 5173) |
| `npm run lint`                        | cherche les erreurs dans le code                |
| `npm run format`                      | met le code en forme                            |
| `npm run build`                       | vérifie que tout compile                        |
| `psql postgres://app:app@db:5432/app` | ouvre la base de données (`\q` pour quitter)    |

## 4. Changer de fournisseur d'IA

La configuration est dans `api/.env` (jamais envoyé sur GitHub). Les options sont décrites dans `api/.env.example`. Après une modification, relancez `npm run dev`.

> ⚠️ Ne commitez **jamais** une clé d'API. Une clé publiée doit être révoquée immédiatement chez le fournisseur.

## 5. Contribuer

On ne pousse jamais directement sur `main` ni sur `develop` : GitHub le refuse.

1. Partez de `develop` à jour : `git switch develop && git pull`
2. Créez une branche : `git switch -c feature/ma-tache`
3. Commitez **depuis le conteneur** : un contrôle automatique refuse le commit s'il y a une erreur.
4. Poussez, puis ouvrez une **pull request vers `develop`**. Elle ne peut être fusionnée que si la vérification **`qualite`** est verte.

| Branche     | Rôle                                |
| ----------- | ----------------------------------- |
| `main`      | ce qui est démontrable              |
| `develop`   | l'intégration, branche par défaut   |
| `feature/*` | une tâche, un ou deux jours au plus |

## 6. En cas de problème

| Symptôme                        | Solution                                                                             |
| ------------------------------- | ------------------------------------------------------------------------------------ |
| Le conteneur ne démarre pas     | `F1` → **Dev Containers: Show Container Log**, puis **Rebuild Container**            |
| `Permission denied (publickey)` | sur votre machine, `ssh-add -l` doit lister votre clé ; sinon `ssh-add`              |
| La page ne répond pas           | dans VS Code, l'onglet **Ports** doit afficher 3000 et 5173                          |
| L'IA ne répond pas              | Ollama doit tourner sur votre machine : `ollama list`                                |
| Repartir d'une base propre      | `F1` → **Reopen Folder Locally**, supprimez `db/data/`, puis **Reopen in Container** |
