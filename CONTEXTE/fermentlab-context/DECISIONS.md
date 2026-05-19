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

## 2026-05-19 — Stockage local-first avec IndexedDB + Dexie

### Décision

Toutes les données sont stockées localement dans le navigateur via IndexedDB, exposé par Dexie.js.

### Contexte

Usage personnel, contexte cuisine, offline souhaité. Aucun besoin de synchronisation multi-device en MVP.

### Alternatives envisagées

- SQLite via WASM.
- localStorage (trop limité pour des entités relationnelles).
- Backend REST + base de données distante.

### Raison du choix

IndexedDB est natif, offline-first, sans serveur, et Dexie offre une API TypeScript propre avec `useLiveQuery` pour les mises à jour réactives.

### Conséquences

- Pas de backend à maintenir.
- Données accessibles hors ligne.
- Migrations gérées manuellement via `db.version()`.
- Pas de synchronisation multi-device sans ajout futur.

### Impact IA

- Impact sur la complexité : faible.
- Impact sur la maintenance IA : favorable — pas de backend à comprendre.

---

## 2026-05-19 — Pas de backend, pas de cloud, pas d'IA intégrée en MVP

### Décision

Le MVP n'inclut aucun backend distant, aucune synchronisation cloud, aucune IA intégrée.

### Contexte

Usage personnel, données sensibles (habitudes alimentaires), complexité disproportionnée pour un MVP local.

### Alternatives envisagées

- Supabase (backend léger).
- Firebase.
- API Claude intégrée pour suggestions.

### Raison du choix

Pas de valeur ajoutée en MVP. L'IA sera utilisée en dehors de l'app via export JSON. Le backend peut être ajouté plus tard si le besoin de synchronisation émerge.

### Conséquences

- Pas d'authentification à gérer.
- Pas de coût d'infrastructure.
- Export JSON comme seul pont vers les LLMs.

### Impact IA

- Impact sur la complexité : nul pour le MVP.
- Impact sur la maintenance IA : très favorable.

---

## 2026-05-19 — Timeline comme vue centrale du détail batch

### Décision

Le détail d'un batch s'organise autour d'une timeline qui combine phases, mesures, observations et événements par ordre chronologique.

### Contexte

Une fermentation est un processus temporel. L'utilisateur doit voir d'un coup d'œil l'enchaînement des étapes et leur contenu.

### Alternatives envisagées

- Onglets séparés par type d'entrée (mesures | observations | événements).
- Liste plate sans notion de phase.

### Raison du choix

La timeline reflète la réalité du process et facilite la corrélation visuelle entre événements et données. Elle prépare aussi les futurs graphiques.

### Conséquences

- `BatchDetailPage` doit agréger et trier par timestamp des entités hétérogènes.
- Chaque entité liée au batch doit avoir un `timestamp` et un `phaseId` optionnel.
- Les composants `PhaseManager`, `QuickAddPanel` et `TimelineView` doivent être découplés.

### Impact IA

- Impact sur la complexité : modéré — agrégation multi-tables.
- Impact sur la maintenance IA : acceptable si les composants sont bien découpés.

---

## 2026-05-19 — Export JSON versionné planifié dès le MVP

### Décision

Un export JSON structuré et versionné est planifié dès le MVP, même si son implémentation est différée.

### Contexte

Le but à long terme est d'exploiter les données de fermentation avec un LLM pour analyser les corrélations (paramètres initiaux → résultats finaux).

### Alternatives envisagées

- Export CSV (moins riche).
- API REST pour connexion directe LLM (complexité disproportionnée).
- Copie manuelle des données.

### Raison du choix

Un JSON par batch, bien structuré, suffit pour qu'un LLM analyse les données sans preprocessing. La clé est que le schéma soit stable et documenté.

### Conséquences

- `schemaVersion` dans chaque batch dès maintenant.
- Toutes les unités doivent être explicites dans les objets.
- `DerivedMetric` doit rester séparé pour ne pas polluer les données brutes.
- Feature `export` prévue dans `src/features/export/`.

### Impact IA

- Impact sur la complexité : faible si implémenté proprement.
- Impact sur la maintenance IA : très favorable à long terme.

---

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
