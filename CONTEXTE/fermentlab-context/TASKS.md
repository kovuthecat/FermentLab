# TASKS.md

Backlog actif. Frontières : **TASKS** = actions concrètes · `STATUS.md` = état T · `ROADMAP.md` = vision.

## Règles

- Une tâche = une intention claire.
- Une tâche doit idéalement modifier peu de fichiers.
- Éviter les tâches vagues ou trop larges.
- Découper avant implémentation.
- Chaque tâche doit être validable indépendamment.
- Une tâche Claude Code doit être suffisamment précise pour limiter l'exploration du repo.
- Si une tâche nécessite un arbitrage large, repasser par ChatGPT avant implémentation.
- Si les fichiers concernés sont inconnus, commencer par une investigation sans modification.

## En cours

Aucune.

## Fait (récent — Étape 16 — Migration Supabase source de vérité)

- [x] `src/lib/refresh.ts` : `triggerRefresh()` + `useDataVersion()` (pub-sub pour réactivité post-mutation).
- [x] `src/lib/getCurrentUserId.ts` : helper `supabase.auth.getUser()`.
- [x] `batchRepository` : `create`, `get`, `list`, `close`, `remove` → Supabase + `triggerRefresh`.
- [x] `phaseRepository` : `add`, `listByBatch`, `findActiveByType`, `findActiveByBatch`, `close`, `remove` → Supabase.
- [x] `ingredientRepository` : `add`, `bulkAdd`, `listByBatch`, `remove` → Supabase.
- [x] `measurementRepository` : `add`, `listByBatch`, `update`, `remove` → Supabase.
- [x] `observationRepository` : `add`, `listByBatch`, `update`, `remove` → Supabase.
- [x] `processEventRepository` : `add`, `listByBatch`, `update`, `remove` → Supabase.
- [x] `finalEvaluationRepository` : `save` (insert/update), `getByBatch` → Supabase.
- [x] `useBatch` (nouveau hook) : charge batch depuis Supabase via `useDataVersion`.
- [x] 6 hooks (`usePhases`, `useMeasurements`, `useObservations`, `useProcessEvents`, `useIngredients`, `useFinalEvaluation`) : `useLiveQuery` → `useState + useEffect + useDataVersion`.
- [x] `DashboardPage` : `useLiveQuery` → `useState + useEffect + batchRepository.list`.
- [x] `CreateBatchPage` : `db.batches.add` / `db.ingredients.bulkAdd` → `batchRepository.create` / `ingredientRepository.bulkAdd`.
- [x] `BatchDetailPage` : `useLiveQuery(db.batches.get)` → `useBatch`.
- [x] `ComparisonPage` : `useLiveQuery` → `useState + useEffect + useDataVersion`.
- [x] `comparisonService` : `db.batches` → `batchRepository.list`.
- [x] `exportService` : `db.batches.get/orderBy` + `db.ingredients` → repositories Supabase.
- [x] Build ✓ (573 KB). Lint ✓.

## Fait (récent — Étape 15 — Déploiement Vercel + Supabase OTP)

- [x] `vercel.json` : rewrite `/(.*) → /index.html` (routing SPA en production).
- [x] `.env.example` : `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`.
- [x] `npm install @supabase/supabase-js`.
- [x] `src/lib/supabaseClient.ts` : `createClient` via `import.meta.env`.
- [x] `src/features/auth/AuthProvider.tsx` : contexte `session` + `loading`, `onAuthStateChange`, hook `useAuth()`.
- [x] `src/features/auth/AuthPage.tsx` : email step → OTP step (`signInWithOtp` + `verifyOtp`).
- [x] `src/features/auth/ProtectedRoute.tsx` : redirect `/auth` si pas de session.
- [x] `src/main.tsx` : `AuthProvider` wrappé.
- [x] `src/app/routes.tsx` : route `/auth` + routes protégées par `ProtectedRoute`.
- [x] `src/app/App.tsx` : bouton "Déconnexion" (`signOut` + navigate `/auth`).
- [x] `src/index.css` : styles `auth-page`, `auth-card`, `auth-form`, `auth-input`, `auth-btn`, `app-nav-logout`.
- [x] `supabase/schema.sql` : 7 tables avec `user_id`, timestamps, RLS owner-only (4 policies par table).
- [x] `docs/deployment.md` : guide Vercel complet (import repo, variables, redirect URLs, workflow push).
- [x] `docs/supabase-setup.md` : guide Supabase pas à pas (clés, SQL Editor, tables, RLS, OTP email, redirect URLs, test local).
- [x] Build ✓. Lint ✓.

## Fait (récent — Étape 14 — Consolidation UX timeline)

