# Instruction pour Claude Code — Alléger l'accueil de collectifjardin.org

## Contexte

Tu es déjà co-créateur du site (repo `BOSCH-AGI-ETH/Billeterie`). Cette instruction ne
porte pas sur le style — tu le connais déjà — seulement sur la restructuration du contenu.

L'accueil actuel (`index.html`) est une page unique avec tout le contenu empilé et navigué
par ancres (`#events`, `#projets-preview`, `#about`, `#jeu`, `#don`, `#contact`). Objectif :
sortir entièrement la section "À propos" vers une sous-page HTML dédiée — elle ne sert à
rien sur l'accueil, qui doit rester concentré sur l'action (billetterie, don, location).

## Ce qui reste sur l'accueil (ne pas toucher à la structure de ces sections)

- Hero
- Événements à venir (billetterie)
- Galerie complète "Moments capturés"
- Cartes "Nos projets" (Système de son, Économie sociale, Partenariats culturels,
  Expansion numérique)
- Section Don
- Inscription à la liste des Jardiniers (courriel)
- Partenaires ("Ils poussent avec nous")
- Le jeu Flappy Jardinier
- Location (teaser/lien — traité dans une instruction séparée, `location.html`)
- Contact / footer

## Ce qui sort de l'accueil vers une sous-page

### `a-propos.html` — Section À propos complète

À extraire en totalité de la section actuelle "Notre univers / Qui cultive ce jardin"
(ancre `#about`) :
- La citation d'ouverture
- Le texte de présentation du collectif
- La frise chronologique (les 10 jalons, printemps 2023 → hiver-printemps 2026)
- Le logo présenté au milieu de cette section
- Les bios des 6 membres de l'équipe (Gabriel, Philippe, Michael, Julie, Alexis, Samuel)

**Important — vérifie dans le code réel si la section "Partenaires" est imbriquée dans le
même conteneur/`<section id="about">`.** Si oui, elle doit être extraite de ce conteneur
pour rester sur l'accueil (voir liste ci-dessus) — seul le contenu À propos migre vers
`a-propos.html`.

Sur l'accueil, retire complètement le bloc `#about` — pas de teaser nécessaire, sauf si tu
juges qu'un lien "À propos" isolé serait perdu sans un minimum de contexte dans la nav (à
ton jugement).

Mets à jour le lien nav "À propos" (desktop + mobile) pour qu'il pointe vers
`a-propos.html` au lieu de l'ancre `#about`.

## Gabarit de la nouvelle page

Suis le même patron que les pages autonomes déjà existantes (`privacy-policy.html`,
`terms.html`) : même header/nav, même footer, mêmes imports CSS/JS que le reste du site.
La nouvelle page doit avoir son propre `<title>` et `meta-description` pertinents
(ex. "À propos — Collectif Jardin"), distincts de ceux de l'accueil, pour le
référencement.

## Points de vigilance

- Le contenu qui migre ne doit pas dupliquer ce qui reste sur l'accueil (aucune bio, aucun
  jalon de la frise ne doit rester visible sur l'accueil après la migration).
- Vérifie tous les liens internes existants qui pointent vers `#about` ailleurs sur le
  site (footer, autres pages) et mets-les à jour vers `a-propos.html`.
- Ajoute `loading="lazy"` aux images de la galerie et des cartes projets qui restent sur
  l'accueil, si ce n'est pas déjà fait.
- Vérifie que les ancres restantes dans la nav (`#events`, `#projets-preview`, `#jeu`,
  `#don`, `#contact`) fonctionnent toujours après le retrait complet de `#about`.

## Critères d'acceptation

- [ ] `a-propos.html` existe, avec header/nav/footer identiques au reste du site.
- [ ] L'accueil ne contient plus aucun élément de la section À propos (citation, intro,
      frise, bios) — tout est sur `a-propos.html`.
- [ ] La section Partenaires reste visible sur l'accueil, inchangée (extraite si elle
      était imbriquée dans `#about`).
- [ ] Le jeu Flappy Jardinier reste inchangé sur l'accueil.
- [ ] Nav "À propos" → `a-propos.html` (desktop + mobile).
- [ ] Aucun lien brisé vers `#about` ailleurs sur le site.
- [ ] Poids de la page d'accueil réduit — vérifie avec les devtools (taille totale
      transférée) avant/après.
- [ ] Aucune erreur console sur les 2 pages (accueil, a-propos).

## Livraison

Branche dédiée (ex. `feature/allege-accueil`), un commit pour l'extraction du contenu et
un pour la mise à jour de la nav, puis pull request pour révision avant merge/déploiement.
