# 🔧 MISSION — Correctifs audit sécurité & performance

> **Pour Claude Code.** Lis d'abord `CLAUDE.md` (règles permanentes du projet : charte graphique gelée, vanilla pur, mobile-first 390px, iOS Safari 15+).
> Ce document est une mission ponctuelle issue d'un audit complet du 10 juin 2026.
> Une fois tous les correctifs validés et poussés, ce fichier pourra être archivé.

---

## RÈGLES D'EXÉCUTION (non négociables)

1. **Un correctif = un commit.** Jamais deux correctifs dans le même commit.
   Format des messages : `fix(audit): #N — description courte`
   Exemple : `fix(audit): #2 — arrêt boucle rAF du Flappy hors partie`
2. **Ordre d'exécution :** suivre la numérotation ci-dessous (sécurité d'abord).
3. **Avant chaque correctif :** annoncer ce qui va être modifié et attendre confirmation.
4. **Après chaque correctif :** lister les lignes/blocs touchés + comment tester
   sur Live Server (localhost:5500) avant le push.
5. **Interdits absolus :** modifier les animations/effets visuels existants,
   toucher aux variables `:root`, introduire une dépendance externe,
   utiliser localStorage/sessionStorage, supprimer du contenu existant.
6. **Fichiers concernés :** `index.html` + le fichier Apps Script `.gs`
   présent dans le répertoire du projet.

---

## ⚠️ LIMITE IMPORTANTE — Apps Script

Les correctifs #1 et #3 modifient le `.gs`. **Modifier le fichier local ne
suffit pas** : le code doit être copié dans l'éditeur Apps Script
(script.google.com) et une **NOUVELLE version de déploiement** doit être créée
(jamais réutiliser une version existante — leçon apprise du projet).
→ Après avoir patché le `.gs`, Claude Code doit fournir à Sam la procédure
exacte de redéploiement, étape par étape, et **considérer le correctif comme
incomplet tant que Sam n'a pas confirmé le redéploiement**.
→ Si l'URL de déploiement change, mettre à jour `SCRIPT_URL` dans `index.html`
(actuellement ligne ~2072) dans le **même commit**.

---

## CORRECTIF #1 — 🔴 CRITIQUE — Protéger l'endpoint Apps Script

**Problème :** l'URL du Web App est publique (normal sur site statique), mais
le `doGet` n'a aucune défense : n'importe qui peut inonder le Sheet de fausses
inscriptions en boucle (`?action=subscribe&email=...`), épuiser les quotas
Apps Script et corrompre la base membres.

**À faire dans le `.gs` :**
- [ ] Rate-limiting via `CacheService` : limiter les insertions
      (ex. max 5 inscriptions / minute globalement, et bloquer les rafales).
- [ ] Validation stricte du format email **côté serveur** (regex), rejet sinon.
- [ ] Rejeter toute requête dont le paramètre honeypot (voir ci-dessous)
      est non vide → répondre `success: true` (silencieux, ne pas informer le bot).
- [ ] Plafond de sécurité : si le Sheet reçoit plus de X insertions dans
      l'heure, basculer en mode refus temporaire avec log.

**À faire dans `index.html` (formulaire newsletter, bloc IIFE ligne ~2068) :**
- [ ] Ajouter un champ honeypot : input texte invisible (caché en CSS via
      `position:absolute;left:-9999px`, PAS `display:none` — certains bots
      le détectent), nom de champ crédible (ex. `website`), `tabindex="-1"`,
      `autocomplete="off"`, `aria-hidden="true"`.
- [ ] Transmettre ce champ dans les paramètres GET envoyés au script.

**Test :** inscription normale fonctionne (3 états : subscribed,
already_subscribed, reactivated) · remplir le honeypot via la console →
aucune ligne ajoutée au Sheet · 6+ soumissions rapides → blocage.

---

## CORRECTIF #2 — 🟠 FORT — Stopper la boucle rAF du Flappy hors partie

**Problème :** `index.html` ligne ~1964 :
`function frame(){requestAnimationFrame(frame);update();draw();} frame();`
La boucle tourne à 60 fps **en permanence** dès le chargement de la page,
même en état IDLE et même quand la section `#jeu` est hors écran.
Coût batterie/CPU continu, surtout mobile.

**À faire (uniquement la logique de boucle — ne PAS toucher au gameplay,
au rendu, ni au style du jeu) :**
- [ ] En état `IDLE` et `DEAD` : dessiner **une seule frame statique**
      puis arrêter la boucle (`cancelAnimationFrame` + flag).
- [ ] Démarrer la boucle uniquement au lancement d'une partie
      (bouton « Jouer ✦ », tap, espace).
- [ ] Ajouter un `IntersectionObserver` sur `#jeu` : si la section sort du
      viewport pendant une partie, mettre la boucle en pause ; reprendre
      au retour. S'inspirer du pattern déjà présent dans le fichier
      (bloc « ANIMATIONS HORS VIEWPORT », ligne ~2437).
- [ ] Gérer `document.visibilitychange` : pause si l'onglet est masqué.

**Test :** au chargement, l'onglet ne consomme plus de CPU au repos
(vérifier via DevTools > Performance) · le jeu se lance et se joue
normalement · écran IDLE et écran DEAD s'affichent correctement (statiques).

---

## CORRECTIF #3 — 🟠 ÉLEVÉ — Auditer les tokens de désabonnement

**Problème :** si les tokens de désabo sont courts, séquentiels ou dérivés
de l'email de façon prévisible, on peut désabonner des membres en masse en
forgeant des URLs.

