# Workflow IA — ChatGPT + Claude Code

Fichier de référence pour la répartition du travail entre les deux IA.
Les autres fichiers de contexte y renvoient au lieu de le paraphraser.

## Principe

- **ChatGPT** : couche de réflexion en amont (architecture, UX, produit, découpage,
  préparation des prompts). Surtout utile pour les gros arbitrages.
- **Claude Code** : implémentation et investigation locale dans le repo. Peut aussi
  concevoir et cadrer les sujets petits et moyens via le plan mode.

La frontière n'est pas étanche : Claude Code conçoit ce qu'il peut traiter seul,
et n'escalade vers ChatGPT que quand l'arbitrage dépasse une tâche.

## ChatGPT — à utiliser pour

- clarifier le besoin et réduire le scope ;
- architecture globale et stratégie technique ;
- conception du modèle de données (fermentation, phases, mesures) ;
- découpage en tâches Claude Code ;
- challenger les choix, éviter la sur-ingénierie ;
- documentation et analyse complexe hors repo.

### Contexte à lui fournir

Un contexte synthétique et ciblé, jamais tout le repo :

1. `PROJECT_BRIEF.md`  2. `STATUS.md`  3. `TASKS.md`  4. `DECISIONS.md`
5. `PROJECT_MAP.md`  6. la sortie de `scripts/export-context.py` si disponible
7. les logs / erreurs exactes pour un bug.

## Claude Code — à utiliser pour

- implémentation et modifications ciblées ;
- corrections locales, tests, validation technique ;
- conception et cadrage des sujets petits/moyens (plan mode) ;
- investigation locale pour identifier les fichiers pertinents ;
- refactors limités et explicitement demandés.

### Règle d'escalade vers ChatGPT

Escalader seulement pour un **gros arbitrage** : changement de stack, refactor
structurant, plusieurs stratégies produit, décision à fort impact long terme.
Alors : 1. interrompre l'implémentation ; 2. résumer le problème ; 3. recommander
le retour vers ChatGPT avant de continuer.

### Anatomie d'un bon prompt Claude Code

1. objectif précis ;
2. cause racine identifiée si applicable ;
3. fichiers ou zones concernées ;
4. contraintes ;
5. hors périmètre explicite ;
6. critères de validation ;
7. consigne de mise à jour des fichiers de contexte + commit/push.

## Anti-patterns à éviter

- lancer Claude Code sur une tâche floue ou un scope trop large ;
- demander un refactor global sans gain clair ;
- modifier de nombreux fichiers sans nécessité ;
- faire explorer le repo sans objectif précis ;
- déléguer à ChatGPT un sujet que Claude Code peut traiter seul.

## Outils quand le repo grossit

1. `PROJECT_MAP.md` — carte permanente des features et fichiers clés.
2. `scripts/export-context.py` — contexte synthétique ponctuel pour ChatGPT.
3. `prompts/claude-code-investigation.md` — investigation ciblée sans modification.
