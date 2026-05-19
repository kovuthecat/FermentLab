# STATUS.md

> Dernière mise à jour : 2026-05-19

## Phase actuelle

Phase MVP — initialisation terminée, app fonctionnelle et buildable.

## Ce qui fonctionne

- Application Vite React TypeScript initialisée et buildable.
- Routing React Router (Dashboard `/`, CreateBatch `/batches/new`).
- IndexedDB opérationnel via Dexie (schéma v1).
- Création de batch minimale : choix du profil + nom → persistance IndexedDB.
- Dashboard affiche les batchs actifs et terminés en temps réel (useLiveQuery).
- 4 profils de fermentation MVP : water_kefir, milk_kefir, kombucha, sourdough_starter.
- TypeScript compile sans erreur.
- Build production réussi (387 KB JS, 2.69 KB CSS).

## Ce qui n'est pas encore fait

- Paramètres initiaux détaillés (ingrédients, culture, contenant).
- Écran détail batch.
- Gestion des phases.
- Ajout rapide (mesures, observations, événements).
- Clôture batch (FinalEvaluation).
- Comparaison des batchs.
- Export JSON versionné.

## Validation manuelle effectuée

- [ ] Desktop navigateur principal
- [ ] Mobile
- [x] Build production
- [ ] PWA installable
- [ ] Export JSON

## Complexité technique actuelle

- Niveau de complexité global : faible, MVP initial.
- Zones à surveiller : migrations IndexedDB, comparaison multi-entités.
- Refactors à éviter : spécialisation prématurée par fermentation.

## Contexte IA

- `PROJECT_MAP.md` est à jour : oui.
- `scripts/export-context.mjs` fonctionne : à tester.
- Zones à documenter davantage : BatchDetailPage, QuickAdd.
