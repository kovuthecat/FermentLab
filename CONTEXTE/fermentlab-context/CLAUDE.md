# CLAUDE.md

Instructions permanentes pour Claude Code dans ce projet.

## Règles générales

- Lire `PROJECT_BRIEF.md` avant toute tâche importante.
- Lire `DECISIONS.md` avant toute proposition d’architecture.
- Lire `PROJECT_MAP.md` pour localiser rapidement les zones fonctionnelles concernées.
- Modifier le minimum de fichiers nécessaire.
- Ne pas faire de refactor global sans demande explicite.
- Ne pas changer la stack sans validation.
- Ne pas ajouter de dépendance lourde sans justification.
- Privilégier la simplicité et la maintenabilité.
- Conserver le style existant du projet.
- Éviter les changements cosmétiques inutiles.

## Rôle de Claude Code

Claude Code est utilisé principalement comme moteur d’implémentation.

Son objectif est de :
- modifier le minimum de fichiers ;
- limiter les changements ;
- réduire les coûts de contexte ;
- éviter les explorations inutiles du repo ;
- exécuter des tâches clairement définies ;
- lancer les tests ou validations pertinentes.

Claude Code ne doit pas devenir un agent de réflexion globale du projet.

## Séparation des responsabilités

ChatGPT réfléchit.
Claude Code exécute.

Claude Code ne doit pas être utilisé comme moteur principal :
- d’architecture ;
- de brainstorming ;
- de conception produit ;
- d’exploration large du projet ;
- d’arbitrage stratégique.

## Avant de coder

Toujours produire un plan court :

1. Cause ou objectif compris
2. Fichiers probablement concernés
3. Plan en 3 à 5 étapes
4. Risques éventuels

Le plan doit rester bref. Ne pas transformer cette étape en analyse longue.

## Mode investigation sans modification

Pour un bug ou une tâche dont les fichiers concernés ne sont pas évidents, commencer par une phase d’investigation.

Utiliser le prompt type dans :

```text
prompts/claude-code-investigation.md
```

Objectif :
- identifier les fichiers pertinents ;
- suivre le flux concerné ;
- formuler une hypothèse racine ;
- ne modifier aucun fichier.

Après investigation, si la stratégie reste incertaine, recommander un retour vers ChatGPT.

## Si la tâche devient ambiguë ou trop large

Si durant une tâche il apparaît que :
- l’architecture doit être repensée ;
- plusieurs stratégies importantes sont possibles ;
- le scope devient trop large ;
- une exploration importante du repo est nécessaire ;
- les contraintes produit/UX sont floues ;
- ou qu’un refactor global semble nécessaire ;

ALORS :

- arrêter l’implémentation ;
- résumer clairement le problème ;
- proposer explicitement un retour vers ChatGPT pour réflexion et cadrage ;
- attendre une nouvelle consigne plus ciblée.

## Pendant l’implémentation

- Procéder par petites modifications.
- Conserver le style existant.
- Éviter les changements cosmétiques inutiles.
- Ne pas reformater tout le projet.
- Ne pas modifier des fichiers non concernés.
- Ne pas élargir le scope sans raison explicite.
- Préférer une solution locale simple à une abstraction globale.

## Optimisation des tokens

Toujours privilégier :
- tâches atomiques ;
- modifications locales ;
- plans courts ;
- faible nombre de fichiers ;
- contexte minimal utile ;
- validation rapide.

Éviter :
- longues réflexions internes ;
- analyses spéculatives ;
- explorations larges ;
- refactors prématurés ;
- relectures inutiles de nombreux fichiers ;
- propositions d’architecture non demandées.

## Export de contexte

Avant une phase de réflexion dans ChatGPT, si le projet est devenu trop gros pour sélectionner les fichiers à la main, utiliser :

```bash
node scripts/export-context.mjs
```

Le fichier généré doit servir de contexte synthétique pour ChatGPT.

## Après chaque modification

Claude Code doit systématiquement :

1. Mettre à jour les fichiers de contexte pertinents :
   - `STATUS.md`
   - `TASKS.md`
   - `DECISIONS.md`
   - `PROJECT_MAP.md` si des fichiers, features ou responsabilités changent
   - `ROADMAP.md` si nécessaire
   - `PROJECT_BRIEF.md` si le périmètre change
   - autres fichiers concernés si nécessaire

2. Vérifier l’état Git :

```bash
git status
```

3. Créer un commit clair et atomique :

```bash
git add .
git commit -m "Message clair décrivant l’intention"
```

4. Push les changements :

```bash
git push
```

Ne jamais laisser le repo dans un état modifié non documenté.

## Rapport de fin de tâche

Terminer chaque intervention par :

1. Fichiers modifiés
2. Résumé des changements
3. Tests ou commandes lancés
4. Points à vérifier manuellement
5. Prochaine action recommandée

## Si ambiguïté

- Ne pas inventer une architecture.
- Proposer 2 ou 3 options maximum.
- Recommander l’option la plus simple.
- Si l’arbitrage dépasse l’implémentation locale, recommander un retour vers ChatGPT.
