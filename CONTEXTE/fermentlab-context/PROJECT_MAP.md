# PROJECT_MAP.md

> Carte synthétique du projet FermentLab. À maintenir à chaque changement d'arborescence.
> Dernière mise à jour : 2026-05-19 (clôture batch + évaluation finale)

## Vue d'ensemble

Application React/Vite/TypeScript local-first pour suivre des fermentations personnelles sous forme de batchs expérimentaux.

Flux principal : créer un batch → saisir paramètres initiaux → suivre phases / mesures / observations / événements → clôturer → comparer les résultats → exporter JSON.

Stack : React 19, Vite 8, TypeScript, React Router 7, Dexie 4, dexie-react-hooks.

---

## Arborescence réelle (au 2026-05-19)

```text
FermentLab/
  src/
    app/
      App.tsx               ← shell applicatif, header, <Outlet>
      routes.tsx            ← définition des routes React Router

    db/
      database.ts           ← instance Dexie + schéma v1 (toutes les tables)

    features/
      batches/
        pages/
          DashboardPage.tsx     ← liste batchs actifs + terminés (useLiveQuery)
          CreateBatchPage.tsx   ← formulaire minimal de création batch
          BatchDetailPage.tsx   ← écran central : résumé + QuickAddPanel + BatchTimeline
        services/
          batchRepository.ts    ← close (status/endedAt) + remove (cascade)
        hooks/                  ← (vide, À CRÉER si besoin)
        components/
          BatchMetricsSummary.tsx ← résumé des métriques calculées (durée, pH, ABV, ratio…)
        types.ts              ← Batch, ContainerInfo, CultureSnapshot, IngredientEntry, InitialParameters

      phases/
        types.ts              ← Phase, PhaseType
        services/
          phaseRepository.ts    ← add / listByBatch / findActiveByType / close / remove
        components/
          PhaseList.tsx         ← affichage phases + actions rapides par profil + bouton clôture
          PhaseForm.tsx         ← formulaire création manuelle
        hooks/
          usePhases.ts          ← useLiveQuery par batchId

      measurements/
        types.ts              ← Measurement, MeasurementMetric, MeasurementUnit, MeasurementSource
        services/
          measurementRepository.ts  ← add / listByBatch / remove
        hooks/
          useMeasurements.ts        ← useLiveQuery par batchId
        components/
          MeasurementForm.tsx       ← formulaire saisie rapide (metric, value, datetime, note)

      observations/
        types.ts              ← StructuredObservation, ObservationCategory, OBSERVATION_DESCRIPTORS
        services/
          observationRepository.ts  ← add / listByBatch / remove
        hooks/
          useObservations.ts        ← useLiveQuery par batchId
        components/
          ObservationForm.tsx       ← formulaire (catégorie, descripteur, intensité, datetime, note)

      events/
        types.ts              ← ProcessEvent, ProcessEventType
        services/
          processEventRepository.ts ← add / listByBatch / remove
        hooks/
          useProcessEvents.ts       ← useLiveQuery par batchId
        components/
          ProcessEventForm.tsx      ← formulaire (type contrôlé, libellé auto, datetime, note)

      evaluations/
        services/
          finalEvaluationRepository.ts  ← save (create/update) + getByBatch
        hooks/
          useFinalEvaluation.ts         ← useLiveQuery par batchId (null = loading)
        components/
          BatchCloseForm.tsx            ← formulaire clôture batch (scores, statut, notes)
          FinalEvaluationDisplay.tsx    ← affichage évaluation finale + bouton modifier

      profiles/
        data/
          profiles.ts         ← 4 profils MVP statiques (water_kefir, milk_kefir, kombucha, sourdough_starter)
        types.ts              ← FermentationProfile, PhaseTemplate, FermentationProfileId
        services/             ← (À CRÉER si nécessaire)

      comparisons/
        pages/                ← (À CRÉER) tableau filtrable des batchs terminés
        components/
        services/

      export/
        services/
          exportService.ts    ← (À CRÉER) génération JSON versionné IA-ready

    timeline/
      components/
        BatchTimeline.tsx     ← fusion chronologique mesures + observations + événements

    shared/
      types/
        common.ts             ← FinalEvaluation, DerivedMetric
      components/             ← (vide, composants vraiment partagés uniquement)
      hooks/
      utils/

    lib/
      calculations.ts         ← calculs purs : durée batch/phase, température, pH, densité, ABV, ratio contenant, culture
      dates.ts                ← (À CRÉER) formatage ISO, durée relative
      units.ts                ← (À CRÉER) libellés des unités de mesure

    main.tsx                  ← point d'entrée, RouterProvider
    index.css                 ← CSS global mobile-first minimal
    vite-env.d.ts

  CONTEXTE/
    fermentlab-context/       ← documentation complète du projet
      PROJECT_BRIEF.md
      PROJECT_MAP.md          ← ce fichier
      DATA_MODEL.md
      UX_FLOW.md
      ROADMAP.md
      DECISIONS.md
      STATUS.md
      TASKS.md
      architecture.md         ← document d'architecture complet
      CLAUDE.md
      ai-usage.md
      git.md
      scripts/
        export-context.mjs    ← export contexte synthétique pour ChatGPT
      prompts/
        claude-code-investigation.md

  index.html
  package.json
  vite.config.ts
  tsconfig.json / tsconfig.app.json / tsconfig.node.json
```