- [x] `shared/utils/date.ts` : `isoToDatetimeLocal(iso)` ajouté (refactorise `nowDatetimeLocal`).
- [x] `measurementRepository` / `observationRepository` / `processEventRepository` : méthode `update()` ajoutée.
- [x] `MeasurementForm` : props `initialMetric`, `defaultTimestamp` ; `onSaved(ts: string)`.
- [x] `ObservationForm` : prop `defaultTimestamp` ; `onSaved(ts: string)`.
- [x] `ProcessEventForm` : prop `defaultTimestamp` ; `onSaved(ts: string)`.
- [x] `BatchTimeline` réécrit :
  - Groupement par jour (header date localisée).
  - Timestamps : heure seule (HH:MM) dans chaque groupe.
  - Badges visuels de phase `[F1]`, `[F2]`, `[FROID]`, `[POUSSE]`, `[REPOS]`, `[APPRET]`, `[BULK]`.
  - Boutons ✏️ / ✕ par entrée (opacity hover sur desktop, toujours visible sur mobile touch).
  - Éditeurs inline spécialisés : MeasurementEditor, ObservationEditor, ProcessEventEditor.
  - Feedback local après modification / suppression.
- [x] `BatchDetailPage` :
  - `ActiveForm` : type étendu avec variantes `"temperature"`, `"ph"` en plus de `"measurement"`.
  - `QuickAddBar` : 5 boutons (`+ Temp.`, `+ pH`, `+ Mesure`, `+ Observation`, `+ Événement`).
  - `lastTimestamp` : propagé de formulaire en formulaire pour timestamp intelligent.
  - `savedFeedback` : toast "Enregistré ✓" après sauvegarde.
  - `key={activeForm}` sur `MeasurementForm` pour reset d'état lors du changement de type.
- [x] `index.css` : styles timeline-day-group, timeline-day-header, timeline-phase-badge, timeline-actions, timeline-edit-btn, timeline-editor, saved-feedback, timeline-feedback.
- [x] Build ✓ (459 KB JS, 16.20 KB CSS). Lint ✓.

## Fait (récent — Étape 13 — Association automatique phaseId)

- [x] `phaseRepository.findActiveByBatch(batchId)` : filtre `endedAt == null`, retourne la phase la plus récente.
- [x] `BatchDetailPage` : calcule `activePhase` depuis les phases déjà chargées (sans requête supplémentaire), passe `activePhaseId/activePhaseName` aux 3 formulaires et `phases` à `BatchTimeline`.
- [x] `MeasurementForm`, `ObservationForm`, `ProcessEventForm` : acceptent `activePhaseId/activePhaseName`, assignent `phaseId` au submit, affichent un indicateur de phase (ou "Aucune phase active").
- [x] `ProcessEventForm` : `nowDatetimeLocal` local remplacé par import `shared/utils/date.ts`.
- [x] `BatchTimeline` : accepte `phases?: Phase[]`, construit `phaseById` map, affiche "Phase : <label>" sur chaque entrée liée.
- [x] `index.css` : classes `.phase-hint` et `.timeline-phase-hint` ajoutées.
- [x] Build ✓ (450 KB) Lint ✓

## Fait (récent — Étape 12 — Consolidation)

- [x] Source unique ingrédients : suppression de `InitialParameters.ingredients`, exportService simplifié.
- [x] Dexie v2 : suppression table `derivedMetrics`, type `DerivedMetric` retiré.
- [x] `shared/utils/date.ts` : `nowDatetimeLocal()` centralisé (corrige bug UTC), remplace 5 copies locales.
- [x] `observations/constants.ts` : `DESCRIPTOR_LABELS` + `descriptorLabel()` centralisés.
- [x] `batches/constants.ts` : `CULTURE_TYPE_LABELS` centralisé.
- [x] `ingredients/constants.ts` : `DEFAULT_INGREDIENT_UNITS` ajouté.
- [x] `IngredientForm` : pré-remplissage automatique de l'unité au changement de type.
- [x] Ingrédients kombucha : defaults corrigés (eau, thé en g, sucre, SCOBY en unit, liquide starter en ml).
- [x] `BatchTimeline` : bouton ✕ sur chaque entrée pour suppression (confirmation native).
- [x] Docs : DECISIONS.md, DATA_MODEL.md, STATUS.md, TASKS.md, PROJECT_MAP.md mis à jour.
- [x] Build ✓ Lint ✓

## Fait (récent — Étape 11)

- [x] ingredientRepository : add / listByBatch / remove.
- [x] useIngredients : useLiveQuery par batchId.
- [x] IngredientForm : formulaire inline ajout ingrédient depuis BatchDetailPage.
- [x] IngredientList : affichage + suppression via useLiveQuery.
- [x] CreateBatchPage : fieldset ingrédients + pré-remplissage par profil + persistance Dexie.
- [x] BatchDetailPage : section ingrédients avec toggle IngredientForm.
- [x] index.css : classes ingredient-draft, ingredient-list, ingredient-item.

