# Architecture FermentLab — MVP

> Dernière mise à jour : 2026-05-19

## 1. Modèle métier cible MVP

FermentLab est un journal expérimental de fermentation. Chaque fermentation est un **batch** : une expérience tracée du début à la fin, avec paramètres initiaux, étapes, mesures, observations, événements de process et évaluation finale.

```
Batch
  ├── initialParameters (ingrédients, volume, température cible)
  ├── cultureSnapshot (état de la culture au démarrage)
  ├── container (contenant utilisé)
  ├── [phases] F1, F2, réfrigération, nourrissage, etc.
  │     ├── [measurements] température, pH, densité SG, Brix, montée…
  │     ├── [observations] visuel, odeur, goût, texture, activité
  │     └── [processEvents] fin F1, début F2, embouteillage, dégazage…
  └── finalEvaluation (scores, succès, notes finales)

Calculs séparés :
  └── [derivedMetrics] durée totale, durée F1/F2, ratio surface/profondeur, ABV estimé
```

**Règle fondamentale :** les données saisies et les données calculées ne sont jamais mélangées. `DerivedMetric` est toujours produit à partir d'autres entités et jamais saisi directement.

---

## 2. Entités principales

### Batch

Entité centrale du système. Représente une fermentation comme une expérience complète.

Champs structurants :
- `schemaVersion` : permet les migrations futures.
- `profileId` : relie le batch à un profil de fermentation (water_kefir, milk_kefir, kombucha, sourdough_starter).
- `status` : `active` | `completed` | `abandoned`.
- `startedAt` / `endedAt` : horodatage ISO.
- `initialParameters` : volume cible, température cible, ingrédients.
- `container` : type, matériau, volume, surface, profondeur, ouverture.
- `cultureSnapshot` : état de la culture au démarrage (voir ci-dessous).

Fichier : `src/features/batches/types.ts`

### CultureSnapshot

Snapshot de l'état de la culture au démarrage du batch. N'est pas encore une entité indépendante (v2).

Champs structurants :
- `type` : kombucha_scoby | water_kefir_grains | milk_kefir_grains | sourdough_starter.
- `refrigerated` / `refrigerationDurationHours` : durée au froid — corrélation forte avec temps de latence et vigueur.
- `lastFeedingAt` / `hoursSinceLastFeeding` : fraîcheur du nourrissage.
- `estimatedActivityScore` (1–5) : évaluation subjective au démarrage.

Intégré directement dans `Batch` en MVP. Migrable vers entité `Culture` en v2.

### Phase

Étape d'une fermentation. Relie mesures, observations et événements à une fenêtre temporelle.

Types disponibles : `primary`, `secondary`, `refrigeration`, `feeding`, `rise`, `rest`, `bulk_fermentation`, `proofing`, `other`.

Exemples par profil :
- Kombucha : F1 → F2 → réfrigération.
- Kéfir de fruits : F1 → filtration/embouteillage → F2 → réfrigération.
- Levain : nourrissage → pousse → pic → retombée.

Fichier : `src/features/phases/types.ts`

### Measurement

Mesure chiffrée horodatée. Toujours associée à un `metric`, une `unit` et une `source`.

Métriques MVP : `temperature`, `ph`, `density_sg`, `brix`, `volume`, `weight`, `rise_percent`, `ambient_temperature`, `humidity`.

Sources : `manual` | `calculated` | `sensor`. MVP : manual uniquement.

Fichier : `src/features/measurements/types.ts`

### StructuredObservation

Observation qualitative typée. Catégories contrôlées : `visual`, `smell`, `taste`, `texture`, `activity`, `problem`.

Le descriptor est guidé par catégorie (liste ouverte en cas de besoin).
Intensité optionnelle (1–5).
Note libre complémentaire seulement.

Fichier : `src/features/observations/types.ts`

### ProcessEvent

Action ou jalon du process. Pas une note libre — un événement typé horodaté.

Types : `start_phase`, `end_phase`, `end_primary_fermentation`, `start_secondary_fermentation`, `end_secondary_fermentation`, `bottling`, `filtering`, `refrigeration`, `feeding`, `discard`, `ingredient_added`, `burping`, `mixing`, `other`.

Fichier : `src/features/events/types.ts`

### IngredientEntry