---

## Features principales

### batches

Rôle : gestion des fermentations suivies comme expériences.

Fichiers clés :
- `features/batches/types.ts` — types complets
- `features/batches/pages/DashboardPage.tsx` — liste live-query
- `features/batches/pages/CreateBatchPage.tsx` — formulaire création
- `features/batches/pages/BatchDetailPage.tsx` — écran central : résumé + suivi (QuickAddPanel + BatchTimeline)

Points de vigilance :
- Ne pas mélanger batch, mesures et événements dans une seule structure.
- Garder `initialParameters` et `cultureSnapshot` exploitables par IA.
- `cultureSnapshot.refrigerationDurationHours` est un champ analytiquement important.

### phases

Rôle : représenter F1, F2, réfrigération, nourrissage, pousse, apprêt, etc.

Fichiers clés :
- `features/phases/types.ts` — Phase, PhaseType (`primary`, `secondary`, `refrigeration`, `feeding`, `rise`, `rest`, `bulk_fermentation`, `proofing`, `other`)
- `features/phases/services/phaseRepository.ts` — add/listByBatch/findActiveByType/close/remove
- `features/phases/hooks/usePhases.ts` — useLiveQuery par batchId
- `features/phases/components/PhaseList.tsx` — liste + actions rapides + clôture
- `features/phases/components/PhaseForm.tsx` — création manuelle

Points de vigilance :
- Phases liées au batch par `batchId`.
- `Phase` requiert `updatedAt` (géré par `phaseRepository.add` et `phaseRepository.close`).
- Mesures, observations et événements liés à une phase via `phaseId` (optionnel).
- Ne pas créer un type Phase différent par fermentation.
- `refrigeration` (pas `cold_storage`), `rise` (pas `growth`) — noms du code existant.

### measurements

Rôle : mesures numériques horodatées.

Fichiers clés :
- `features/measurements/types.ts`
- `features/measurements/services/measurementRepository.ts` — add/listByBatch/remove
- `features/measurements/hooks/useMeasurements.ts` — useLiveQuery par batchId
- `features/measurements/components/MeasurementForm.tsx` — formulaire saisie rapide

Points de vigilance :
- `metric`, `unit`, `source` toujours renseignés.
- Ne pas stocker de mesure calculée ici (→ `derivedMetrics`).

### observations

Rôle : observations qualitatives structurées.

Fichiers clés :
- `features/observations/types.ts`
- `features/observations/services/observationRepository.ts`
- `features/observations/hooks/useObservations.ts`
- `features/observations/components/ObservationForm.tsx`

