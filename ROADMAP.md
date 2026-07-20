# 🌱 Collectif Jardin — Roadmap des prochaines étapes

Tâches à venir, **par ordre de priorité**. On termine (ou valide) une étape
avant de passer à la suivante.

---

## 1. 🛒 Boutique en ligne

Mettre en place une boutique en ligne pour le collectif (merch / produits).

- [ ] Définir le périmètre : quels produits, quel mode de paiement, quelle
      livraison / cueillette (spec à documenter en Markdown avant de coder).
- [ ] Choisir l'approche technique compatible avec la stack actuelle
      (HTML/CSS/JS statique, GitHub Pages — pas de back-end) : service externe
      (Shopify buy-button, Zeffy, Stripe Payment Links, etc.) intégré au site.
- [ ] Intégrer la boutique au site (page ou section dédiée) dans la charte
      graphique existante.

## 2. ✅ Validation de l'information — Projets & Événements

Passer en revue **chaque projet et chaque événement** et valider les infos.

- [ ] **Description** exacte et à jour pour chaque entrée.
- [ ] **Date** correcte (et cohérente entre l'accueil et les sous-pages).
- [ ] **Image** présente et pertinente (remplacer les placeholders
      « Affiche à venir » quand l'info est disponible).
- [ ] Couvrir les événements **passés** (archives) **et futurs** (à venir).
- [ ] Vérifier la cohérence des liens (billetterie, détails).

## 3. 📍 Section location

Ajouter une section « location » au site (spec à documenter en Markdown).

- [ ] Préciser l'objet : location de matériel (ex. système de son maison une
      fois construit), location d'espace, ou autre.
- [ ] Définir le contenu (offre, tarifs/contact, conditions).
- [ ] Intégrer la section dans la charte graphique existante.

## 4. 🎨 Refonte visuelle « festif / futuriste »

Refonte visuelle majeure du site — voir le brief complet :
**[`REFONTE-VISUELLE-BRIEF.md`](./REFONTE-VISUELLE-BRIEF.md)**.

- [ ] Se fait sur une **branche dédiée** (`refonte-visuelle-2026`), jamais
      directement sur `main`.
- [ ] Avant de coder : proposer 2-3 directions concrètes, en choisir une
      ensemble.
- [ ] Implémentation **section par section**, un commit par section.
- [ ] Garde intacts : palette, typographies, contenu (cf. section 1 du brief).

---

*Dernière mise à jour : 2026-07-19.*
