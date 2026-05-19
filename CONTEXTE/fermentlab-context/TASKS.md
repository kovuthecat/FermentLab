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
- [ ] QuickAddPanel : ajout rapide mesure / observation / événement depuis BatchDetailPage.
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
- [x] BatchDetailPage : résumé, culture snapshot, placeholders phases/mesures/observations/événements/évaluation.
- [x] Route /batches/:batchId.
- [x] CSS mobile-first enrichi (badges, cartes cliquables, formulaire sections, detail page).
- [x] TypeScript compile sans erreur, build production OK.

## Bugs connus

Aucun.

## Dette technique

- `lib/dates.ts` : formatage des dates est inline dans les pages (à extraire quand utilisé dans 2+ endroits).
