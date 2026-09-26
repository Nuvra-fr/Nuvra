# Déployer Nuvra sur Vercel (en 3 étapes)

Vercel n'a **pas de disque persistant** : une base SQLite « fichier » disparaîtrait à chaque
déploiement. Nuvra utilise donc **libSQL** via [Turso](https://turso.tech) — même moteur que
SQLite, mêmes migrations (`drizzle/`), mais la base est hébergée. Le code est déjà prêt : il ne
reste qu'à brancher la base et à déployer.

> Version anglaise, avec les autres hébergeurs (Docker, Railway…) : [DEPLOYMENT.md](DEPLOYMENT.md).

---

## Étape 1 — Créer la base Turso depuis Vercel

1. Ouvrez votre projet sur **[vercel.com](https://vercel.com)** → onglet **Storage**.
2. Cliquez sur **Marketplace** (ou *Create Database* → *Marketplace*), cherchez **Turso**.
3. Choisissez une région proche de vos utilisateurs, puis **Create / Connect**.
4. À la question du projet à connecter, sélectionnez **votre projet Nuvra** et les
   environnements **Production** *et* **Preview**, puis validez.

Vercel ajoute automatiquement les variables d'environnement de l'intégration
(`STORAGE_TURSO_DATABASE_URL`, `STORAGE_TURSO_AUTH_TOKEN`, …). **Nuvra les détecte tout seul** :
toute variable dont le nom se termine par `DATABASE_URL` et dont la valeur est un `libsql://…`
ou un `*.turso.io` est utilisée en priorité, avec le jeton associé.

<details>
<summary>Vous préférez la CLI Turso ou une base déjà existante ?</summary>

```bash
turso db create nuvra
turso db show nuvra --url            # → libsql://nuvra-<org>.turso.io
turso db tokens create nuvra         # → le jeton
```

Puis, dans **Vercel → votre projet → Settings → Environment Variables** :

| Variable | Valeur |
|---|---|
| `TURSO_DATABASE_URL` | `libsql://nuvra-<org>.turso.io` |
| `TURSO_AUTH_TOKEN` | le jeton créé ci-dessus |

(`DATABASE_URL` + `DATABASE_AUTH_TOKEN` fonctionnent aussi.)
</details>

## Étape 2 — Renseigner les variables du site

Toujours dans **Settings → Environment Variables** (cochez *Production* et *Preview*) :

| Variable | Valeur | Obligatoire |
|---|---|---|
| `ADMIN_EMAIL` | votre e-mail d'administrateur | oui (1er déploiement) |
| `ADMIN_PASSWORD` | **au moins 12 caractères** | oui (1er déploiement) |
| `CRON_SECRET` | un secret long — `openssl rand -hex 32` | oui (production) |
| `NEXT_PUBLIC_APP_URL` | `https://<votre-projet>.vercel.app` ou votre domaine | recommandé |

Ces trois premières valeurs servent au **premier démarrage** : elles créent le compte
administrateur et l'espace de travail « Nuvra (Platform) ». Elles ne sont utilisées que tant
qu'aucun administrateur n'existe, ne sont jamais journalisées, et peuvent rester en place
ensuite (un compte existant portant cet e-mail sera simplement promu administrateur).

Les clés Stripe / Resend / IA sont optionnelles : sans elles, Nuvra tourne en **mode TEST**
explicite (aucun argent réel, e-mails visibles dans Admin → Emails).

## Étape 3 — Redéployer et vérifier

1. **Deployments → ⋯ → Redeploy** (nécessaire après l'ajout des variables), ou poussez un commit
   sur `main`.
2. Pendant le *build*, Vercel exécute `npm run db:migrate && npm run build` : les migrations et
   l'administrateur sont créés **sur Turso** avant même que l'application ne soit construite.
   Vous devez voir dans les logs :
   `[nuvra:startup] database target: Turso / libSQL (STORAGE_TURSO_DATABASE_URL)`.
3. Vérifiez `https://<votre-projet>.vercel.app/api/health` :
   `{"ok":true,"db":"ok","database":"turso",…}`.
4. Connectez-vous sur `/login` avec `ADMIN_EMAIL` / `ADMIN_PASSWORD` → vous arrivez sur `/admin`.

C'est tout. Les déploiements suivants appliquent automatiquement les nouvelles migrations.

---

## Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| Le build échoue : `No hosted database configured…` | Aucune base hébergée configurée (Nuvra refuse d'utiliser un fichier local sur Vercel) | Faites l'étape 1, vérifiez que la variable est bien présente en *Production* **et** *Preview*, puis redéployez |
| `/api/health` renvoie `"db":"error"` ou 503 | URL/jeton Turso invalides, ou base supprimée | `turso db show <db> --url`, `turso db tokens create <db>` puis mettez à jour les variables et redéployez |
| `/api/health` renvoie `"database":"file"` en production | Turso n'est pas branché, la base est un fichier éphémère | Refaites l'étape 1 — vos données disparaîtraient à chaque déploiement |
| Le build échoue : `ADMIN_PASSWORD must be at least 12 characters` | Mot de passe trop court | Utilisez 12 caractères ou plus, puis redéployez |
| `[nuvra:db] migration failed: … 401`/`403` | Jeton Turso expiré ou révoqué | Créez un jeton (`turso db tokens create <db>`) et mettez `TURSO_AUTH_TOKEN` à jour |
| `[nuvra:db] migration failed: … fetch failed` | URL Turso erronée ou injoignable (l'erreur complète est affichée dans le build) | Vérifiez `TURSO_DATABASE_URL` (`turso db show <db> --url`, schéma `libsql://` compris) |
| Connexion impossible avec `ADMIN_EMAIL` après la mise en ligne | Administrateur créé lors d'un premier déploiement avec un autre mot de passe | Supprimez l'utilisateur dans Turso (`turso db shell <db> "delete from users where role='ADMIN'"`) puis redéployez |
| Les e-mails programmés ne partent pas | Cron non déclenché ou `CRON_SECRET` absent | Vérifiez l'onglet *Cron Jobs* du projet et que `CRON_SECRET` est défini (sinon l'endpoint répond 503 en production) |
| Les liens des e-mails pointent vers `localhost` | `NEXT_PUBLIC_APP_URL` absent | Renseignez le domaine de production, puis redéployez |

## Options utiles

- **Domaine personnalisé** : *Settings → Domains*, puis mettez `NEXT_PUBLIC_APP_URL` à jour.
- **Prévisualisations** : les *Preview Deployments* utilisent aussi la base Turso ; si vous
  préférez une base séparée, créez une seconde base Turso et limitez les variables à
  l'environnement *Preview*.
- **Sauvegardes** : Turso conserve un historique (restauration point-in-time depuis le
  tableau de bord). Pour un export ponctuel : `turso db shell <db> ".dump" > backup.sql`.
- **Ne pas migrer au build** : définissez `AUTO_MIGRATE=false` et lancez `npm run db:migrate`
  vous-même (par exemple depuis un job CI).