Points de vigilance :
- `category` et `descriptor` contrôlés.
- Note libre complémentaire seulement, jamais principale.

### events

Rôle : actions et jalons du process (fin F1, embouteillage, dégazage…).

Fichiers clés :
- `features/events/types.ts`
- `features/events/services/processEventRepository.ts`
- `features/events/hooks/useProcessEvents.ts`
- `features/events/components/ProcessEventForm.tsx`

Points de vigilance :
- `eventType` contrôlé, pas une note libre.
- `metadata` disponible pour données contextuelles additionnelles.

### timeline

Rôle : affichage chronologique fusionné des mesures, observations et événements d'un batch.

Fichiers clés :
- `features/timeline/components/BatchTimeline.tsx` — reçoit les 3 listes en props, trie par timestamp, affiche badges couleur + résumé

### profiles

Rôle : profils de fermentation statiques, suggestions de phases/événements/métriques.

Données statiques — pas de table Dexie pour les profils.
- `getProfile(id)` dans `profiles.ts` pour accès rapide.

### comparisons (À CRÉER)

Rôle : comparer des batchs par paramètres, durées, mesures finales et scores.

Vue MVP : tableau filtrable. Graphiques reportés en v1.

### export (À CRÉER)

Rôle : générer un JSON versionné exploitable par IA.

Voir `architecture.md` section 7 pour le format cible.

---

## Fichiers transversaux importants

### db/database.ts

Tables IndexedDB définies : `batches`, `phases`, `ingredients`, `measurements`, `observations`, `processEvents`, `finalEvaluations`, `derivedMetrics`.

Schéma v1. Incrémenter via `db.version(2).stores(...)` pour toute modification.

### lib/calculations.ts

Calculs purs, aucune écriture en base.

- `getBatchDurationHours(batch)` — durée totale (endedAt ou now)
- `getPhaseDurationHours(phase)` — durée d'une phase (endedAt ou now)
- `getPhaseDurationByType(phases, type)` — cumul durée pour un type de phase
- `getTemperatureStats(measurements)` — moyenne / min / max sur temperature + ambient_temperature
- `getPhStats(measurements)` — pH initial / final / delta (trié timestamp)
- `getDensityStats(measurements)` — OG / FG (trié timestamp)
- `estimateAbvFromDensity(measurements)` — (OG - FG) × 131,25
- `getSurfaceDepthRatio(batch)` — surfaceAreaCm2 / depthCm
- `getCultureRefrigerationHours(batch)` — refrigerationDurationHours du snapshot

Ne jamais écrire ces valeurs dans `measurements`.

### shared/types/common.ts

Contient `FinalEvaluation` et `DerivedMetric`, partagés entre features.

---

## Zones à risque

| Zone | Risque | Mitigation |
|---|---|---|
| Migrations Dexie | Schéma mal incrémenté → données corrompues | Toujours incrémenter `db.version()` |
| BatchDetailPage | Fichier trop gros | Découper en composants par feature |
| DerivedMetric | Confondu avec Measurement | Calculs uniquement dans `lib/calculations.ts` |
| Spécialisation par fermentation | Types dupliqués | Un seul `Batch` + `profileId` |
| Notes libres comme données | Données non filtrables | UI favorise les champs structurés |
| Comparaison multi-entités | Agrégation complexe | Commencer par tableau simple |
| Photos | Stockage local lourd | Reporté v1 |
| DESCRIPTOR_LABELS | Dupliqué dans ObservationForm + BatchTimeline | Extraire si 3e utilisation |

---

## Règles locales importantes

- Données saisies et données calculées séparées.
- Tous les objets structurants ont `createdAt` et souvent `updatedAt`.
- Toutes les mesures ont `metric`, `value`, `unit`, `source`.
- Les événements process ne sont pas stockés comme simples notes.
- Ne pas créer de `KombuchaBatch`, `KefirBatch`, etc.
- `schemaVersion` à incrémenter dans le modèle JSON exporté à chaque changement de schéma.
