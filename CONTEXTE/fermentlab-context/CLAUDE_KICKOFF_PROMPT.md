# CLAUDE_KICKOFF_PROMPT.md

## Prompt de lancement pour Claude Code

Lis d'abord :

- `PROJECT_BRIEF.md`
- `DATA_MODEL.md`
- `UX_FLOW.md`
- `ROADMAP.md`
- `PROJECT_MAP.md`
- `CLAUDE.md`

Objectif : initialiser le projet FermentLab en MVP local-first.

Contraintes :

- Ne pas ajouter de backend.
- Ne pas ajouter d'authentification.
- Ne pas implémenter de capteurs, IA, cloud ou photos pour l'instant.
- Ne pas sur-ingénierer.
- Privilégier types simples, fichiers courts, structure feature-first.
- Les données doivent rester propres et exploitables par IA future.

Tâche initiale :

1. Initialiser une app Vite React TypeScript si le repo est vide.
2. Installer uniquement les dépendances nécessaires au MVP initial : React Router, Dexie. Zod seulement si tu l'estimes utile, avec justification courte.
3. Créer l'arborescence cible minimale décrite dans `PROJECT_MAP.md`.
4. Créer les types métier principaux à partir de `DATA_MODEL.md`.
5. Créer un schéma IndexedDB/Dexie minimal pour batchs, phases, measurements, observations, events, finalEvaluations.
6. Créer les profils de fermentation MVP sous forme de données statiques.
7. Créer une première UI minimale : dashboard vide + navigation vers création batch.
8. Mettre à jour les fichiers de contexte pertinents.
9. Lancer les commandes de validation disponibles.
10. Commit et push selon `CLAUDE.md`.

Critères d'acceptation :

- Le projet démarre en local.
- TypeScript compile.
- Les types métier sont clairement séparés.
- Le schéma IndexedDB existe.
- Les profils MVP existent.
- Aucun backend ni auth n'est ajouté.
- Les fichiers de contexte sont mis à jour.

Hors périmètre :

- Comparaison des batchs.
- Graphiques.
- Export JSON.
- Photos.
- PWA avancée.
- IA.
- Capteurs.
