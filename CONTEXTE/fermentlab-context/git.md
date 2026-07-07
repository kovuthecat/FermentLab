# Conventions Git

## Règles

- Un commit = une intention claire.
- Relire le diff (`git diff`) avant de committer.
- Stager les fichiers concernés explicitement, pas `git add .` à l'aveugle.
- Utiliser des branches pour les expérimentations.
- Ne jamais committer de secret (`.env`, clés, tokens) — vérifier le diff.
- Pousser après chaque session validée.

## Format des messages

Verbe à l'impératif en anglais, court, une intention par commit.

```bash
git commit -m "Add batch comparison filters"
git commit -m "Fix phase duration calculation"
git commit -m "Refactor measurement repository"
git commit -m "Update project context templates"
```

Préfixe optionnel de type : `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.

## Avant une session Claude Code risquée

Partir d'un état propre pour pouvoir revenir en arrière facilement.

```bash
git status
git diff                       # relire ce qui n'est pas encore committé
git add <fichiers>             # ou git add -p pour stager par morceaux
git commit -m "Stable state before AI changes"
```

## Après une session validée

```bash
git status
git diff                       # relire avant de stager
git add <fichiers concernés>
git commit -m "Describe completed change"
git push
```

## Annuler / revenir en arrière

```bash
git restore <fichier>          # annule les modifs non stagées d'un fichier
git restore .                  # annule TOUTES les modifs non stagées (non récupérable)
git reset --hard HEAD          # ⚠ détruit tout le travail non committé, sans retour
```

> `git restore .` et `git reset --hard` sont destructifs : vérifier `git status`
> avant, et préférer un commit « stable state » plutôt que de tout jeter.

## Co-auteur Claude Code

Claude Code ajoute automatiquement une ligne `Co-Authored-By` à ses commits.
Rien à faire manuellement.
