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

---

## 2026-05-19 — Calculs métier isolés dans lib/calculations.ts, non persistés

### Décision

Les calculs dérivés (durée, ABV estimé, ratio contenant, stats température/pH) sont implémentés comme fonctions pures dans `src/lib/calculations.ts`. Leurs résultats ne sont jamais écrits en base (ni dans `measurements`, ni dans `derivedMetrics`).

### Contexte

Les données de base (phases, mesures) suffisent à calculer les indicateurs à la volée. Persister les résultats calculés créerait un risque de désynchronisation avec les données brutes.

### Alternatives envisagées

- Persister les résultats dans la table `derivedMetrics` pour les réutiliser.
- Calculer directement dans les composants React.

### Raison du choix

Les calculs sont suffisamment rapides pour être effectués à chaque rendu. Les fonctions pures sont testables et réutilisables.

### Conséquences

- `estimateAbvFromDensity` retourne `null` si OG ou FG manque, ou si OG ≤ FG (incohérence).
- L'ABV est affiché comme estimation uniquement.
- `getPhaseDurationByType` utilise la date actuelle si la phase est active.

### Impact IA

- Impact sur la complexité : faible.
- Impact sur la maintenance IA : très favorable — pas d'état caché en base.

---

## 2026-05-19 — Suppression de la table derivedMetrics (migration Dexie v2)

### Décision

La table `derivedMetrics` est supprimée du schéma IndexedDB (migration v1 → v2).

### Contexte

La table existait dans le schéma v1 mais n'a jamais été alimentée ni lue. La décision de calculer les métriques dérivées à la volée (cf. décision précédente) rend la table inutile.

### Raison du choix

Supprimer une table zombie réduit la confusion pour les développeurs futurs et simplifie `batchRepository.remove()`. La migration est sans risque car la table a toujours été vide.

### Conséquences

- `DerivedMetric` et `DerivedMetricType` supprimés de `shared/types/common.ts`.
- `db.derivedMetrics` supprimé de `database.ts`.
- `batchRepository.remove()` simplifié (plus de suppression des `derivedMetrics`).
- Dexie v2 créé — la migration supprime automatiquement la table vide.

---

## 2026-05-19 — Source unique de vérité pour les ingrédients : table ingredients uniquement

### Décision

Les ingrédients d'un batch sont stockés exclusivement dans la table Dexie `ingredients`. Le champ `initialParameters.ingredients[]` est supprimé du type `InitialParameters`.

### Contexte

Le champ `initialParameters.ingredients` était présent dans le type mais toujours initialisé vide (`[]`) à la création. Les ingrédients réels étaient systématiquement écrits dans la table `ingredients`. L'`exportService` fusionnait les deux sources artificiellement.

### Raison du choix

Supprimer la dualité évite toute confusion sur la source de vérité. L'export est simplifié (lecture directe de la table, sans merge).

### Conséquences

- `InitialParameters.ingredients` retiré du type `Batch`.
- `exportService.buildBatchEntry` : merge supprimé, lecture directe de `db.ingredients`.
- `CreateBatchPage` : `initialParameters: {}` (plus de `ingredients: []`).
- Aucune migration Dexie nécessaire — les ingrédients existants sont déjà dans la table.

---

## 2026-05-19 — Ajout Supabase Auth OTP + préparation Vercel (Étape 15)

### Décision

L'app est préparée pour un déploiement Vercel avec Supabase comme backend Auth et futur stockage distant.

### Contexte

Besoin d'accès mobile multi-appareil et de persistance distante. Le MVP local-first (Dexie) est fonctionnel — la migration vers Supabase sera incrémentale.

### Choix d'auth

OTP email (`signInWithOtp` + `verifyOtp`) — plus simple qu'un mot de passe, compatible webapp mobile, sans OAuth externe.

### Ce qui a été ajouté

- `@supabase/supabase-js` installé.
- `src/lib/supabaseClient.ts` : client via `import.meta.env`.
- `AuthProvider` + `useAuth()` : session réactive via `onAuthStateChange`.
- `AuthPage` : flux email → OTP.
- `ProtectedRoute` : toutes les routes protégées.
- `vercel.json` : rewrite SPA.
- `supabase/schema.sql` : 7 tables + RLS.
- `docs/deployment.md` + `docs/supabase-setup.md`.

### Contraintes respectées

- Dexie non supprimé — migration incrémentale prévue.
- Pas de backend custom.
- Pas de Next.js.
- `service_role` jamais exposé côté frontend.

### Prochaine étape

Migrer les repositories Dexie → Supabase, table par table, en commençant par `batches`.

---

## 2026-05-19 — Centralisation des constantes et helpers partagés

### Décision

Les constantes et helpers dupliqués sont centralisés dans des fichiers dédiés.

### Fichiers créés

- `src/shared/utils/date.ts` — `nowDatetimeLocal()` (heure locale correcte, remplace les 5 copies UTC incorrectes).
- `src/features/observations/constants.ts` — `DESCRIPTOR_LABELS`, `descriptorLabel()`.
- `src/features/batches/constants.ts` — `CULTURE_TYPE_LABELS`.
- `src/features/ingredients/constants.ts` — ajout de `DEFAULT_INGREDIENT_UNITS`.

### Conséquences

- `nowDatetimeLocal()` corrige silencieusement un bug : les implémentations précédentes utilisaient `toISOString().slice(0,16)` (UTC), la version centralisée utilise les méthodes locales (heure du navigateur).
- `DESCRIPTOR_LABELS` et `CULTURE_TYPE_LABELS` ne sont plus définis localement dans les composants.
