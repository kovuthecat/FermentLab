# PROJECT_BRIEF.md

## Objectif du projet

FermentLab est une application local-first de suivi expérimental des fermentations personnelles : kéfir de fruits, kéfir de lait, kombucha, levain, puis autres fermentations si nécessaire.

L'objectif est de permettre à l'utilisateur de documenter batch après batch les paramètres initiaux, phases, mesures, observations, événements de process et résultats finaux afin de comparer les essais et améliorer progressivement les protocoles.

L'application doit stocker les données de manière propre, structurée, versionnée et exploitable ultérieurement par une IA.

## Usage prévu

- Usage personnel : oui
- Usage local : oui, prioritaire
- Déploiement prévu : possible en PWA statique
- Utilisateurs autres que moi : non en MVP
- Mode hors ligne : souhaité

## Positionnement produit

FermentLab n'est pas une application de recettes classique.

C'est un journal expérimental de fermentation :

- un batch = une expérience ;
- une phase = une étape du process ;
- une mesure = une donnée chiffrée horodatée ;
- une observation = un constat structuré ;
- un événement = une action ou un jalon du process ;
- une évaluation finale = le résultat exploitable pour comparaison.

## Fonctionnalités MVP

1. Créer et gérer des batchs de fermentation.
2. Renseigner les paramètres initiaux, y compris l'état de la culture au démarrage.
3. Gérer des phases de fermentation : F1, F2, réfrigération, nourrissage, pousse, etc.
4. Ajouter des mesures horodatées : température, pH, densité SG, Brix, montée du levain, etc.
5. Ajouter des observations structurées : odeur, goût, texture, activité, aspect visuel, problème.
6. Ajouter des événements de process : fin F1, début F2, fin F2, embouteillage, mise au froid, nourrissage, dégazage.
7. Clôturer un batch avec une évaluation finale.
8. Comparer des batchs d'un même type de fermentation.
9. Exporter les données au format JSON versionné pour exploitation future par IA.

## Hors périmètre v1

- Capteurs connectés Arduino/ESP32.
- Synchronisation cloud.
- Authentification.
- Multi-utilisateur.
- IA prédictive intégrée.
- Recommandations automatiques avancées.
- Backend distant.
- Automatisation temps réel.
- Pilotage chauffage/refroidissement.
- Gestion commerciale ou partage communautaire.

## Stack technique recommandée

- Frontend : React + Vite + TypeScript
- Routing : React Router
- Base de données locale : IndexedDB via Dexie.js
- Validation : Zod si utile, sans complexifier
- Graphiques : Recharts ou solution légère équivalente
- PWA : service worker simple, manifest, offline local
- Backend : aucun en MVP
- Authentification : aucune en MVP
- Hébergement : statique possible, par exemple Vercel/Netlify

## Contraintes produit et techniques

- Simplicité prioritaire.
- Données fortement structurées.
- Notes libres autorisées, mais jamais comme unique source pour les paramètres essentiels.
- Toutes les entités importantes doivent être horodatées.
- Toutes les mesures doivent préciser unité, source et metric contrôlée.
- Les données calculées doivent être séparées des données saisies.
- Prévoir `schemaVersion` dès le MVP.
- Mobile first : saisie rapide en cuisine.
- Tous les champs avancés doivent rester optionnels.
- Pas de dépendance lourde sans justification.
- Pas de refactor global sans bénéfice clair.

## Contraintes IA

- Minimiser les coûts Claude Code.
- Favoriser les tâches courtes et ciblées.
- Limiter les refactors globaux.
- Éviter les architectures nécessitant beaucoup de contexte.
- Préférer les systèmes simples à maintenir avec l'aide d'une IA.
- Réduire le nombre de fichiers nécessaires par tâche.
- Conserver un projet lisible rapidement par ChatGPT et Claude Code.
- Maintenir `PROJECT_MAP.md` pour faciliter l'identification rapide des fichiers pertinents.
- Utiliser `scripts/export-context.py` avant les phases de réflexion ChatGPT si le contexte projet est nécessaire.

## Priorités

1. Données propres et exploitables.
2. Saisie rapide.
3. Fonctionnel.
4. Simple.
5. Maintenable.
6. Documenté.
7. Extensible seulement si nécessaire.

## Risques connus

- Trop de champs dès le départ.
- App qui devient un tableur pénible à utiliser.
- Modèle de données trop rigide selon les fermentations.
- Complexité excessive autour des photos.
- Ajout prématuré d'IA ou de capteurs.
- Mélange entre données saisies, observations subjectives et données calculées.
