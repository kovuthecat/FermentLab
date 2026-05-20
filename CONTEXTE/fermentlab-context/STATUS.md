# STATUS.md

> Dernière mise à jour : 2026-05-19 (Déploiement Vercel + Supabase OTP — Étape 15)

## Phase actuelle

Phase déploiement — préparation Vercel + Supabase Auth OTP (Étape 15).

## Ce qui fonctionne

- Application Vite React TypeScript, buildable.
- Routing React Router : Dashboard `/`, CreateBatch `/batches/new`, BatchDetail `/batches/:batchId`, Comparaisons `/comparisons`.
- IndexedDB opérationnel via Dexie (schéma v1).
- **Création de batch complète** : profil, nom, date/heure de début, culture snapshot (type, nom, réfrigérée, durée frigo, dernier nourrissage, activité estimée, notes), notes initiales → persistance IndexedDB → redirect vers détail.
- **Dashboard** : cartes cliquables, badges statut (En cours / Terminé / Abandonné), date de début, indicateur culture réfrigérée, batchs terminés + abandonnés.
- **Détail batch** : résumé (nom, type, statut, dates, notes), culture snapshot formatée.
- **Suivi batch** :
  - Ajout de mesures chiffrées (type, valeur, unité auto, date/heure, note).
  - Ajout d'observations structurées (catégorie, descripteur, intensité 1–5, date/heure, note).
  - Ajout d'événements de process (type contrôlé, libellé, date/heure, note).
  - Timeline chronologique fusionnant les 3 types, avec badge couleur par type.
  - Persistance IndexedDB via Dexie (tables measurements, observations, processEvents).
  - QuickAddPanel : 3 boutons toggle, formulaire inline simple.
