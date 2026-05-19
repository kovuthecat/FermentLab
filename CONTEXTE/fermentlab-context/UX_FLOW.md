# UX_FLOW.md

## Principe UX

L'application doit rester utilisable rapidement en cuisine.

Priorité : saisie rapide, données propres, comparaison utile.

À éviter : formulaire géant, tableur brut, navigation complexe.

## Écrans MVP

### 1. Dashboard

Objectif : voir rapidement les fermentations actives et accéder aux actions principales.

Contenu :

- liste des batchs actifs ;
- derniers batchs terminés ;
- bouton `Nouveau batch` ;
- bouton `Ajouter une observation` si batch actif ;
- indicateurs simples : durée en cours, phase actuelle, dernière mesure.

### 2. Création de batch

Flux recommandé en étapes courtes :

1. choisir le type de fermentation ;
2. nommer le batch ;
3. renseigner volume et ingrédients principaux ;
4. renseigner état de la culture ;
5. renseigner contenant ;
6. démarrer.

Tous les champs avancés doivent être optionnels.

### 3. Détail batch

Écran central de l'application.

Sections :

- résumé du batch ;
- phase actuelle ;
- timeline ;
- paramètres initiaux ;
- mesures récentes ;
- observations ;
- actions rapides ;
- clôture du batch.

La timeline doit combiner :

- phases ;
- mesures ;
- observations ;
- événements de process ;
- photos si ajoutées plus tard.

### 4. Ajout rapide

L'utilisateur doit pouvoir ajouter en moins de quelques secondes :

- mesure ;
- observation ;
- événement ;
- note libre.

Prévoir une interface par onglets ou boutons :

- Mesure
- Observation
- Événement
- Note

### 5. Gestion des phases

Pour kombucha et kéfir de fruits :

- démarrer F1 ;
- finir F1 ;
- démarrer F2 ;
- finir F2 ;
- mise au froid.

Pour levain :

- nourrissage ;
- pousse ;
- pic ;
- retombée ;
- rafraîchi suivant.

L'interface doit proposer ces actions selon le profil, mais permettre un événement personnalisé.

### 6. Clôture batch

Contenu :

- fin du batch ;
- score global ;
- acidité ;
- sucrosité ;
- pétillance ;
- alcool perçu ;
- texture ;
- succès oui/non ;
- à refaire oui/non ;
- notes finales.

### 7. Comparaison

Vue MVP : tableau filtrable.

Filtres :

- type de fermentation ;
- période ;
- score global ;
- durée totale ;
- température moyenne ;
- phase F1/F2 ;
- temps de réfrigération de la culture.

Colonnes utiles :

- nom ;
- date ;
- durée totale ;
- durée F1 ;
- durée F2 ;
- culture réfrigérée ;
- temps au froid ;
- pH final ;
- densité/Brix final ;
- score global ;
- notes finales.

## Règles UX

- Les champs numériques doivent avoir des unités visibles.
- Les mesures doivent être optionnelles.
- Les notes libres ne remplacent pas les champs structurés.
- Les actions fréquentes doivent être accessibles en un clic depuis le détail batch.
- Le détail batch doit rester lisible même avec peu de données.
- Ne pas bloquer l'utilisateur si une donnée est inconnue.
