# Conventions Git

## Règles

- Un commit = une intention claire.
- Commit avant toute session Claude Code risquée.
- Relire le diff avant commit.
- Utiliser des branches pour les expérimentations.
- Ne pas laisser de modifications non documentées.
- Pousser les changements après chaque session validée.

## Exemples de bons commits

```bash
git commit -m "Add recipe tag filtering"
git commit -m "Fix iPad PWA standalone display"
git commit -m "Refactor local storage service"
git commit -m "Update project context templates"
```

## Avant Claude Code

```bash
git status
git add .
git commit -m "Stable state before AI changes"
```

## Après Claude Code

```bash
git status
git add .
git commit -m "Describe completed change"
git push
```

## Annuler les changements non désirés

```bash
git restore .
```

## Revenir au dernier commit

```bash
git reset --hard HEAD
```
