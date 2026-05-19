# Rapport de consolidation FermentLab

> Généré le 2026-05-19 — investigation statique, aucun fichier métier modifié.

---

## Résumé global

Le projet est bien structuré pour un MVP local-first. La séparation features/repositories/hooks est cohérente, les types sont précis, et les calculs sont correctement isolés dans `lib/calculations.ts`. Le principal problème structurel est une **dualité de stockage des ingrédients** qui crée déjà une source de vérité ambiguë. Les autres fragilités sont des duplications de constantes et de helpers qui vont diverger, une table Dexie zombie (`derivedMetrics`), et l'absence totale d'utilisation de `phaseId` dans les formulaires alors que le modèle le prévoit.

---

## Forces actuelles

- Architecture features-first propre et cohérente
- Repositories minces, sans logique métier
- `lib/calculations.ts` : fonctions pures bien isolées, réutilisées par export et comparaison
- Schéma Dexie v1 simple, pas encore de dette de migration
- Types TypeScript précis (union types, branded scores 1|2|3|4|5)
- Export JSON IA-ready fonctionnel et conforme à la spec
- Séparation nette données saisies vs calculées (règle `DerivedMetric` respectée côté export)
- Quick actions par profil : bonne ergonomie opérationnelle
- Tableau de comparaison avec fallback cartes mobile : pattern correct

---

## Limites identifiées

### Modèle métier

| Problème | Impact | Gravité | Recommandation |
|---|---|---|---|
| **Dualité ingrédients** : `batch.initialParameters.ingredients[]` toujours vide à la création (`CreateBatchPage`), mais la table `ingredients` contient les vrais ingrédients. `exportService` fusionne les deux avec dédup. | Export correct mais modèle confus pour tout futur développeur | Élevée | Vider `initialParameters.ingredients` du type `Batch` et ne garder que la table `ingredients`. Documenter ou migrer. |
| **`CultureSnapshot.hoursSinceLastFeeding`** redondant avec `lastFeedingAt` (calculable). Non collecté dans `CreateBatchPage`, non affiché dans `BatchDetailPage`. | Champ fantôme | Moyenne | Supprimer ou calculer à la volée depuis `lastFeedingAt` |
| **Phases simultanées du même type autorisées** : rien n'empêche deux phases `primary` actives. `findActiveByType` retourne `.find()` donc la première silencieusement. | Données incohérentes silencieuses | Moyenne | Vérifier unicité dans `phaseRepository.add` ou dans les quick actions |
| **`ProcessEvent.metadata` non structuré** : `Record<string, unknown>` pour `ingredient_added`, `container_changed` — informations importantes perdues | Exploitation IA impossible sur ces events | Moyenne | Définir des payloads typés par `eventType` (`IngredientAddedPayload`, etc.) — peut être fait progressivement |
| **Levain inadapté au modèle batch** : un levain est une culture perpétuelle avec des cycles répétés. Le modèle "1 batch = 1 fermentation" rend difficile le suivi de cycles quotidiens (nourrissage/pousse/retombée). | Friction utilisateur pour le cas d'usage principal du levain | Moyenne | Documenter la limite ; prévoir dans la roadmap un mode "cycle levain" |
| **`FinalEvaluation` scores non filtrés par profil** : `carbonationScore` pour un levain, `alcoholPerceptionScore` pour du kéfir de lait — dimensions sans sens selon le profil. | Données aberrantes dans l'export IA | Faible | Filtrer les scores affichés/exportés selon `profileId` |
| **Pas de lien entre batches successifs d'une même culture** : deux batches kéfir partageant les mêmes grains ne sont pas liés. Impossible de tracer l'histoire d'une culture. | Limite analytique future | Faible | Documenter ; prévoir un champ `parentBatchId` ou un "lineage" de culture dans la roadmap |

### Architecture code