Ingrédient d'un batch. Chaque entrée a un type (`water`, `sugar`, `tea`, etc.), une quantité, une unité et un rôle (`base`, `substrate`, `inoculum`, `flavoring`, `additive`).

Stocké séparément dans IndexedDB (table `ingredients`), lié au batch par `batchId`.

Intégré dans `InitialParameters` au niveau des types.

### FinalEvaluation

Évaluation finale du batch à la clôture. Scores (1–5) : acidité, sucrosité, pétillance, alcool perçu, texture, global. Flags : `success`, `wouldRepeat`.

Fichier : `src/shared/types/common.ts`

### DerivedMetric

Valeur calculée à partir d'autres entités. Jamais saisie directement.

Métriques cibles : durée totale, durée F1/F2/réfrigération, ratio surface/profondeur, ABV estimé (si OG et FG disponibles).

Fichier : `src/shared/types/common.ts`  
Calculs : `src/lib/calculations.ts` (à créer)

---

## 3. Responsabilités des dossiers

```text
src/
  app/          → routing, shell applicatif
  db/           → schéma Dexie, instance IndexedDB
  features/     → domaines fonctionnels isolés (voir ci-dessous)
  shared/       → types, composants et hooks vraiment partagés
  lib/          → utilitaires purs (dates, unités, calculs)
```

### features/batches

Entité centrale. Contient : types Batch, pages Dashboard et CreateBatch, services CRUD, hooks Dexie.

Fichiers clés :
- `types.ts` : Batch, InitialParameters, ContainerInfo, CultureSnapshot, IngredientEntry.
- `pages/DashboardPage.tsx` : liste des batchs actifs et terminés.
- `pages/CreateBatchPage.tsx` : création d'un batch.
- `pages/BatchDetailPage.tsx` (à créer) : écran central avec timeline.
- `services/batchRepository.ts` (à créer) : CRUD Dexie pour les batchs.

### features/phases

Gestion des phases F1, F2, réfrigération, etc.
- `types.ts` : Phase, PhaseType.
- `services/phaseRepository.ts` (à créer).

### features/measurements

Mesures chiffrées horodatées.
- `types.ts` : Measurement, MeasurementMetric, MeasurementUnit.
- `services/measurementRepository.ts` (à créer).

### features/observations

Observations qualitatives structurées.
- `types.ts` : StructuredObservation, ObservationCategory, OBSERVATION_DESCRIPTORS.

### features/events

Événements de process.
- `types.ts` : ProcessEvent, ProcessEventType.

### features/profiles

Profils de fermentation statiques. Ne contient pas de logique Dexie.
- `types.ts` : FermentationProfile, PhaseTemplate.
- `data/profiles.ts` : 4 profils MVP (water_kefir, milk_kefir, kombucha, sourdough_starter).

### features/comparisons (à créer)

Tableau filtrable des batchs terminés pour comparaison.

### features/export (à créer)

Génération du JSON versionné IA-ready.

### db/

- `database.ts` : instance Dexie et schéma v1. Tables : batches, phases, ingredients, measurements, observations, processEvents, finalEvaluations, derivedMetrics.

### lib/

- `calculations.ts` (à créer) : durées, ratio, ABV.
- `dates.ts` (à créer) : formatage et calculs de dates.
- `units.ts` (à créer) : libellés des unités de mesure.

### shared/types/

- `common.ts` : FinalEvaluation, DerivedMetric (entités partagées non rattachées à une feature unique).

---

## 4. Décisions d'architecture

Les décisions détaillées sont dans `DECISIONS.md`. Résumé synthétique :

| Décision | Raison |
|---|---|
| Local-first / IndexedDB + Dexie | Pas de backend, offline, simplicité |
| Feature-first | Modifications locales, contexte IA réduit |
| CultureSnapshot dans Batch (pas entité Culture) | MVP simple, migrable en v2 |
| Pas de Zod en MVP | TypeScript compile-time suffisant, formulaires simples |
| Profils statiques (pas de BDD) | Données stables, pas de CRUD nécessaire |
| DerivedMetric séparé des Measurement | Intégrité des données, exploitabilité IA |
| schemaVersion dès le MVP | Anticiper les migrations IndexedDB |
| Timeline comme vue centrale | Clarté, saisie rapide en cuisine |
| Export JSON versionné prévu dès le départ | IA-ready sans refactor futur |

---

## 5. Hors périmètre MVP

