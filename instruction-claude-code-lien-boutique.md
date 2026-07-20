# Instruction pour Claude Code — Lien "Boutique" (Zeffy)

## Contexte

Tu es déjà co-créateur du site (repo `BOSCH-AGI-ETH/Billeterie`). La boutique en ligne
(chandails, casquettes) est hébergée directement sur Zeffy, pas sur notre site — donc
il n'y a pas de sous-page à construire avec du contenu, seulement un lien de redirection.

URL de la boutique Zeffy :
`https://www.zeffy.com/fr-CA/ticketing/articles-et-vetements`

**Ne pas utiliser le lien avec paramètres `fbclid=...` fourni par Sam** — c'est un
paramètre de tracking Facebook propre à un clic précis, pas l'URL canonique. Utilise
l'URL propre ci-dessus.

## Tâches

1. **Menu (nav)** : ajoute une entrée "Boutique" dans le menu déroulant (desktop + mobile),
   positionnée à un endroit cohérent avec le reste (proche de "Don" ou "Location" puisque
   c'est aussi une action de soutien/achat). L'entrée pointe directement vers l'URL Zeffy
   ci-dessus, dans un nouvel onglet (`target="_blank" rel="noopener"`), puisqu'on quitte le
   site.

2. **Accueil** : ajoute un lien/bouton vers la boutique sur la page d'accueil. Choisis
   l'emplacement le plus cohérent avec la structure actuelle — par exemple à proximité de
   la section Don, ou dans le teaser Location si tu juges que les deux "boutiques"
   (location de matériel vs vente d'articles) méritent d'être présentées ensemble. À ton
   jugement selon ce qui existe déjà sur la page.

## Points de vigilance

- Comme on quitte le site vers un domaine externe (Zeffy), s'assurer visuellement que ce
  n'est pas confondu avec une page interne (icône de lien externe, ou mention "Boutique en
  ligne (Zeffy)" par exemple) — au jugement, cohérent avec le reste du site.
- Ne pas créer de fichier `boutique.html` avec du contenu dupliqué de Zeffy — le clic doit
  rediriger directement, pas passer par une page intermédiaire du site.

## Critères d'acceptation

- [ ] Le menu (desktop + mobile) contient une entrée "Boutique" qui ouvre l'URL Zeffy
      ci-dessus dans un nouvel onglet.
- [ ] L'accueil contient un lien/bouton équivalent vers la même URL.
- [ ] Aucun paramètre de tracking (`fbclid` ou autre) n'est présent dans les liens ajoutés.
- [ ] Aucune erreur console, aucun lien brisé.

## Livraison

Un seul petit commit suffit pour cette tâche (pas besoin de branche dédiée séparée si elle
est faite en même temps qu'une autre itération déjà en cours) — sinon, branche
`feature/lien-boutique` + pull request.
