# CLAUDE.md

Instructions permanentes pour Claude Code dans ce projet.

## Commandes

```bash
npm run dev   # → http://localhost:5173
npm run build # build production
npm run lint  # lint TypeScript
# pas de suite de tests automatisés
```

- Variables d'environnement : `.env` / `.env.local` à la racine.
- Ne jamais committer de secret.

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

## Conception et escalade

Claude Code peut concevoir et investiguer pour les sujets petits et moyens —
utiliser le plan mode pour cadrer avant d’implémenter.

Escalader vers ChatGPT seulement pour les **gros arbitrages** : changement de
stack, refactor structurant, plusieurs stratégies produit ouvertes, ou décision
à fort impact long terme. Dans ce cas : arrêter, résumer le problème, recommander
le retour vers ChatGPT, attendre. Détail du workflow : voir `ai-workflow.md`.

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
python scripts/export-context.py
```

Le fichier généré doit servir de contexte synthétique pour ChatGPT.

## Après modification
1. Mettre à jour `STATUS.md`. Les autres fichiers de contexte (`TASKS`, `DECISIONS`,
   `PROJECT_MAP`, `ROADMAP`, `PROJECT_BRIEF`) **seulement si leur contenu change réellement**.
2. En fin de session (pas après chaque modif) : `git status`, commit atomique, push.

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

## Choix du modèle

Privilégier le modèle le moins coûteux capable de faire la tâche correctement
(changement via `/model`). La reco ne bloque jamais l’exécution.
