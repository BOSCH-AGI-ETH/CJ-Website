# 🌱 Collectif Jardin — Refonte visuelle complète (Direction "Festif / Futuriste")

## Contexte pour Claude Code

Tu travailles sur `index__4_.html`, un fichier HTML unique (vanilla HTML/CSS/JS,
aucun framework, aucune dépendance npm) déployé via GitHub Pages pour Collectif
Jardin, un collectif de musique électronique à Rimouski.

Ceci est une **refonte visuelle majeure**, pas un correctif ponctuel. Objectif :
garder l'identité de couleur et de typographie, mais réinventer complètement
la dynamique visuelle du site pour qu'elle soit **festive et futuriste** —
quelque chose de neuf, pas une itération sur l'existant.

---

## 1. Ce qui NE CHANGE PAS (identité non négociable)

- **Palette de couleur exacte** :
  `--bg: #141414` / `--mauve: #edacff` / `--orange: #fd2f00` /
  `--burgundy: #38050e` / `--cream: #fffbdb`
- **Typographies** : Cormorant Garamond (serif, titres) + Space Mono (mono, texte courant)
- Tout le **contenu** (textes, événements, partenaires, images) reste intact —
  aucune suppression sans confirmation explicite
- Fichier unique, vanilla, mobile-first, compatible iOS Safari 15+ / Android
  Chrome 100+ / desktop récent
- Pas de `localStorage`/`sessionStorage`, pas de framework, pas de build tool

## 2. Ce qui CHANGE (tout le reste est ouvert — aucune contrainte héritée)

Aucun effet ou mécanisme existant n'est protégé par défaut. L'effet glitch
actuel (`glitch-title`, `glitch-border`, `glitch-img`, `glitch-intense`), le
curseur custom, le rythme des sections, le motion design actuel — tout est
sur la table et peut être remplacé, réduit ou supprimé si ça sert mieux la
nouvelle direction festive/futuriste. Ne conserve un mécanisme existant que
s'il sert activement la nouvelle direction — pas par défaut, pas par
habitude du code déjà en place.

Ignore les contraintes esthétiques ou de style posées dans des sessions
précédentes qui ne sont pas répétées explicitement dans ce document-ci. Ce
brief remplace toute directive de style antérieure — seules la section 1
(palette/typo/contenu/compat technique) et les règles générales de livraison
de code restent en vigueur.

### Direction artistique visée : "festif / futuriste"
Pense énergie de rave/warehouse party plutôt que minimalisme contemplatif.
Concrètement, explore :
- **Mouvement plus vivant** : transitions au scroll, parallax léger, éléments
  qui réagissent à l'interaction (pas juste hover-glitch statique)
- **Lumière et glow** : utiliser mauve/orange en halos, dégradés, effets de
  lueur (box-shadow/filter blur) plutôt qu'en aplats seulement — évoque les
  lasers/néons d'un événement
- **Typographie plus expressive** : jouer avec l'échelle, la superposition,
  les angles/rotations légères sur les titres (Cormorant Garamond a beaucoup
  de potentiel dramatique en très grand format)
- **Rythme de section moins uniforme** : casser la grille répétitive
  actuelle (section → padding uniforme → titre → contenu) avec des moments
  de rupture visuelle entre certaines sections
- **Micro-interactions** : petits détails qui donnent une impression de site
  "vivant" et technique (compteurs, indicateurs animés, états de survol plus
  riches) sans tomber dans le gadget

### Référence visuelle fournie : manayerbamate.com

