# STATUS.md

> Dernière mise à jour : 2026-05-19

## Phase actuelle

Phase MVP — timeline de suivi implémentée (mesures + observations + événements).

## Ce qui fonctionne

- Application Vite React TypeScript, buildable.
- Routing React Router : Dashboard `/`, CreateBatch `/batches/new`, BatchDetail `/batches/:batchId`.
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
- Dashboard mis à jour en temps réel via `useLiveQuery`.
- 4 profils de fermentation MVP : water_kefir, milk_kefir, kombucha, sourdough_starter.
- Profil suggère automatiquement le type de culture dans le formulaire.
- TypeScript compile sans erreur.
- Build production réussi (409 KB JS, 6.89 KB CSS).
- Lint sans erreur.

## Ce qui n'est pas encore fait

- Ingrédients détaillés dans CreateBatch.
- Gestion des phases (PhaseManager).
- Clôture batch (FinalEvaluation + passage status → completed).
- Comparaison des batchs (ComparisonPage).
- Export JSON versionné.
- `lib/dates.ts` et `lib/calculations.ts`.
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
- Prochaine zone à documenter : PhaseManager + BatchCloseForm.
