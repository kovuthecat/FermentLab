# ROADMAP.md

Vision et jalons (rarement modifié). Le backlog actif vit dans `TASKS.md`, l'état courant dans `STATUS.md`.

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
- [x] Ajouter des phases.
- [x] Ajouter ingrédients initiaux structurés.
- [x] Ajouter mesures, observations et événements.
- [x] Clôturer un batch.
- [x] Afficher l'historique des batchs.
- [x] Comparer les batchs dans un tableau simple.
- [x] Exporter les données JSON versionnées.

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

## Déploiement (en cours)

- [x] `vercel.json` + variables d'environnement Vite.
- [x] Supabase client (`src/lib/supabaseClient.ts`).
- [x] Auth OTP email (AuthProvider, AuthPage, ProtectedRoute).
- [x] SQL schema Supabase (7 tables + RLS).
- [x] Guide Vercel (`docs/deployment.md`).
- [x] Guide Supabase (`docs/supabase-setup.md`).
- [ ] Créer le projet Supabase + exécuter schema.sql.
- [ ] Ajouter les variables sur Vercel + déployer.
- [ ] Tester l'auth OTP sur mobile.
- [ ] Migrer `batchRepository` Dexie → Supabase.
- [ ] Migrer les autres repositories (phases, ingredients, measurements, observations, events, evaluations).

## À éviter pour l'instant

- Backend custom.
- Next.js / Prisma / Docker.
- Multi-utilisateur.
- IA embarquée.
- Recommandations prédictives.
- Capteurs temps réel.
- Dashboard complexe.
- Refactor global prématuré.
- Exposer `service_role` Supabase côté frontend.