| Fonctionnalité | Statut |
|---|---|
| Backend distant | Hors périmètre |
| Authentification | Hors périmètre |
| Synchronisation cloud | Hors périmètre |
| Multi-utilisateur | Hors périmètre |
| IA intégrée (suggestions, prédictions) | Hors périmètre |
| Capteurs connectés (Arduino, ESP32) | Hors périmètre |
| Graphiques (par batch ou comparatifs) | Reporté v1 |
| Import JSON | Reporté v1 |
| Photos / attachements | Reporté v1 |
| PWA installable | Reporté v1 |
| Entité Culture indépendante | Reporté v2 |
| Rappels / notifications | Reporté v2 |

---

## 6. Risques de complexité

### Risque 1 — Trop de champs dès le départ

**Symptôme :** formulaires longs, saisie pénible en cuisine.

**Mitigation :** tous les champs avancés sont optionnels. Seuls `profileId`, `name` et `startedAt` sont requis pour créer un batch.

### Risque 2 — Mélange entre données saisies et calculées

**Symptôme :** `DerivedMetric` confondu avec `Measurement`, ou durée stockée en double.

**Mitigation :** règle dure — `DerivedMetric` est toujours produit par `src/lib/calculations.ts`, jamais saisi directement. Jamais stocké dans `Measurement`.

### Risque 3 — Migrations IndexedDB

**Symptôme :** ajout ou renommage d'une colonne IndexedDB sans migration → données corrompues.

**Mitigation :** `schemaVersion` dans chaque `Batch`. Incrémenter `db.version()` dans `database.ts` à chaque modification de schéma. Ne jamais modifier la version 1 existante.

### Risque 4 — Spécialisation prématurée par fermentation

**Symptôme :** création de `KombuchaBatch`, `KefirBatch`, etc. avec duplication de logique.

**Mitigation :** un seul type `Batch`. Les différences sont portées par `profileId` et les `FermentationProfile` statiques. Aucun type spécialisé par fermentation.

### Risque 5 — Explosion du détail batch

**Symptôme :** `BatchDetailPage` qui rassemble toutes les features → fichier de 800 lignes, impossible à maintenir avec IA.

**Mitigation :** découper en composants isolés : `PhaseManager`, `QuickAddPanel`, `TimelineView`, `BatchSummary`. Chaque composant dans sa feature.

### Risque 6 — Notes libres comme données principales

**Symptôme :** pH saisi dans `notes` au lieu de `Measurement`, observation dans un champ texte libre.

**Mitigation :** l'UI doit rendre la saisie structurée plus rapide que la note libre. Les champs structurés sont affichés en premier.

---

## 7. Stratégie export JSON IA-ready

### Objectif

Produire un fichier JSON par batch, versionné, exploitable par un LLM sans preprocessing.

### Format cible

```json
{
  "schemaVersion": "1.0",
  "exportedAt": "2026-05-19T00:00:00.000Z",
  "batch": { ... },
  "phases": [ ... ],
  "ingredients": [ ... ],
  "measurements": [ ... ],
  "observations": [ ... ],
  "processEvents": [ ... ],
  "finalEvaluation": { ... },
  "derivedMetrics": [ ... ]
}
```

### Règles de l'export

- `schemaVersion` correspond à la version du schéma au moment de l'export.
- Toutes les unités sont explicites dans les objets (jamais implicites).
- Toutes les dates sont ISO 8601.
- Les IDs sont des UUID.
- Aucune donnée calculée dans `measurements` — uniquement dans `derivedMetrics`.
- Les observations ont un `category` et un `descriptor` contrôlés.
- Les événements ont un `eventType` contrôlé.

### Implémentation prévue

- Feature : `src/features/export/services/exportService.ts`.
- Lit toutes les tables Dexie liées au batch.
- Produit un objet JSON sérialisable.
- Déclenche un téléchargement `.json` côté navigateur.
- Pas de backend requis.

### Usage IA cible

Le fichier exporté doit permettre à un LLM de répondre à des questions comme :
- "Quel batch a eu la meilleure évaluation finale ?"
- "Quel est l'impact du temps de réfrigération de la culture sur la durée F1 ?"
- "Quels paramètres initiaux sont corrélés aux meilleurs scores ?"

Cela nécessite que chaque donnée soit typée, horodatée et étiquetée avec son unité.
