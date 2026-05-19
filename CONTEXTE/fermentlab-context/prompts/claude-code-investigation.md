# Prompt Claude Code — Investigation sans modification

Utilise ce prompt quand un bug ou une évolution concerne un repo trop grand et que les fichiers pertinents ne sont pas évidents.

---

## Prompt

N’analyse pas tout le repo.

Objectif :
identifier uniquement les zones probablement responsables du problème décrit ci-dessous.

Problème :
[Décrire ici le bug, le comportement attendu, le comportement observé, les logs éventuels]

Contraintes :
- ne modifie aucun fichier ;
- ne lance pas de refactor ;
- ne propose pas d’architecture globale ;
- limite-toi à l’investigation ;
- évite d’ouvrir des fichiers non pertinents ;
- privilégie les fichiers directement liés au flux concerné.

Tâche :

1. Identifier le flux concerné.
2. Lister les fichiers probablement impliqués.
3. Expliquer brièvement le rôle de chaque fichier.
4. Identifier les dépendances directes utiles.
5. Formuler une ou deux hypothèses racines maximum.
6. Indiquer les fichiers à fournir à ChatGPT pour réflexion si un arbitrage est nécessaire.
7. Dire explicitement si la tâche peut ensuite être traitée localement par Claude Code ou si un retour vers ChatGPT est recommandé.

Format de sortie attendu :

```md
## Résumé du problème

...

## Flux concerné

...

## Fichiers probablement pertinents

| Fichier | Rôle | Pourquoi il est pertinent |
|---|---|---|

## Hypothèses racines

1.
2.

## Fichiers à fournir à ChatGPT si besoin

-

## Recommandation

- [ ] Claude Code peut corriger localement
- [ ] Retour vers ChatGPT recommandé avant implémentation

Raison :
...
```
