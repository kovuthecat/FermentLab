# Supabase Setup — Guide pas à pas

## 1. Ouvrir le projet Supabase

1. Aller sur [app.supabase.com](https://app.supabase.com).
2. Se connecter.
3. Cliquer sur le projet FermentLab (ou en créer un nouveau si nécessaire).

---

## 2. Récupérer les clés API

1. Dans le menu gauche, cliquer **Project Settings** (icône engrenage en bas).
2. Cliquer **API**.
3. Copier :
   - **Project URL** → `https://xxxxx.supabase.co`
   - **anon public** (sous "Project API keys") → `eyJhbGci...`

> ⚠️ Ne jamais copier la clé `service_role`. Elle donne un accès admin complet et ne doit jamais se retrouver dans le code frontend.

Ces deux valeurs vont dans :
- `.env.local` pour le dev local
- Variables d'environnement Vercel pour la production

---

## 3. Créer les tables (SQL Schema)

1. Dans le menu gauche, cliquer **SQL Editor**.
2. Cliquer **New query**.
3. Ouvrir le fichier `supabase/schema.sql` du projet.
4. Copier tout le contenu.
5. Coller dans l'éditeur SQL.
6. Cliquer **Run** (bouton vert ou Ctrl+Entrée).
7. Vérifier que le message "Success. No rows returned" apparaît.

---

## 4. Vérifier les tables

1. Dans le menu gauche, cliquer **Table Editor**.
2. Les 7 tables suivantes doivent exister :
   - `batches`
   - `phases`
   - `ingredients`
   - `measurements`
   - `observations`
   - `process_events`
   - `final_evaluations`

---

## 5. Vérifier RLS (Row Level Security)

1. Dans le menu gauche, cliquer **Authentication → Policies** (ou **Database → Policies**).
2. Chaque table doit avoir 4 policies : select, insert, update, delete.
3. Toutes les policies vérifient `auth.uid() = user_id`.

Si une table n'a pas de policies :
1. Cliquer sur la table.
2. Cliquer **New Policy → Create a policy from scratch**.
3. Reproduire la policy correspondante depuis `supabase/schema.sql`.

---

## 6. Configurer l'authentification OTP email

1. Dans le menu gauche, cliquer **Authentication → Providers**.
2. Vérifier que **Email** est activé (toggle ON).
3. Dans **Email**, vérifier :
   - **Enable Email OTP** : ON (ou "Enable OTP" selon la version UI)
   - **Confirm Email** peut rester activé ou désactivé selon la préférence
4. Sauvegarder si modifié.

> FermentLab utilise `signInWithOtp` + `verifyOtp` → Supabase envoie un code à 6 chiffres par email.

---

## 7. Configurer les Redirect URLs

1. Dans le menu gauche, cliquer **Authentication → URL Configuration**.
2. **Site URL** : entrer l'URL de l'app déployée.
   - Dev local : `http://localhost:5173`
   - Vercel : `https://votre-projet.vercel.app`
3. **Redirect URLs** : ajouter :
   - `http://localhost:5173/**`
   - `https://votre-projet.vercel.app/**`
4. Sauvegarder.

---

## 8. Tester localement

1. Créer `.env.local` à la racine du projet :
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```
2. Lancer l'app :
   ```bash
   npm run dev
   ```
3. Ouvrir `http://localhost:5173`.
4. La page `/auth` doit s'afficher.
5. Entrer son email → vérifier la boîte mail → entrer le code OTP → le dashboard doit s'afficher.
6. Cliquer "Déconnexion" → retour sur `/auth`.

---

## 9. État actuel de la migration

| Fonctionnalité | Stockage actuel | Supabase prêt |
|----------------|-----------------|---------------|
| Auth OTP | — | ✅ UI + client |
| Batchs | Dexie | ⏳ schema.sql créé, migration à faire |
| Phases | Dexie | ⏳ schema.sql créé, migration à faire |
| Ingrédients | Dexie | ⏳ schema.sql créé, migration à faire |
| Mesures | Dexie | ⏳ schema.sql créé, migration à faire |
| Observations | Dexie | ⏳ schema.sql créé, migration à faire |
| Événements | Dexie | ⏳ schema.sql créé, migration à faire |
| Évaluations finales | Dexie | ⏳ schema.sql créé, migration à faire |

La migration des repositories (Dexie → Supabase) est la prochaine étape. Elle sera incrémentale, table par table.
