# PROJECT_MAP.md

> Carte synthétique du projet FermentLab. À maintenir à chaque changement d'arborescence.
> Dernière mise à jour : 2026-05-19

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
          BatchDetailPage.tsx   ← (À CRÉER) écran central, timeline
        services/
          batchRepository.ts    ← (À CRÉER) CRUD Dexie pour batchs
        hooks/                  ← (vide, À CRÉER si besoin)
        components/             ← (vide, À CRÉER)
        types.ts              ← Batch, ContainerInfo, CultureSnapshot, IngredientEntry, InitialParameters

      phases/
        types.ts              ← Phase, PhaseType
        services/
          phaseRepository.ts    ← (À CRÉER)
        components/             ← (À CRÉER) PhaseManager
        hooks/

      measurements/
        types.ts              ← Measurement, MeasurementMetric, MeasurementUnit, MeasurementSource
        services/             ← (À CRÉER)
        components/           ← (À CRÉER)
        hooks/

      observations/
        types.ts              ← StructuredObservation, ObservationCategory, OBSERVATION_DESCRIPTORS
        services/             ← (À CRÉER)
        components/           ← (À CRÉER)
        hooks/

      events/
        types.ts              ← ProcessEvent, ProcessEventType
        services/             ← (À CRÉER)
        components/           ← (À CRÉER)
        hooks/

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

    shared/
      types/
        common.ts             ← FinalEvaluation, DerivedMetric
      components/             ← (vide, composants vraiment partagés uniquement)
      hooks/
      utils/

    lib/
      calculations.ts         ← (À CRÉER) durée totale, F1/F2, ratio surface/profondeur, ABV
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
- `features/batches/pages/BatchDetailPage.tsx` — (À CRÉER) écran central

Points de vigilance :
- Ne pas mélanger batch, mesures et événements dans une seule structure.
- Garder `initialParameters` et `cultureSnapshot` exploitables par IA.
- `cultureSnapshot.refrigerationDurationHours` est un champ analytiquement important.

### phases

Rôle : représenter F1, F2, réfrigération, nourrissage, pousse, apprêt, etc.

Points de vigilance :
- Phases liées au batch par `batchId`.
- Mesures, observations et événements liés à une phase via `phaseId` (optionnel).
- Ne pas créer un type Phase différent par fermentation.

### measurements

Rôle : mesures numériques horodatées.

Points de vigilance :
- `metric`, `unit`, `source` toujours renseignés.
- Ne pas stocker de mesure calculée ici (→ `derivedMetrics`).

### observations

Rôle : observations qualitatives structurées.

Points de vigilance :
- `category` et `descriptor` contrôlés.
- Note libre complémentaire seulement, jamais principale.

### events

Rôle : actions et jalons du process (fin F1, embouteillage, dégazage…).

Points de vigilance :
- `eventType` contrôlé, pas une note libre.
- `metadata` disponible pour données contextuelles additionnelles.

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

### lib/calculations.ts (À CRÉER)

Calculs produits à partir des données Dexie :
- durée totale du batch (endedAt - startedAt)
- durée F1 / F2 / réfrigération (par phases)
- ratio surface/profondeur (contenant)
- estimation ABV (si OG/FG disponibles)

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

---

## Règles locales importantes

- Données saisies et données calculées séparées.
- Tous les objets structurants ont `createdAt` et souvent `updatedAt`.
- Toutes les mesures ont `metric`, `value`, `unit`, `source`.
- Les événements process ne sont pas stockés comme simples notes.
- Ne pas créer de `KombuchaBatch`, `KefirBatch`, etc.
- `schemaVersion` à incrémenter dans le modèle JSON exporté à chaque changement de schéma.
