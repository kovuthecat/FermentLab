# Conventions d’usage IA

## Objectif

Optimiser l’utilisation des IA en séparant clairement :

- la réflexion, assurée par ChatGPT ;
- l’implémentation, assurée par Claude Code.

Le but est de réduire :
- la consommation de tokens Claude Code ;
- les explorations inutiles du repo ;
- les boucles agentiques longues ;
- les refactors non nécessaires ;
- les tâches trop larges ou mal cadrées.

## Workflow principal

### ChatGPT

À utiliser pour :
- clarification du besoin ;
- architecture ;
- UX ;
- conception produit ;
- découpage des tâches ;
- stratégie technique ;
- documentation ;
- analyse complexe hors repo ;
- préparation des prompts Claude Code ;
- réduction du scope et de la complexité.

### Claude Code

À utiliser pour :
- implémentation ;
- modifications ciblées du repo ;
- corrections locales ;
- tests ;
- validation technique ;
- refactors limités et explicitement demandés ;
- investigation locale pour identifier les fichiers pertinents.

## Séparation des responsabilités

ChatGPT réfléchit.
Claude Code exécute.

Claude Code peut investiguer localement le repo, mais uniquement pour produire un contexte ciblé ou identifier les fichiers pertinents. Il ne doit pas transformer cette investigation en réflexion d’architecture globale.

## Règle de retour vers ChatGPT

Si une tâche nécessite :
- une réflexion large ;
- une redéfinition d’architecture ;
- une réflexion UX ;
- un arbitrage complexe ;
- une exploration importante du repo ;
- plusieurs stratégies possibles ;
- ou un refactor global ;

Claude Code doit :

1. interrompre l’implémentation ;
2. résumer le problème ;
3. suggérer explicitement de retourner dans ChatGPT pour clarifier la stratégie avant de continuer.

## Gestion du contexte quand le repo grossit

Utiliser trois outils complémentaires :

1. `PROJECT_MAP.md`
   - carte permanente des features, fichiers clés et responsabilités.

2. `scripts/export-context.mjs`
   - génération ponctuelle d’un contexte synthétique à fournir à ChatGPT.

3. `prompts/claude-code-investigation.md`
   - prompt pour demander à Claude Code d’identifier les fichiers pertinents sans modifier le repo.

## Anti-patterns à éviter

- Utiliser Claude Code pour brainstormer
- Lancer Claude Code sur des tâches floues
- Donner un scope trop large
- Demander des refactors globaux
- Modifier de nombreux fichiers sans nécessité
- Réimplémenter une architecture entière sans gain clair
- Faire explorer le repo à Claude Code sans objectif précis
- Demander à Claude Code de choisir seul une stratégie produit

## Bon usage de Claude Code

Un bon prompt Claude Code doit contenir :

1. objectif précis ;
2. fichiers ou zones concernées ;
3. contraintes ;
4. hors périmètre ;
5. critères de validation ;
6. consigne de mise à jour des fichiers de contexte ;
7. consigne commit + push.
