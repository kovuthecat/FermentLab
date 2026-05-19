# ROADMAP.md

## Vision

Construire une application local-first permettant de documenter proprement des fermentations personnelles et de comparer les résultats batch après batch.

Le projet doit d'abord devenir un carnet expérimental fiable avant d'ajouter de l'IA, des capteurs ou des automatisations.

## MVP

- [x] Initialiser l'application React/Vite/TypeScript.
- [x] Mettre en place IndexedDB via Dexie.
- [x] Définir les types métier principaux.
- [x] Créer les profils de fermentation MVP.
- [x] Créer un batch.
- [x] Ajouter les paramètres initiaux, dont l'état de la culture.
- [ ] Ajouter des phases.
- [ ] Ajouter mesures, observations et événements.
- [ ] Clôturer un batch.
- [ ] Afficher l'historique des batchs.
- [ ] Comparer les batchs dans un tableau simple.
- [ ] Exporter les données JSON versionnées.

## Version 1

- [ ] Graphiques simples par batch.
- [ ] Graphiques comparatifs.
- [ ] Import JSON.
- [ ] Compression et stockage local des photos.
- [ ] PWA installable.
- [ ] Mode offline propre.
- [ ] Sauvegarde/restauration manuelle.

## Version 2 / idées futures

- [ ] Suggestions automatiques à partir des meilleurs batchs.
- [ ] Analyse IA à partir des exports JSON.
- [ ] Profils personnalisés.
- [ ] Entité `Culture` indépendante avec historique propre.
- [ ] Capteurs manuels ou connectés.
- [ ] Rappels simples.
- [ ] Synchronisation optionnelle.

## À éviter pour l'instant

- Backend.
- Authentification.
- Multi-utilisateur.
- IA embarquée.
- Recommandations prédictives.
- Capteurs temps réel.
- Dashboard complexe.
- Refactor global prématuré.