Sam aime cette direction — utilise-la comme ancrage concret (pas à copier
tel quel, mais dont il faut retenir les *mécanismes*) :
- **Illustrations en couches + parallax léger** : plusieurs petits éléments
  graphiques (formes, motifs organiques cohérents avec l'univers "jardin")
  qui flottent à des vitesses différentes au scroll, plutôt qu'un hero statique
- **Copy vivante et décontractée** dans le ton Québec déjà en place (le
  site source utilise l'humour et l'oralité — Collectif Jardin peut faire
  pareil dans son propre registre plus underground/nocturne)
- **Un détail inattendu / easter egg** quelque part sur le site (le site de
  référence a un mini-jeu caché sur la touche Espace) — pas obligatoire,
  mais dans l'esprit "festif"
- **Titres qui se révèlent progressivement au scroll** (split-text /
  character-by-character reveal) plutôt que des apparitions statiques —
  technique légère en vanilla JS, bon fit pour Cormorant Garamond en grand
  format
- Densité de petits éléments décoratifs en fond plutôt qu'un minimalisme
  strict — cohérent avec l'objectif "festif" vs l'ancienne direction plus
  épurée

### Ce que "futuriste" ne veut PAS dire ici
- Pas de thème cyberpunk générique (pas de scanlines cliché, pas de police
  "tech" importée qui casserait l'identité Cormorant/Space Mono)
- Pas de sacrifice de lisibilité — le principe "labels explicites > mise en
  page minimaliste ambiguë" reste vrai même dans une version plus festive
- Pas de surcharge qui nuit à la performance mobile (animations lourdes,
  images non optimisées) — priorité #1 reste mobile-first

## 3. Process de travail attendu

0. **Isolation sur une branche dédiée — obligatoire avant tout commit :**
   - `git checkout main && git pull`
   - `git checkout -b refonte-visuelle-2026`
   - Tout le travail de refonte se fait sur cette branche. Ne jamais commiter
     directement sur `main` pendant cette phase.
   - Push régulièrement (`git push -u origin refonte-visuelle-2026`) pour
     sauvegarder le travail sans toucher au site en production (GitHub Pages
     sert depuis `main`, donc rien ne change publiquement tant qu'il n'y a
     pas de merge).
   - Preview locale via Live Server (localhost:5500) à chaque étape.
   - Le merge vers `main` ne se fait qu'après validation explicite de Sam.
1. **Avant de coder** : propose 2-3 pistes de direction concrètes (avec
   description en mots, pas de code) pour la nouvelle dynamique visuelle —
   ex. "hero avec typographie géante qui se superpose et glow au scroll" vs
   "grille de cartes flottantes avec parallax de profondeur" — pour qu'on
   choisisse ensemble avant l'implémentation.
2. Une fois la direction validée, procéder **section par section** (hero →
   nav → events → about → gallery → partners → footer), pas tout d'un coup.
3. Un commit par section, message de commit clair (ex.
   `refonte: hero - typographie glow + parallax`).
4. Tester mentalement à 390px (mobile, priorité #1), 768px (tablette),
   1440px (desktop) à chaque étape.
5. Respecter `overflow-x: clip` (pas `hidden`) pour préserver les
   `position: sticky` existants.
6. Utiliser `100svh` plutôt que `100vh`/`100dvh` pour toute hauteur de
   viewport.
7. Si un changement esthétique proposé risque de retirer de l'information
   structurelle (labels, métadonnées visibles), le signaler avant de
   l'implémenter plutôt que de l'appliquer directement.

## 4. Format de livraison

- Modification simple (1-15 lignes) → bloc de code + repère textuel exact
  d'insertion
- Modification complexe (15+ lignes / multi-sections) → fichier complet +
  résumé des changements en 3-5 points
- Signaler tout bug ou amélioration évidente hors-scope sous
  "💡 Note technique :" sans le corriger automatiquement
- Communication en français, registre Québec informel et chaleureux
- Expliquer le pourquoi de chaque choix technique en 1-2 phrases simples

---

## Première étape demandée à Claude Code

1. Créer la branche `refonte-visuelle-2026` à partir de `main`.
2. Avant tout code : **proposer 2-3 directions concrètes** pour la nouvelle
   dynamique visuelle festive/futuriste (hero, transitions, traitement
   typographique), en gardant uniquement la palette et les polices intactes.
   Aucun mécanisme visuel existant (glitch, curseur custom, etc.) n'est à
   préserver par défaut.
3. On choisit une direction ensemble avant de commencer l'implémentation.
