# Instruction pour Claude Code — Section "Location de matériel" (`location.html`)

## Contexte

Tu es déjà co-créateur du site `collectifjardin.org` (repo `BOSCH-AGI-ETH/Billeterie`) —
pas besoin de te décrire le système de design, tu le connais. Cette instruction porte
uniquement sur la fonctionnalité à livrer : une nouvelle page `location.html` avec un
catalogue de location d'équipement en panier, qui envoie une demande par courriel.

Ceci est une **demande**, pas un paiement en ligne — l'équipe valide la disponibilité et
recontacte le locataire pour la suite (remise, paiement sur place, contrat papier signé).
Aucun paiement, aucune valeur de remboursement/assurance n'apparaît sur cette page.

## Catalogue (source de vérité — prix/jour en $)

**Câbles et accessoires**
Cable XLR Standard 6po (2) · Cable XLR Standard 1pied (2) · Cable XLR Standard 3pied (2) ·
Cable XLR Standard 30pied (3) · Cable F-XLR to Jack 1/4 (2) · Cable M-Jack 1/4 (2) ·
Cable Speakon 10pied M-M (4) · Cable Speakon 40pied M-M (6) ·
Cable Speakon 40pied M-Nacked (6) · Powerbar alim (3) · Switch ethernet (5) ·
Cable RJ45 3pied (1) · Cable RJ45 6pied (1) · Extension électrique 40pied (8) ·
Câbles d'alimentation IEC 1.5m (1) · Câbles d'alimentation IEC 2m (1)

**Son / traitement**
Crossover Rockville RX230 (15) · Equalizer/Limiter dbx 2231 (20) ·
Ampli Crest Performance CPX1500 (60) · Mixer Soundcraft EPM6 (40)

**Haut-parleurs**
Top Turbosound (75) · Pole top Turbosound (10) · Subwoofer JBL 4530 18po (60) ·
Subwoofer Turbosound 18po (90)

**Éclairage / effets**
Console DMX Behringer Eurolight LC2412 (30) · Smoke machine Chauvet DJ (25) ·
Laser Big Dipper B500 (50) · Laser Cameo Luke Series (60) · Laser CR-Laser FS-6 (40)

**DJ**
Pioneer CDJ-2000NXS (60) · Pioneer DJM-900NXS (50)

## Le panier

- Regroupe les items par catégorie (5 catégories ci-dessus), prix/jour affiché à côté de
  chaque nom.
- Deux champs numériques par item : **quantité** et **nombre de jours**.
- Sous-total par ligne = quantité × jours × prix/jour, affiché en direct.
- **Total général** recalculé en direct à chaque changement, bien visible (idéal : barre
  sticky en bas de l'écran, visible même en scrollant le catalogue).
- Aucune quantité/jours négatifs ; valeurs par défaut à 0.

## Formulaire d'informations du demandeur

Champs requis, dans cet ordre :
1. **Nom**
2. **Courriel** (expéditeur — c'est l'adresse à laquelle l'équipe répond)
3. **Téléphone**
4. **Date de remise souhaitée**
5. **Date de retour prévue**
6. Événement / usage prévu (texte libre, optionnel)

Utilise des champs `type="date"` pour la date de remise et la date de retour (pas du texte
libre) — ça évite les formats ambigus et permet une validation native (retour ≥ remise).

## Envoi de la demande

Bouton "Envoyer la demande" :
- Valide que nom, courriel, téléphone, date de remise et date de retour sont remplis,
  et qu'au moins un item a quantité > 0 et jours > 0. Sinon, message d'erreur clair, pas
  d'envoi.
- Valide que la date de retour n'est pas avant la date de remise.
- Construit un lien `mailto:` vers l'adresse courriel de contact du collectif (déjà
  présente ailleurs sur le site, section Contact) avec sujet `Demande de location — [nom]`
  et corps de message contenant :
  - Nom, courriel, téléphone du demandeur
  - Date de remise, date de retour
  - Événement/usage
  - Liste des items demandés (nom, quantité, jours, sous-total)
  - Total général estimé
  - Une ligne rappelant que c'est une demande à valider par l'équipe

## Critères d'acceptation

- [ ] `location.html` existe, accessible depuis la nav (lien "Location").
- [ ] Le catalogue affiche les ~31 items ci-dessus, groupés par catégorie, avec prix/jour.
- [ ] Le total se recalcule en direct sans rechargement de page.
- [ ] Le formulaire capture nom, courriel, téléphone, date de remise, date de retour,
      usage — dans cet ordre.
- [ ] Les dates utilisent des input `type="date"` avec validation retour ≥ remise.
- [ ] Le clic sur "Envoyer" ouvre le client courriel par défaut avec un résumé complet et
      lisible (items, quantités, jours, sous-totaux, total, coordonnées, dates).
- [ ] Aucun envoi possible si un champ requis manque ou si aucun item n'est sélectionné.
- [ ] Aucune valeur de remboursement/assurance affichée nulle part sur la page.
- [ ] Page utilisable sur mobile (375px) sans débordement horizontal, sans erreur console.

## Livraison

Branche dédiée (ex. `feature/location-materiel`), commits séparés par étape logique,
puis pull request pour révision avant merge/déploiement.
