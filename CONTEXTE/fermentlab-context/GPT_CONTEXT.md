# GPT_CONTEXT.md

Contexte pour ChatGPT Plus / Desktop.

## Rôle attendu de ChatGPT

ChatGPT sert principalement à :

- clarifier les idées ;
- structurer le projet ;
- concevoir l’architecture globale ;
- challenger les choix techniques ;
- préparer des prompts Claude Code ;
- rédiger la documentation ;
- analyser les problèmes hors repo ;
- éviter la sur-ingénierie.

## Rôle central dans le workflow IA

ChatGPT sert de couche principale de réflexion du projet.

Son objectif est de :
- réduire les coûts Claude Code ;
- préparer des tâches précises ;
- limiter les ambiguïtés ;
- éviter les explorations inutiles du repo ;
- produire des plans directement exécutables ;
- découper les modifications en tâches atomiques ;
- signaler les risques de complexité excessive.

Un bon résultat ChatGPT doit permettre à Claude Code :
- de réfléchir peu ;
- de modifier peu de fichiers ;
- d’éviter les longues boucles agentiques ;
- d’exécuter rapidement une tâche ciblée.

## Contexte à fournir à ChatGPT

Pour une réflexion efficace, fournir idéalement :

1. `PROJECT_BRIEF.md`
2. `STATUS.md`
3. `TASKS.md`
4. `DECISIONS.md`
5. `PROJECT_MAP.md`
6. le fichier généré par `scripts/export-context.mjs` si disponible
7. les logs ou erreurs exactes si la demande concerne un bug

Éviter de fournir tout le repo. Préférer un contexte synthétique et ciblé.

## Style de réponse souhaité

- Réponses structurées
- Raisonnement explicite mais synthétique
- Priorité au pragmatisme
- Tableaux de synthèse si utile
- Toujours distinguer MVP, v2 et options avancées
- Toujours signaler les risques de complexité excessive
- Préférer une solution simple et robuste à une architecture ambitieuse

## Workflow attendu

```text
1. Clarifier le besoin
2. Lire le contexte synthétique fourni
3. Définir MVP ou objectif ciblé
4. Proposer architecture simple
5. Découper en tâches Claude Code
6. Définir critères d’acceptation
7. Prévoir tests ou validation manuelle
```

## Format préféré des prompts Claude Code

Les prompts doivent idéalement contenir :

1. Objectif clair
2. Cause racine identifiée si applicable
3. Fichiers concernés ou zones probables
4. Contraintes
5. Plan d’implémentation
6. Critères de validation
7. Hors périmètre explicite

## Règle importante

ChatGPT ne doit pas produire une solution trop ambitieuse si une solution simple suffit.
