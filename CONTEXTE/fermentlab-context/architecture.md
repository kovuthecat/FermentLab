# Conventions d’architecture

## Priorités

1. Simplicité
2. Lisibilité
3. Maintenabilité
4. Testabilité
5. Extensibilité seulement si nécessaire

## Compatibilité IA

L’architecture doit favoriser :

- compréhension rapide du projet ;
- faible couplage ;
- isolation des features ;
- fichiers courts ;
- composants autonomes ;
- debug localisé ;
- modifications ciblées ;
- faible besoin de contexte global.

Une architecture légèrement moins “parfaite”
mais plus facile à manipuler par IA est préférable.

## Organisation feature-first

Quand le projet grossit, privilégier une organisation par domaine fonctionnel :

```text
src/
  features/
    feature-a/
    feature-b/
    feature-c/
```

Chaque feature doit idéalement contenir :
- ses composants ;
- ses hooks ;
- ses types ;
- ses utilitaires locaux ;
- sa logique métier spécifique.

Les dossiers globaux doivent rester limités aux éléments réellement partagés.

## Règles

- Ne pas créer d’abstraction avant besoin réel.
- Préférer des fichiers courts.
- Nommer explicitement les fonctions.
- Éviter les dépendances lourdes.
- Documenter les décisions importantes.
- Distinguer clairement MVP et améliorations futures.
- Éviter les architectures nécessitant une compréhension globale permanente.
- Préférer des modules simples et explicites.
- Maintenir `PROJECT_MAP.md` quand l’organisation du projet évolue.

## Structure générique

```text
src/
  components/
  features/
  lib/
  hooks/
  types/
docs/
  architecture.md
  ux.md
PROJECT_MAP.md
```

## Garde-fous

Avant d’ajouter une abstraction, vérifier :

1. Le besoin est-il réel maintenant ?
2. La duplication actuelle est-elle réellement problématique ?
3. L’abstraction réduit-elle la complexité ou la déplace-t-elle ?
4. Claude Code pourra-t-il modifier cette zone sans charger beaucoup de contexte ?