| Problème | Impact | Gravité | Recommandation |
|---|---|---|---|
| **`DESCRIPTOR_LABELS` dupliqué** : définition identique dans `BatchTimeline.tsx:50-61` et `ObservationForm.tsx:21-32` | Divergence inévitable à la prochaine modification | Élevée | Extraire dans `observations/types.ts` ou `observations/constants.ts` |
| **`nowDatetimeLocal()` dupliqué** : défini dans `MeasurementForm`, `ObservationForm`, `BatchCloseForm`, `PhaseForm`, `CreateBatchPage` — 5 copies | Modification = 5 fichiers à toucher | Élevée | Extraire dans `shared/utils/date.ts` |
| **`CULTURE_TYPE_LABELS` dupliqué** : dans `CreateBatchPage.tsx:25-31` et `BatchDetailPage.tsx:34-40` | Divergence silencieuse future | Moyenne | Extraire dans `batches/constants.ts` |
| **Double calcul agrégé** : `comparisonService.ts` et `exportService.ts` appellent les mêmes fonctions de `calculations.ts` avec la même structure. Ajouter un calcul = 2 fichiers à modifier. | Divergence future certaine | Moyenne | Extraire `buildCalculatedSummary(batch, phases, measurements)` dans `calculations.ts` et la réutiliser dans les deux services |
| **`buildQuickActions()` dans `PhaseList.tsx`** : logique de workflow métier (quelle phase ouvrir/fermer selon profil) dans un composant UI de 275 lignes | Difficile à tester, couplé à l'UI | Moyenne | Déplacer dans `phases/services/phaseWorkflow.ts` |
| **`phaseId` jamais assigné** : `MeasurementForm`, `ObservationForm`, `ProcessEventForm` n'ont pas de champ `phaseId`. Le champ existe dans tous les modèles mais n'est jamais populé. | Données contextuelles manquantes | Faible | Ajouter sélection de phase optionnelle dans les formulaires (phase active par défaut) |
| **`BatchDetailPage.tsx` god component** : 345 lignes, 15 imports, 6 hooks, 5 sections. Va grossir avec chaque feature. | Contexte Claude Code croissant | Faible-Moyenne | Surveiller ; extraire `BatchTrackingSection` et `BatchInfoSection` quand > 500 lignes |

### Dexie / persistance

| Problème | Impact | Gravité | Recommandation |
|---|---|---|---|
| **Table `derivedMetrics` zombie** : créée dans le schéma, nettoyée dans `batchRepository.remove()`, mais jamais alimentée ni lue dans le code applicatif | Bruit dans le schéma ; fausse piste pour tout développeur | Moyenne | Supprimer la table du schéma (migration v2) et retirer de la classe, ou implémenter le cas d'usage |
| **Objet complexe embarqué dans `Batch`** : `initialParameters`, `container`, `cultureSnapshot` sont des objets JSON imbriqués. Une migration structurelle future nécessitera une transformation des données en place. | Risque de migration v2+ | Faible | Documenter dans DECISIONS.md ; planifier un schéma v2 avant d'atteindre 50+ batchs |
| **Contrainte d'unicité absente sur `FinalEvaluation`** : rien n'empêche d'insérer deux `FinalEvaluation` pour le même batch. `getByBatch` retourne `.first()` silencieusement. | Données silencieusement dupliquées | Faible | Ajouter un index unique sur `batchId` dans le schéma Dexie (migration v2) |
| **`phaseId` indexé mais jamais requêté** : l'index `phaseId` est déclaré dans `measurements`, `observations`, `processEvents`, mais aucune requête `.where("phaseId")` n'existe dans les repositories. | Index mort, bruit léger | Faible | Acceptable tant que `phaseId` n'est pas utilisé ; nettoyer ou exploiter en même temps |
| **Suppression des entités orphelines absente** : si on supprime une phase, les mesures/observations/events avec ce `phaseId` gardent une référence morte | Cohérence des données dégradée | Faible | Ajouter la suppression des entités liées dans `phaseRepository.remove()` |

### UX

