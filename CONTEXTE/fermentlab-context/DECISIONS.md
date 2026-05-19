# DECISIONS.md

Journal des décisions techniques et produit.

## 2026-05-19 — Positionnement comme journal expérimental

### Décision

FermentLab est conçu comme un journal expérimental de fermentation, pas comme une application de recettes.

### Contexte

Le besoin principal est de comparer les batchs dans le temps et de comprendre l'impact des paramètres sur le produit fini.

### Alternatives envisagées

- App de recettes classique.
- Carnet de notes libre.
- Dashboard IoT avec capteurs.

### Raison du choix

Le journal expérimental permet une collecte structurée et exploitable par IA, tout en restant simple et local-first.

### Conséquences

- Le batch devient l'entité centrale.
- Les données doivent être typées et horodatées.
- Les notes libres restent secondaires.

### Impact IA

- Impact sur la complexité du projet : modéré mais contrôlé.
- Impact sur le coût de maintenance IA : favorable si le modèle reste simple.
- Impact sur la quantité de contexte nécessaire : faible à modéré.
- Impact sur `PROJECT_MAP.md` : nécessite documentation claire des entités.

## 2026-05-19 — Modèle batch/phases/mesures/observations/événements

### Décision

Le modèle de données distingue batchs, phases, mesures, observations structurées et événements de process.

### Contexte

Kombucha et kéfir nécessitent notamment F1/F2/mise au froid. Le levain nécessite des étapes comme nourrissage, pousse, pic, retombée.

### Alternatives envisagées

- Observations génériques uniquement.
- Champs spécifiques pour chaque fermentation.
- Notes libres enrichies.

### Raison du choix

La séparation rend les données comparables, filtrables et exploitables par IA future.

### Conséquences

- Une timeline de batch peut combiner différents types d'entrées.
- L'UI doit proposer des actions rapides.
- Les profils de fermentation suggèrent les phases et événements pertinents.

### Impact IA

- Impact sur la complexité du projet : modéré.
- Impact sur le coût de maintenance IA : favorable.
- Impact sur la quantité de contexte nécessaire : limité si les types sont bien documentés.
- Impact sur `PROJECT_MAP.md` : création de features séparées.

## 2026-05-19 — Zod non inclus en MVP

### Décision

Zod n'est pas installé pour le MVP initial.

### Contexte

Les types sont statiques et définis en TypeScript. Les formulaires MVP sont simples (peu de champs). Dexie stocke directement les objets typés.

### Raison du choix

TypeScript fourni une sécurité compile-time suffisante pour le MVP. Zod sera ajouté si des formulaires complexes ou des imports JSON non fiables sont introduits.

### Conséquences

- Pas de validation runtime des formulaires pour l'instant.
- Ajouter Zod en v1 pour l'import JSON et les formulaires d'ingrédients.

## 2026-05-19 — CultureSnapshot en MVP plutôt qu'entité Culture complète

### Décision

En MVP, l'état de la culture au démarrage est stocké comme `CultureSnapshot` dans le batch.

### Contexte

Le temps de réfrigération de la culture, le dernier nourrissage et l'activité perçue influencent fortement le résultat.

### Alternatives envisagées

- Entité `Culture` indépendante dès le MVP.
- Simple champ texte dans les paramètres initiaux.

### Raison du choix

Le snapshot est simple, exploitable et migrable plus tard vers une vraie entité `Culture`.

### Conséquences

- Le MVP reste simple.
- Les données importantes sont déjà structurées.
- Une future v2 pourra historiser les cultures.

### Impact IA

- Impact sur la complexité du projet : faible.
- Impact sur le coût de maintenance IA : favorable.
- Impact sur la quantité de contexte nécessaire : faible.
- Impact sur `PROJECT_MAP.md` : documenter `cultureSnapshot` dans batches.