## Fait (récent)

## Fait (récent)

- [x] Export JSON versionné : exportService (single_batch + all_batches), types, downloadJson, boutons BatchDetailPage + ComparisonPage.
- [x] ComparisonPage `/comparisons` : tableau filtrable + cartes mobile des batchs terminés/abandonnés.
- [x] comparisonService : agrégation phases/mesures/évaluation → BatchComparisonRow.
- [x] ComparisonFilters : filtres type/statut/succès/àRefaire/scoreMin.
- [x] BatchComparisonTable : tableau desktop (overflow-x) + cartes mobile (< 600 px).
- [x] App.tsx + routes.tsx : route /comparisons + lien "Comparer" dans le header.
- [x] lib/calculations.ts : 9 fonctions de calcul pur (durée, température, pH, densité, ABV, ratio contenant, culture).
- [x] BatchMetricsSummary : composant affichant les métriques calculées sur la page détail batch.
- [x] BatchDetailPage : section "Résumé calculé" intégrée.
- [x] BatchCloseForm : saisie FinalEvaluation + passage status → completed/abandoned.
- [x] finalEvaluationRepository : save (create/update) + getByBatch.
- [x] useFinalEvaluation : hook useLiveQuery par batchId.
- [x] FinalEvaluationDisplay : affichage de l'évaluation finale avec bouton modifier.
- [x] batchRepository.close() : mise à jour status/endedAt/updatedAt.

## À faire

- [x] PhaseManager : démarrer / finir une phase selon le profil, depuis BatchDetailPage.
- [x] BatchCloseForm : saisie FinalEvaluation + passage status → completed.
- [x] Ingrédients dans CreateBatch (IngredientEntry, ajout dynamique).
- [x] ComparisonPage : tableau filtrable des batchs terminés.
- [x] Export JSON versionné (schemaVersion 1.0), depuis BatchDetailPage.
- [ ] lib/dates.ts : utilitaires de formatage de dates.
- [x] lib/calculations.ts : durée totale, F1/F2, ratio surface/profondeur, ABV, pH, température, culture.
- [ ] Validation manuelle Desktop + Mobile.

## Fait

- [x] Définir vision produit et modèle de données.
- [x] Initialiser Vite React TypeScript, dépendances, arborescence feature-first.
- [x] Types métier complets (batches, phases, measurements, observations, events, profiles, shared/common).
- [x] Schéma IndexedDB/Dexie v1.
- [x] 4 profils MVP statiques.
- [x] Documentation architecture (architecture.md, DECISIONS.md, PROJECT_MAP.md).
- [x] DashboardPage : cartes cliquables, badges statut, date, culture réfrigérée, batchs terminés + abandonnés.
- [x] CreateBatchPage : formulaire complet (profil + nom + date + culture snapshot), auto-suggestion type culture, redirect vers détail.
- [x] BatchDetailPage : résumé, culture snapshot.
- [x] Route /batches/:batchId.
- [x] CSS mobile-first enrichi (badges, cartes cliquables, formulaire sections, detail page).
- [x] TypeScript compile sans erreur, build production OK.
- [x] Repositories measurements / observations / processEvents.
- [x] Hooks useMeasurements / useObservations / useProcessEvents (useLiveQuery).
- [x] MeasurementForm : type, valeur, unité auto, date/heure, note.
- [x] ObservationForm : catégorie, descripteur contrôlé, intensité 1–5, date/heure, note.
- [x] ProcessEventForm : type contrôlé, libellé auto-rempli, date/heure, note.
- [x] BatchTimeline : fusion chronologique mesures + observations + événements, badges couleur, format J+N HH:MM.
- [x] QuickAddPanel inline dans BatchDetailPage (toggle 3 formulaires).
- [x] Lint sans erreur, build OK.
- [x] phaseRepository : add / listByBatch / findActiveByType / close / remove.
- [x] usePhases : useLiveQuery par batchId.
- [x] PhaseForm : création manuelle (type, label, début, fin, notes).
- [x] PhaseList : affichage phases, clôture, actions rapides par profil.
- [x] BatchDetailPage : section Phases intégrée.
- [x] Séparation Phase / ProcessEvent : retrait des types de phase de ProcessEventType, nettoyage profils, actions rapides sans événements de transition.

## Bugs connus

Aucun.

## Dette technique

- `lib/dates.ts` : formatage d'affichage des dates (formatDate, formatDateShort) est encore inline dans plusieurs composants. À extraire si un 3e composant en a besoin.
- ~~Phases absentes de la timeline~~ : ✓ Résolu (Étape 13). `phaseId` assigné automatiquement.
- ~~Suppression et édition d'entités depuis la timeline~~ : ✓ Résolu (Étape 14).