- **Gestion des phases** :
  - Affichage des phases du batch (label, type, début, fin, durée, statut).
  - Création manuelle (type, label, début, fin optionnelle, notes).
  - Clôture d'une phase active.
  - Actions rapides par profil (kombucha/kéfir : Fin F1, Début F2, Fin F2, Mise au froid ; kéfir de lait : Fin F1, Mise au froid ; levain : Nourrissage, Début pousse, Pic d'activité, Début repos, Début apprêt).
  - Transitions automatiques conservatives (primary→secondary, secondary→refrigeration, rise→rest, rest→proofing).
  - Actions rapides phase ne créent plus d'événements de transition (séparation Phase / ProcessEvent).
  - Persistance IndexedDB.
- Dashboard mis à jour en temps réel via `useLiveQuery`.
- 4 profils de fermentation MVP : water_kefir, milk_kefir, kombucha, sourdough_starter.
- Profil suggère automatiquement le type de culture dans le formulaire.
- TypeScript compile sans erreur.
- Build production réussi (442 KB JS, 12.33 KB CSS).
- **Export JSON versionné** :
  - `exportService.exportBatch(batchId)` : agrège tout le batch + calculs → `SingleBatchExport`.
  - `exportService.exportAllBatches()` : tous les batchs triés par date de début → `AllBatchesExport`.
  - Format `schemaVersion: "1.0"`, `exportedAt`, `app.exportType`.
  - `calculatedSummary` inclus (durée, F1/F2/réfrigération, temp, pH, OG/FG, ABV, ratio contenant, frigo culture).
  - Ingrédients : lecture directe de la table `ingredients` (source unique).
  - `downloadJson(filename, data)` : téléchargement navigateur sans dépendance.
  - Nom de fichier : `fermentlab-batch-[nom-sanitisé]-[date].json` / `fermentlab-export-[date].json`.
  - Bouton "Exporter ce batch (JSON)" sur BatchDetailPage (section Export, avant zone dangereuse).
  - Bouton "⬇ Exporter tout" sur ComparisonPage (header, visible si batchs existants).
  - Aucune modification du schéma Dexie. Aucune persistance des calculs.
- **Page comparaison** (`/comparisons`) :
  - Route `/comparisons` accessible depuis le header (lien "Comparer").
  - `comparisonService.getComparisonRows()` : agrège phases, mesures et évaluation finale par batch, retourne `BatchComparisonRow[]`.
  - Métriques calculées : durée totale, F1, F2, réfrigération, température moyenne, pH initial/final/delta, OG/FG, ABV estimé, frigo culture, score global, succès, à refaire.
  - Filtres : type de fermentation, statut (terminé/abandonné/tous), succès (oui/non/tous), à refaire (oui/non/tous), score minimum.
  - Tri : score global, date de fin, durée totale, température moyenne — toggle asc/desc.
  - Desktop : tableau scrollable horizontal avec toutes les métriques.
  - Mobile (< 600 px) : cartes avec métriques disponibles, score en badge coloré.
  - Navigation principale mise à jour (lien "Comparer" dans le header).
  - `useLiveQuery` : réactif aux modifications des tables batches, phases, measurements, finalEvaluations.
  - Aucune modification du schéma Dexie.
- **Calculs métier** (`src/lib/calculations.ts`) :
  - `getBatchDurationHours` : durée totale du batch (batch actif → date actuelle).
  - `getPhaseDurationHours` : durée d'une phase (phase active → date actuelle).
  - `getPhaseDurationByType` : durée cumulée par type de phase (primary, secondary, refrigeration…).
  - `getTemperatureStats` : moyenne / min / max sur `temperature` + `ambient_temperature`.
  - `getPhStats` : pH initial / final / delta (trié par timestamp).
  - `getDensityStats` : OG / FG (trié par timestamp).
  - `estimateAbvFromDensity` : estimation ABV = (OG - FG) × 131,25.
  - `getSurfaceDepthRatio` : surfaceAreaCm2 / depthCm.
  - `getCultureRefrigerationHours` : refrigerationDurationHours du snapshot.
  - Tous les calculs sont purs, aucun résultat n'est persisté en base.
- **BatchMetricsSummary** (`src/features/batches/components/`) : section "Résumé calculé" sur la page détail, n'affiche que les valeurs disponibles.
- **BatchDetailPage** : section "Résumé calculé" ajoutée avant "Suivi".
- **Clôture batch + évaluation finale** :
  - Bouton "Clôturer le batch" sur batch actif → formulaire inline.
  - Formulaire : date/heure de fin, statut final (completed/abandoned), scores structurés (global, acidité, sucrosité, pétillance, alcool, texture), succès, à refaire, résumé problème, notes finales.
  - Score global obligatoire pour `completed`, optionnel pour `abandoned`.
  - Écrit `FinalEvaluation` en IndexedDB + met à jour `status`/`endedAt`/`updatedAt` du batch.
  - Affichage de l'évaluation finale sur batch terminé/abandonné, avec bouton "Modifier l'évaluation".
  - `finalEvaluationRepository` : save (create/update) + getByBatch.
  - `useFinalEvaluation` : useLiveQuery par batchId, default null (sentinel chargement).
  - `BatchCloseForm` composant dédié (`features/evaluations/components/`).
  - `FinalEvaluationDisplay` composant dédié.
  - `batchRepository.close()` : met à jour status + endedAt + updatedAt.
  - `overallScore` rendu optionnel dans le type `FinalEvaluation` (pour batchs abandonnés).
- **Séparation Phase / ProcessEvent** :
  - `ProcessEventType` réduit aux actions ponctuelles : `bottling`, `filtering`, `ingredient_added`, `burping`, `mixing`, `discard`, `feeding`, `container_changed`, `other`.
  - Types de phase retirés de `ProcessEventType` : `start_phase`, `end_phase`, `end_primary_fermentation`, `start_secondary_fermentation`, `end_secondary_fermentation`, `refrigeration`.
  - `suggestedEvents` des profils nettoyés.
  - `ProcessEventForm` mis à jour.
  - Actions rapides Phase sans doublon événement/phase.
- Lint sans erreur.

- **Ingrédients structurés** (Étape 11) :
  - `ingredientRepository` : add / listByBatch / remove.
  - `useIngredients` : useLiveQuery par batchId.
  - `IngredientForm` : formulaire inline (type, nom, quantité, unité, rôle, note).
  - `IngredientList` : affichage liste avec suppression.
  - `CreateBatchPage` : fieldset "Ingrédients initiaux" avec pré-remplissage par profil + ajout/suppression dynamique + persistance Dexie au submit.
  - `BatchDetailPage` : section "Ingrédients initiaux" avec IngredientList (useLiveQuery) + toggle IngredientForm.
  - Build production réussi (450 KB JS). Lint sans erreur.

- **Consolidation UX timeline** (Étape 14) :
  - `BatchTimeline` : groupement par jour (header date), badges visuels de phase `[F1]`, `[F2]`, `[FROID]`…, heure seule dans chaque groupe, actions ✏️ / ✕ par entrée (visibles au hover ou toujours sur mobile).
  - **Édition inline** : 3 mini-éditeurs spécialisés dans la timeline (MeasurementEditor, ObservationEditor, ProcessEventEditor), pré-remplis, sans modal.
  - **Feedback visuel** : toast léger après ajout / modification / suppression.
  - **QuickAdd spécifique** : boutons `+ Temp.` et `+ pH` en QuickAddBar, pré-sélectionnent le bon type dans le formulaire.
  - **Auto-remplissage timestamp** : `lastTimestamp` propagé entre les formulaires successifs.
  - `shared/utils/date.ts` : `isoToDatetimeLocal()` ajouté.
  - Repositories : méthode `update()` ajoutée sur les 3 tables (measurements, observations, processEvents).
  - Build ✓ (459 KB JS, 16.20 KB CSS). Lint ✓.

- **Association automatique phaseId** (Étape 13) :
  - `phaseRepository.findActiveByBatch(batchId)` ajouté.
  - `BatchDetailPage` : `activePhase` calculée depuis les phases chargées, passée aux 3 formulaires et à `BatchTimeline`.
  - `MeasurementForm`, `ObservationForm`, `ProcessEventForm` : `phaseId` assigné au submit ; indicateur de phase affiché dans chaque formulaire.
  - `ProcessEventForm` : `nowDatetimeLocal` local remplacé par import partagé.
  - `BatchTimeline` : affiche "Phase : <label>" sur chaque entrée ayant un `phaseId` résolu.
  - `index.css` : `.phase-hint`, `.timeline-phase-hint` ajoutés.
  - Build production OK (450 KB). Lint OK.

- **Consolidation architecture** (Étape 12) :
  - **Source unique ingrédients** : `InitialParameters.ingredients` supprimé du type. Table `ingredients` est la seule source. `exportService` simplifié (merge supprimé).
  - **Dexie v2** : migration supprimant la table `derivedMetrics` (jamais utilisée). `DerivedMetric` supprimé de `shared/types/common.ts`.
  - **`nowDatetimeLocal()`** centralisé dans `shared/utils/date.ts`. Corrige un bug UTC silencieux dans les 4 composants précédents. `toDatetimeLocal` de `CreateBatchPage` remplacé.
  - **`DESCRIPTOR_LABELS` + `descriptorLabel()`** centralisés dans `observations/constants.ts`. Supprimés de `ObservationForm` et `BatchTimeline`.
  - **`CULTURE_TYPE_LABELS`** centralisé dans `batches/constants.ts`. Supprimé de `CreateBatchPage` et `BatchDetailPage`.
  - **`DEFAULT_INGREDIENT_UNITS`** ajouté à `ingredients/constants.ts`. `IngredientForm` auto-remplit l'unité au changement de type.
  - **Ingrédients kombucha** : defaults mis à jour (eau filtrée, thé en g, sucre, SCOBY en unit, liquide starter en ml).
  - **Suppression depuis la timeline** : bouton ✕ sur chaque entrée (mesure / observation / événement), confirmation native.
  - Build production : 449 KB JS. Lint sans erreur.
- Build production (Étape 14) : 459 KB JS, 16.20 KB CSS. Lint sans erreur.

- **Migration Supabase — source de vérité** (Étape 16) :
  - 7 repositories migrés vers Supabase (batches, phases, ingredients, measurements, observations, process_events, final_evaluations).
  - 7 hooks migrés : `useLiveQuery` → `useState + useEffect + useDataVersion`.
  - `useBatch(batchId)` nouveau hook pour charger un batch depuis Supabase.
  - `DashboardPage`, `CreateBatchPage`, `BatchDetailPage`, `ComparisonPage` : plus aucune référence à Dexie.
  - `comparisonService`, `exportService` : utilisent les repositories Supabase.
  - `src/lib/refresh.ts` : pub-sub `triggerRefresh()` / `useDataVersion()` — après chaque mutation, tous les hooks React re-fetchen automatiquement.
  - `src/lib/getCurrentUserId.ts` : helper auth pour obtenir le user_id lors des inserts.
  - Logs `[Supabase]` ajoutés sur les opérations principales.
  - Dexie conservé (`db/database.ts`) mais inactif — rollback possible.
  - Build ✓ (573 KB, -90 KB vs avant). Lint ✓.

- **Déploiement Vercel + Supabase OTP** (Étape 15) :
  - `vercel.json` : rewrite SPA → `/index.html`.
  - `.env.example` : `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`.
  - `src/lib/supabaseClient.ts` : client Supabase via `import.meta.env`.
  - `src/features/auth/AuthProvider.tsx` : contexte session `useAuth()`, `onAuthStateChange`.
  - `src/features/auth/AuthPage.tsx` : flux OTP email → email input → code OTP → session active.
  - `src/features/auth/ProtectedRoute.tsx` : redirect `/auth` si pas de session.
  - `src/main.tsx` : `AuthProvider` wrappé autour de `RouterProvider`.
  - `src/app/routes.tsx` : route `/auth` + toutes les routes protégées par `ProtectedRoute`.
  - `src/app/App.tsx` : bouton "Déconnexion" dans le header.
  - `supabase/schema.sql` : 7 tables (batches, phases, ingredients, measurements, observations, process_events, final_evaluations) avec `user_id`, timestamps, RLS owner-only.
  - `docs/deployment.md` : guide Vercel complet.
  - `docs/supabase-setup.md` : guide Supabase pas à pas.
  - Build ✓. Lint ✓.

## Ce qui n'est pas encore fait

- ~~Ingrédients détaillés dans CreateBatch.~~ ✓ Fait (Étape 11).
- ~~Gestion des phases (PhaseManager).~~ ✓ Fait.
- ~~Clôture batch (FinalEvaluation + passage status → completed).~~ ✓ Fait.
- ~~Comparaison des batchs (ComparisonPage).~~ ✓ Fait.
- ~~Export JSON versionné.~~ ✓ Fait.
- ~~Consolidation architecture (source unique ingrédients, constantes partagées, derivedMetrics, suppression timeline).~~ ✓ Fait (Étape 12).
- Migration repositories Dexie → Supabase (batchs, phases, ingrédients, mesures, observations, événements, évaluations).
- Graphes de mesures.
- Photos.

## Validation manuelle effectuée

- [ ] Desktop navigateur principal
- [ ] Mobile
- [x] Build production
- [x] Lint
- [ ] PWA installable
- [ ] Export JSON

## Complexité technique actuelle

- Niveau de complexité global : faible à modéré.
- Zones à surveiller : migrations IndexedDB, BatchDetailPage (taille croissante).
- Refactors à éviter : spécialisation prématurée par fermentation.

## Contexte IA

- `PROJECT_MAP.md` est à jour : oui.
- `scripts/export-context.mjs` fonctionne : à tester.
- Prochaine zone à documenter : export JSON.
