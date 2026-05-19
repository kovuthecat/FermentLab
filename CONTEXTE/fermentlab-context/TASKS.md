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

- [ ] CreateBatchPage — étape 2 : ingrédients principaux (IngredientEntry).
- [ ] CreateBatchPage — étape 3 : état de la culture (CultureSnapshot).
- [ ] CreateBatchPage — étape 4 : contenant (ContainerInfo).
- [ ] BatchDetailPage : résumé batch, phase actuelle, timeline simple, actions rapides.
- [ ] PhaseManager : démarrer / finir une phase selon le profil.
- [ ] QuickAddPanel : ajout rapide mesure / observation / événement depuis le détail batch.
- [ ] BatchCloseForm : saisie FinalEvaluation.
- [ ] BatchListPage / ComparisonPage : tableau filtrable des batchs terminés.
- [ ] Export JSON versionné (schemaVersion 1.0).
- [ ] Validation manuelle Desktop + Mobile.

## Fait

- [x] Définir vision produit.
- [x] Définir modèle de données cible.
- [x] Identifier le besoin de phases F1/F2/réfrigération.
- [x] Ajouter l'état de la culture au démarrage.
- [x] Initialiser le projet Vite React TypeScript.
- [x] Installer react-router-dom, dexie, dexie-react-hooks.
- [x] Créer l'arborescence feature-first.
- [x] Créer les types métier (batches, phases, measurements, observations, events, profiles, shared/common).
- [x] Créer le schéma IndexedDB/Dexie (src/db/database.ts).
- [x] Créer les 4 profils MVP en données statiques.
- [x] Créer DashboardPage (liste batchs actifs + terminés, useLiveQuery).
- [x] Créer CreateBatchPage (formulaire minimal : profil + nom, persistance IndexedDB).
- [x] TypeScript compile sans erreur.
- [x] Build production Vite réussi.

## Bugs connus

Aucun.

## Dette technique

Aucune.
