# STATUS.md

> Dernière mise à jour : 2026-05-19

## Phase actuelle

Phase MVP — flux batch complet (création → détail) implémenté.

## Ce qui fonctionne

- Application Vite React TypeScript, buildable.
- Routing React Router : Dashboard `/`, CreateBatch `/batches/new`, BatchDetail `/batches/:batchId`.
- IndexedDB opérationnel via Dexie (schéma v1).
- **Création de batch complète** : profil, nom, date/heure de début, culture snapshot (type, nom, réfrigérée, durée frigo, dernier nourrissage, activité estimée, notes), notes initiales → persistance IndexedDB → redirect vers détail.
- **Dashboard** : cartes cliquables, badges statut (En cours / Terminé / Abandonné), date de début, indicateur culture réfrigérée, batchs terminés + abandonnés.
- **Détail batch** : résumé (nom, type, statut, dates, notes), culture snapshot formatée, placeholders pour phases / mesures / observations / événements / évaluation.
- Dashboard mis à jour en temps réel via `useLiveQuery`.
- 4 profils de fermentation MVP : water_kefir, milk_kefir, kombucha, sourdough_starter.
- Profil suggère automatiquement le type de culture dans le formulaire.
- TypeScript compile sans erreur.
- Build production réussi (395 KB JS, 5.34 KB CSS).

## Ce qui n'est pas encore fait

- Ingrédients détaillés dans CreateBatch.
- Gestion des phases (PhaseManager).
- Ajout rapide mesures / observations / événements (QuickAddPanel).
- Clôture batch (FinalEvaluation).
- Comparaison des batchs (ComparisonPage).
- Export JSON versionné.
- `lib/dates.ts` et `lib/calculations.ts`.

## Validation manuelle effectuée

- [ ] Desktop navigateur principal
- [ ] Mobile
- [x] Build production
- [ ] PWA installable
- [ ] Export JSON

## Complexité technique actuelle

- Niveau de complexité global : faible à modéré.
- Zones à surveiller : migrations IndexedDB, composants BatchDetailPage quand le suivi s'enrichira.
- Refactors à éviter : spécialisation prématurée par fermentation.

## Contexte IA

- `PROJECT_MAP.md` est à jour : oui.
- `scripts/export-context.mjs` fonctionne : à tester.
- Prochaine zone à documenter : PhaseManager + QuickAddPanel.