| Problème | Impact | Gravité | Recommandation |
|---|---|---|---|
| **Pas de suppression de mesure/observation/event** : les repositories ont `remove()` mais aucune UI ne l'expose. | L'utilisateur ne peut pas corriger une saisie erronée | Élevée | Ajouter un bouton "Supprimer" inline dans la timeline |
| **Pas d'édition de mesure/observation** : une fois enregistré, impossible de corriger la valeur ou le timestamp. | Friction lors d'une faute de frappe | Moyenne | Ajouter édition inline ou modal depuis la timeline |
| **Phases absentes de la timeline** : `BatchTimeline` ne montre pas les phases. L'utilisateur doit regarder deux sections pour comprendre "cette mesure a été prise pendant F2". | Perte de contexte temporel | Moyenne | Intégrer les phases comme marqueurs ou "bands" dans la timeline |
| **Formulaire `BatchCloseForm` surchargé** : 6 scores + 2 checkboxes + 2 textareas sur mobile. | Friction élevée à la clôture | Moyenne | Séparer score global (obligatoire) + scores détaillés (collapsible optionnel) |
| **Champs `appearance` et `smell` du `CultureSnapshot` jamais affichés** : collectés à la création mais invisibles dans `BatchDetailPage`. | Informations perdues côté affichage | Faible | Afficher tous les champs non-null dans `CultureSection` |
| **Pas de confirmation de succès des quick actions** : cliquer "Fin F1" n'affiche pas de retour visuel de succès clair (juste état `busy`). | UX dégradée sur mobile | Faible | Toast ou mise à jour visuelle explicite post-action |
| **Table de comparaison trop dense** : 19 colonnes dont 8+ peuvent être "—" pour des batches simples. | Lisibilité desktop dégradée | Faible | Permettre de masquer/afficher des colonnes, ou regrouper par catégorie |

### Exploitation IA future

| Problème | Impact | Gravité | Recommandation |
|---|---|---|---|
| **`ProcessEvent.metadata` non structuré** : les events `ingredient_added` n'ont pas de payload d'ingrédient structuré. Une IA ne peut pas savoir ce qui a été ajouté. | Données d'événements inutilisables par IA | Élevée | Typer les payloads par `eventType` : `IngredientAddedPayload`, `ContainerChangedPayload` |
| **Scores `FinalEvaluation` hors profil** : `carbonationScore` pour un levain, `alcoholPerceptionScore` pour du kéfir de lait — données sans sens dans l'export. | Bruit dans l'analyse IA | Moyenne | Inclure un champ `applicableScores: string[]` dans l'export selon `profileId` |
| **Unités `volume` non normalisées** : une mesure peut être en `ml` ou `l`. L'IA doit normaliser avant toute comparaison inter-batchs. | Risque d'erreur analytique | Moyenne | Normaliser en litres à l'export dans `calculatedSummary`, ou fixer une unité canonique par métrique |
| **`descriptor` potentiellement libre** : malgré les suggestions, le choix "other" permet une saisie libre non normalisée dans l'export IA. | Clustering impossible sans nettoyage | Faible | Documenter ; ajouter un `normalizedDescriptor` dans l'export si nécessaire |
| **`schemaVersion` non vérifié** : actuellement `"1.0"` string, jamais validé. Si le schéma évolue, un export IA peut recevoir des batchs de versions différentes sans discrimination. | Compatibilité IA future | Faible | S'assurer que `schemaVersion` est incrémenté à chaque migration Dexie |

### Maintenabilité Claude Code

