# Écosystème Jardin — Instructions d'installation
## Collectif Jardin · Session 2026

---

## Vue d'ensemble

Tu livres deux fichiers :

| Fichier | Rôle |
|---|---|
| `ecosysteme-jardin-apps-script.gs` | Script Google côté serveur — base de données |
| `ecosysteme-jardin-insert.html` | Bloc à insérer dans `index.html` |

---

## ÉTAPE 1 — Google Sheet + Apps Script

### 1.1 Créer le Sheet
1. Ouvre **Google Drive** → **Nouveau** → **Google Sheets**
2. Nomme-le : `Écosystème Jardin`
3. Laisse-le ouvert

### 1.2 Ouvrir l'éditeur Apps Script
1. Dans le Sheet → **Extensions** → **Apps Script**
2. Supprime tout le code qui s'y trouve déjà
3. Colle **tout le contenu** du fichier `ecosysteme-jardin-apps-script.gs`
4. Clique sur **Enregistrer** (icône disquette ou Ctrl+S)

### 1.3 Déployer
1. Clique sur **Déployer** (bouton bleu en haut à droite) → **Nouveau déploiement**
2. Clique sur l'icône ⚙️ à côté de "Type" → sélectionne **Application Web**
3. Configure :
   - **Description** : `Écosystème Jardin v1`
   - **Exécuter en tant que** : `Moi (ton compte Google)`
   - **Qui a accès** : `Tout le monde`
4. Clique **Déployer**
5. Google va demander d'**autoriser les permissions** → clique Autoriser → suis les étapes
6. Copie l'**URL de déploiement** — elle ressemble à :
   `https://script.google.com/macros/s/AKfycb.../exec`

> ⚠️ **Garde cette URL précieusement.** C'est elle qui relie le formulaire à la base de données.

### 1.4 Tester le script seul
1. Dans l'éditeur Apps Script, sélectionne la fonction `testInscription` dans le menu déroulant
2. Clique **Exécuter** ▷
3. Va dans le Sheet → onglet `Membres` → tu dois voir une ligne ajoutée

---

## ÉTAPE 2 — Modifier index.html

### 2.1 Ajouter le CSS
Dans `index.html`, cherche la ligne qui ressemble à :
```
</style>
</head>
```
(vers la fin du bloc `<style>`, avant `</head>`)

Colle le bloc `<style>` du fichier insert **juste avant** la balise `</style>`.

Le bloc CSS à copier est entre les commentaires :
```
<!-- ───────────────── CSS À AJOUTER ─────────────────────────────
```
et
```
───────────────────────────────────────────────────────────────── -->
```

### 2.2 Ajouter la section HTML + JS
Dans `index.html`, cherche cette ligne exacte :
```html
<!-- CONTACT -->
```
(il y en a une seule — elle précède la section `<section id="contact">`)

Colle le contenu HTML du fichier insert **à la place de** `<!-- CONTACT -->`.

Le fichier insert se termine lui-même par `<!-- CONTACT -->` — donc le commentaire
sera automatiquement recréé au bon endroit.

### 2.3 Connecter l'URL du script
Dans le JavaScript que tu viens de coller, cherche cette ligne :
```javascript
var SCRIPT_URL = 'YOUR_SCRIPT_URL_HERE';
```
Remplace `YOUR_SCRIPT_URL_HERE` par l'URL copiée à l'étape 1.3 :
```javascript
var SCRIPT_URL = 'https://script.google.com/macros/s/AKfycb.../exec';
```

### 2.4 Ajouter le lien dans la nav
Dans la `<nav>`, ajoute un lien vers la section :
```html
<li><a href="#ecosysteme">Communauté</a></li>
```
Place-le entre `#about` et `#don` dans la liste.

Même chose dans `#navOverlay` (menu mobile) :
```html
<a href="#ecosysteme" onclick="closeNav()">Communauté</a>
```

---

## ÉTAPE 3 — Déployer sur GitHub

```bash
git add index.html
git commit -m "feat: section Écosystème Jardin — newsletter"
git push
```

---

## ÉTAPE 4 — Tester en production

1. Ouvre `collectifjardin.org` → scrolle jusqu'à la section **Communauté**
2. Entre ton propre courriel et soumets
3. Vérifie dans le Google Sheet que la ligne est bien apparue

---

## Comment envoyer un message à l'écosystème

1. Ouvre le Google Sheet `Écosystème Jardin` → onglet `Membres`
2. Filtre par colonne `Statut = actif`
3. Exporte la liste → utilise Gmail ou un outil d'envoi
4. **Inclure dans chaque email** le lien de désabonnement :
   ```
   https://script.google.com/macros/s/TON_ID/exec?action=unsub&token=TOKEN_DE_LA_COLONNE_G
   ```
   Dans Gmail, tu peux générer ce lien manuellement colonne par colonne,
   ou utiliser **Apps Script → Extensions → Macro** pour l'automatiser plus tard.

---

## Relier une autre source (don, billet, événement)

Depuis n'importe où dans le JS de la page, appelle :
```javascript
// Exemple : quelqu'un qui vient de cliquer sur "Faire un don"
window.ecosysSetSource('don-zeffy-2026');
// Puis redirige vers Zeffy — si cette personne revient et s'inscrit,
// sa source sera enregistrée.
```

Pour la billetterie Quoi Vivre ou Zeffy, le workflow manuel reste simple :
- Exporte la liste des billets après chaque événement
- Ajoute une colonne `source` avec le nom de l'événement
- Colle dans le Sheet en dessous des membres existants

---

## Variables modulables (pour changer le nom plus tard)

Dans `ecosysteme-jardin-apps-script.gs`, ligne 15 :
```javascript
LIST_NAME: 'Écosystème Jardin',  // ← changer ici
```

Dans `index.html`, le texte de la section est en HTML pur —
cherche `l'écosystème` pour trouver les occurrences.

---

## Structure du Google Sheet

| Colonne | Contenu |
|---|---|
| A | Date d'inscription |
| B | Prénom |
| C | Courriel |
| D | Source (site-web / brise-lames-2026 / don-zeffy…) |
| E | Consentement (oui) |
| F | Statut (actif / désabonné) |
| G | Token désabonnement |

