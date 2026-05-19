# Déploiement FermentLab — Guide complet

## Architecture cible

```
GitHub repo
  → Vercel (build Vite, frontend statique)
  → Supabase (Postgres + Auth OTP)
```

Dexie/IndexedDB reste actif en local. Supabase devient progressivement la source de vérité.

---

## Pré-requis

- Compte Supabase existant → [app.supabase.com](https://app.supabase.com)
- Compte Vercel existant → [vercel.com](https://vercel.com)
- Repo GitHub avec le code FermentLab pushé

---

## Étape 1 — Configurer Supabase

Voir le guide détaillé : [supabase-setup.md](./supabase-setup.md)

En résumé :
1. Créer un projet Supabase.
2. Récupérer `Project URL` et `anon public key`.
3. Exécuter `supabase/schema.sql` dans le SQL Editor.
4. Vérifier que les 7 tables existent et que RLS est activé.
5. Vérifier que Auth → Email OTP est activé.

---

## Étape 2 — Déployer sur Vercel

### 2.1 Importer le repo

1. Aller sur [vercel.com/new](https://vercel.com/new).
2. Cliquer **Add New… → Project**.
3. Sélectionner le repo GitHub **FermentLab**.
4. Cliquer **Import**.

### 2.2 Configurer le build

Vercel détecte Vite automatiquement. Vérifier :

| Paramètre | Valeur attendue |
|-----------|-----------------|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

Ne rien modifier si Vercel a tout détecté.

### 2.3 Ajouter les variables d'environnement

Dans **Environment Variables**, ajouter :

| Nom | Valeur |
|-----|--------|
| `VITE_SUPABASE_URL` | Copier depuis Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Copier depuis Supabase → Settings → API → anon public |

> ⚠️ Ne jamais ajouter `SUPABASE_SERVICE_ROLE_KEY` ici. Cette clé ne doit jamais être exposée côté frontend.

### 2.4 Lancer le déploiement

Cliquer **Deploy**.

Vercel build et déploie. URL de l'app visible dans le dashboard.

### 2.5 Vérifier sur mobile

1. Ouvrir l'URL Vercel sur mobile (Chrome ou Safari).
2. La page `/auth` doit s'afficher.
3. Entrer un email → recevoir un OTP → se connecter.
4. Le dashboard FermentLab doit s'afficher.

---

## Étape 3 — Configurer les Redirect URLs Supabase (important)

Supabase Auth doit connaître l'URL Vercel pour autoriser les redirections après OTP.

1. Supabase dashboard → **Authentication → URL Configuration**.
2. Dans **Site URL** : mettre l'URL Vercel (ex. `https://fermentlab.vercel.app`).
3. Dans **Redirect URLs** : ajouter `https://fermentlab.vercel.app/**`.
4. Sauvegarder.

---

## Workflow de déploiement continu

```bash
git push
```

Vercel rebuild automatiquement à chaque push sur la branche principale.

---

## Variables d'environnement locales

Pour développer en local avec Supabase :

1. Copier `.env.example` en `.env.local` :
   ```
   cp .env.example .env.local
   ```
2. Remplir `.env.local` avec les valeurs Supabase :
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```
3. `.env.local` est dans `.gitignore` — ne jamais le committer.

---

## Rollback Dexie

Les données IndexedDB locales (Dexie) restent intactes tant que la migration vers Supabase n'est pas effectuée. Le rollback consiste à retirer `AuthProvider` et `ProtectedRoute` de `main.tsx` et `routes.tsx`.
