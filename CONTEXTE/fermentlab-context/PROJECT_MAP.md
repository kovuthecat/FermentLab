# PROJECT_MAP.md

Carte synthétique du projet FermentLab.

## Vue d'ensemble

Application React/Vite/TypeScript local-first pour suivre des fermentations personnelles sous forme de batchs expérimentaux.

Flux principal : créer un batch, saisir paramètres initiaux, suivre phases/mesures/observations/événements, clôturer, comparer les résultats.

## Arborescence cible

```text
src/
  app/
    App.tsx
    routes.tsx

  db/
    database.ts
    schema.ts
    migrations.ts

  features/
    batches/
      components/
      hooks/
      pages/
      services/
      types.ts

    phases/
      components/
      hooks/
      services/
      types.ts

    measurements/
      components/
      hooks/
      services/
      types.ts

    observations/
      components/
      hooks/
      services/
      types.ts

    events/
      components/
      hooks/
      services/
      types.ts

    profiles/
      data/
      services/
      types.ts

    comparisons/
      components/
      pages/
      services/
      types.ts

    export/
      services/
      types.ts

    photos/
      services/
      types.ts

  shared/
    components/
    hooks/
    utils/
    types/

  lib/
    dates.ts
    units.ts
    calculations.ts
```

## Features principales

### batches

Rôle : gestion des fermentations suivies comme expériences.

Fichiers clés attendus :

- `features/batches/types.ts`
- `features/batches/services/batchRepository.ts`
- `features/batches/pages/BatchDetailPage.tsx`
- `features/batches/pages/CreateBatchPage.tsx`

Points de vigilance :

- ne pas mélanger batch, mesures et événements dans une seule structure géante ;
- garder les paramètres initiaux exploitables par IA ;
- intégrer `cultureSnapshot` dès le MVP.

### phases

Rôle : représenter F1, F2, réfrigération, nourrissage, pousse, apprêt, etc.

Points de vigilance :

- les phases sont liées au batch ;
- les mesures, observations et événements peuvent être liés à une phase ;
- ne pas créer un modèle différent par type de fermentation.

### measurements

Rôle : mesures numériques horodatées.

Points de vigilance :

- unité obligatoire ;
- metric contrôlée ;
- source obligatoire : manual/calculated/sensor ;
- ne pas stocker de mesure dans une note libre.

### observations

Rôle : observations qualitatives structurées.

Points de vigilance :

- catégorie contrôlée ;
- descripteur contrôlé autant que possible ;
- intensité optionnelle ;
- note libre complémentaire seulement.

### events

Rôle : actions et jalons du process.

Exemples : fin F1, début F2, fin F2, embouteillage, mise au froid, nourrissage, dégazage.

### profiles

Rôle : définir les profils de fermentation et suggestions de champs.

MVP :

- kéfir de fruits ;
- kéfir de lait ;
- kombucha ;
- levain.

### comparisons

Rôle : comparer des batchs selon paramètres, durées, mesures finales et scores.

Commencer par tableau simple avant graphes avancés.

### export

Rôle : générer un JSON versionné exploitable par IA.

## Fichiers transversaux importants

### db

Gestion Dexie/IndexedDB, schéma et migrations.

### lib/calculations.ts

Calculs simples :

- durée totale ;
- durée F1/F2 ;
- temps de réfrigération ;
- ratio surface/profondeur ;
- estimation ABV si OG/FG disponibles.

### lib/units.ts

Gestion des unités et libellés.

## Zones à risque ou coûteuses en contexte IA

- Modèle de données global.
- Migrations IndexedDB.
- Comparaisons multi-entités.
- Photos et stockage local.
- Export/import JSON.

## Règles locales importantes

- Données saisies et données calculées séparées.
- Tous les objets structurants doivent avoir `createdAt` et souvent `updatedAt`.
- Toutes les mesures doivent avoir `metric`, `value`, `unit`, `source`.
- Les événements process ne doivent pas être stockés comme simples notes.
- Ne pas créer de `KombuchaBatch`, `KefirBatch`, etc. Préférer profils + champs configurables.
