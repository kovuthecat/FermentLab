# STATUS.md

> Dernière mise à jour : 2026-05-19 (clôture batch + évaluation finale)

## Phase actuelle

Phase MVP — gestion des phases implémentée et séparation métier Phase/ProcessEvent nettoyée.

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
- Build production réussi (420 KB JS, 7.93 KB CSS).
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

## Ce qui n'est pas encore fait

- Ingrédients détaillés dans CreateBatch.
- ~~Gestion des phases (PhaseManager).~~ ✓ Fait.
- ~~Clôture batch (FinalEvaluation + passage status → completed).~~ ✓ Fait.
- Comparaison des batchs (ComparisonPage).
- Export JSON versionné.
- `lib/dates.ts`.
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
- Prochaine zone à documenter : comparaisons + export JSON.