| Problème | Impact | Gravité | Recommandation |
|---|---|---|---|
| **`DESCRIPTOR_LABELS` dupliqué × 2** : toute modification de labels demande de charger et modifier 2 fichiers. Risque d'oubli d'une instance. | Coût contexte × 2 pour les modifications de labels | Élevée | Centraliser (voir section Architecture) |
| **`nowDatetimeLocal()` × 5** : même logique dans 5 fichiers. Claude Code risque de ne modifier que certaines instances. | Incohérence silencieuse possible | Élevée | Centraliser dans `shared/utils/date.ts` |
| **`buildQuickActions()` dans `PhaseList.tsx`** : logique de workflow par profil dans un composant UI. Ajouter un profil ou modifier un workflow = charger un composant UI de 275 lignes. | Contexte mal centré pour une tâche métier | Moyenne | Extraire dans `phases/services/phaseWorkflow.ts` |
| **`comparisonService` et `exportService` dupliquent la logique d'agrégation** : si on ajoute un calcul (ex. `maxPh`), Claude Code doit modifier deux fichiers structurellement similaires mais syntaxiquement distincts. | Risque d'oubli sur un fichier | Moyenne | Extraire `buildCalculatedSummary()` dans `calculations.ts` |
| **`BatchDetailPage.tsx` 345 lignes** : chargé intégralement pour toute modification. Les prochaines features vont l'agrandir. | Coût contexte croissant | Faible-Moyenne | Surveiller ; extraire quand > 500 lignes |
| **`CreateBatchPage.tsx` 471 lignes** : plus grand fichier du projet, toute la logique de création inline, pas de sous-composants. | Coût contexte élevé pour modifications ciblées | Faible | Acceptable MVP ; extraire `CultureSnapshotForm` et `IngredientDraftsForm` à terme |

---

## Top 5 priorités de consolidation

1. **Centraliser `DESCRIPTOR_LABELS` et `nowDatetimeLocal()`**
   Duplications directes, risque de divergence silencieuse à la prochaine modification. Coût de correction : faible. Risque si non fait : moyen.

2. **Clarifier la dualité ingrédients**
   `batch.initialParameters.ingredients` est toujours vide, la vraie source est la table `ingredients`. Documenter explicitement dans le modèle ou nettoyer le type `Batch`. Sans intervention, tout futur développeur va tenter d'utiliser le mauvais tableau.

3. **Supprimer la table `derivedMetrics` (migration v2 Dexie)**
   Zombie actif dans le schéma. Décision à prendre maintenant, avant d'avoir des données en production qui rendraient la migration plus risquée.

4. **Extraire `buildCalculatedSummary()`**
   `comparisonService` et `exportService` répètent les mêmes ~20 lignes de calculs. La prochaine feature analytique créerait une troisième copie.

5. **Ajouter suppression de mesure/observation depuis la timeline**
   C'est la friction UX la plus bloquante : impossible de corriger une saisie erronée. Tout utilisateur qui se trompe de valeur est coincé.

---

## Refactors à envisager plus tard

- Extraire `CultureSnapshotForm` de `CreateBatchPage` pour réduire les 471 lignes et permettre une éventuelle modification du snapshot post-création
- Intégrer les phases dans `BatchTimeline` comme marqueurs temporels — dépend d'abord de la décision de peupler `phaseId`
- Typer les payloads `ProcessEvent.metadata` par `eventType` — nécessaire avant d'atteindre l'objectif d'exploitation IA
- Ajouter la phase active comme valeur par défaut dans les formulaires de saisie — dépend d'abord du peuplement de `phaseId`
- Extraire `buildQuickActions()` de `PhaseList.tsx` vers `phases/services/phaseWorkflow.ts`

---

## Refactors explicitement NON recommandés maintenant

- Normaliser l'architecture complète de `BatchDetailPage` en sous-composants — prématuré, fonctionnel
- Changer la stack (Dexie, React, Vite) — pas de problème justifiant ce coût
- Ajouter une couche de service supplémentaire entre hooks et repositories — la couche actuelle est suffisante
- Migrer `CultureSnapshot` en entité indépendante avec sa propre table — valeur future, risque de migration élevé, pas de valeur immédiate au stade MVP

---

## Recommandation finale

- [ ] Continuer les features
- [x] **Consolider avant nouvelles features**

**Raison :** Les duplications `DESCRIPTOR_LABELS` et `nowDatetimeLocal` vont être touchées dans les prochaines features (édition de timeline, nouvelles observations). Si on les laisse se dupliquer davantage, le coût de correction monte. La dualité ingrédients est une confusion active qui va coûter du débogage. La table `derivedMetrics` doit être clarifiée maintenant, avant que des données réelles ne compliquent la migration. La suppression depuis la timeline est un bug UX bloquant pour tout utilisateur réel.

Le volume de consolidation est petit (3–4 PR courtes) et débloque les features suivantes sur des fondations plus saines.