**À faire dans le `.gs` :**
- [ ] Auditer la génération actuelle des tokens et rapporter le constat à Sam.
- [ ] Si faible : passer à `Utilities.getUuid()` (ou équivalent ≥ 16
      caractères aléatoires). Prévoir la migration des tokens existants
      dans le Sheet (proposer un plan AVANT d'exécuter — ne pas casser
      les liens de désabo déjà envoyés dans d'anciens courriels sans accord).
- [ ] Vérifier qu'un token invalide échoue **silencieusement** sans révéler
      si un email existe dans la base.

**Test :** lien de désabo légitime fonctionne · token forgé/aléatoire →
page d'échec générique, aucune fuite d'information.

---

## CORRECTIF #4 — 🟡 MOYEN — CSP + Referrer-Policy

**Problème :** aucune Content-Security-Policy ni politique de référent.
GitHub Pages ne permet pas d'en-têtes serveur → passer par des balises `<meta>`.

**À faire dans le `<head>` de `index.html` :**
- [ ] Ajouter une CSP `<meta http-equiv="Content-Security-Policy" content="...">`
      autorisant uniquement : `'self'`, `'unsafe-inline'` (obligatoire — tout
      le CSS/JS est inline), `fonts.googleapis.com`, `fonts.gstatic.com`,
      `script.google.com` + `script.googleusercontent.com` (connect-src, le
      fetch du formulaire suit une redirection Apps Script), images `'self' data:`.
- [ ] Ajouter `<meta name="referrer" content="strict-origin-when-cross-origin">`.

**Test :** ⚠️ tester TOUT après ce correctif (console DevTools = zéro erreur
CSP) : fonts chargées · formulaire newsletter fonctionnel de bout en bout
(c'est le point le plus fragile : la redirection Apps Script) · liens Zeffy ·
galerie · lightbox événements · jeu. Si le formulaire casse, ajuster
`connect-src` avant tout autre changement.

---

## CORRECTIF #5 — 🟡 MOYEN — Optimiser le logo PNG du loader

**Problème :** `Image-About/Jardin-logo-officiel-mauve-no-BG.png` est la seule
image non-WebP du site et elle est sur le chemin critique (loader, ligne ~1026),
chargée aussi dans la nav et le footer.

**À faire :**
- [ ] Sam convertit le PNG en WebP (transparence conservée) via Squoosh.app
      — Claude Code fournit les réglages recommandés (qualité ~80 %,
      dimensions d'affichage réelles ×2 pour Retina).
- [ ] Remplacer les 3 références dans `index.html` une fois le fichier
      WebP déposé dans `Image-About/`.
- [ ] Ajouter `fetchpriority="high"` sur l'instance du **loader** uniquement.
- [ ] Garder le PNG original dans le repo tant que le WebP n'est pas validé
      visuellement sur fond `#141414` (les contours de transparence peuvent
      baver — vérifier sur vrai mobile).

**Test :** loader, nav et footer identiques visuellement · poids réseau
réduit (onglet Network).

---

## CORRECTIF #6 — 🟡 MOYEN — Timeout de sécurité sur le loader

**Problème :** le loader (bloc ligne ~2523) attend `window.load` + double rAF.
Sur réseau cellulaire lent, l'utilisateur peut fixer l'écran de chargement
très longtemps si une ressource traîne.

**À faire dans `index.html` :**
- [ ] Ajouter un `setTimeout` de secours (~2500 ms après `DOMContentLoaded`)
      qui force la disparition du loader même si `load` n'est pas arrivé.
- [ ] Réutiliser le flag `_hiding` existant pour éviter tout double-fade.
- [ ] Ne PAS modifier l'animation du loader elle-même (effets gelés).

**Test :** DevTools > Network > Slow 3G → le site devient visible en ~2,5 s
max · chargement normal → comportement inchangé.

---

## CORRECTIF #7 — 🟢 FAIBLE — Factoriser les styles inline de la galerie

**Problème :** le même attribut `style="width:100%;height:100%;object-fit:cover;
display:block;"` est dupliqué sur ~50 `<img>` de la galerie (~3 Ko de bloat).

**À faire dans `index.html` :**
- [ ] Créer une classe CSS (ex. `.gallery-img`) dans le `<style>` principal,
      section galerie.
- [ ] Remplacer l'attribut `style` par cette classe sur toutes les images
      concernées — **y compris les clones `data-clone="true"`**.
- [ ] ⚠️ Vérifier que le JS du modal galerie (qui clone les items et écrase
      `imgEl.style.cssText`) fonctionne toujours : le `cssText` du modal
      remplace le style inline, pas la classe — comportement à confirmer.

**Test :** galerie identique visuellement (390px ET 1440px) · modal galerie :
ouverture, navigation, swipe, labels, crédits — tout fonctionne.

---

## SUIVI

| # | Correctif | Statut | Commit |
|---|-----------|--------|--------|
| 1 | Endpoint Apps Script protégé | ✅ Fait | `eddfe81` |
| 2 | Boucle rAF Flappy | ✅ Fait | `64285bc` |
| 3 | Tokens de désabo | ⬜ À faire | — |
| 4 | CSP + Referrer-Policy | ⬜ À faire | — |
| 5 | Logo WebP | ⬜ À faire | — |
| 6 | Timeout loader | ⬜ À faire | — |
| 7 | Styles galerie | ⬜ À faire | — |

> Claude Code : mettre à jour ce tableau (statut ✅ + hash court du commit)
> après chaque correctif validé par Sam. Ce fichier EST le journal de mission.
