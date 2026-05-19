# TASKS.md

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

## À faire

- [ ] PhaseManager : démarrer / finir une phase selon le profil, depuis BatchDetailPage.
- [ ] BatchCloseForm : saisie FinalEvaluation + passage status → completed.
- [ ] Ingrédients dans CreateBatch (IngredientEntry, ajout dynamique).
- [ ] ComparisonPage : tableau filtrable des batchs terminés.
- [ ] Export JSON versionné (schemaVersion 1.0), depuis BatchDetailPage.
- [ ] lib/dates.ts : utilitaires de formatage de dates.
- [ ] lib/calculations.ts : durée totale, F1/F2, ratio surface/profondeur, ABV.
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

## Bugs connus

Aucun.

## Dette technique

- `lib/dates.ts` : formatage des dates est inline dans les pages (à extraire quand utilisé dans 2+ endroits).
- `DESCRIPTOR_LABELS` dupliqué entre ObservationForm et BatchTimeline (à extraire dans `observations/types.ts` ou `observations/utils.ts` si une 3e utilisation apparaît).
