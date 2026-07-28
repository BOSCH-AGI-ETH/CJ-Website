// ═══════════════════════════════════════════════════════════════════
//  COLLECTIF JARDIN — Écosystème Jardin
//  Google Apps Script · Version 1.1
//
//  ORDRE DES COLONNES (onglet « Membres ») — NE PAS RÉORGANISER
//  sans mettre à jour ce script. Le code écrit par position :
//    A Date · B Nom · C Email · D Source · E Consentement · F Statut
//    · G Lot · H Token désabo · I Lien Désabonnement
//  « Lot » = groupe de 150 membres (contourne la limite d'envoi Gmail).
//
//  INSTALLATION :
//  1. Ouvrir Google Drive → Nouveau → Google Sheets → nommer "Écosystème Jardin"
//  2. Extensions → Apps Script → coller ce code entier → Enregistrer
//  3. Déployer → Gérer les déploiements → ✏️ modifier → Nouvelle version → Déployer
//     - Exécuter en tant que : Moi
//     - Accès : Tout le monde
//     ⚠️ Garder le MÊME déploiement pour conserver l'URL (SCRIPT_URL du site)
//  4. Autoriser les permissions Google au premier déploiement
// ═══════════════════════════════════════════════════════════════════

// ─── CONFIGURATION — modifier ici uniquement ───────────────────────
var CONFIG = {
  SHEET_NAME:       'Membres',           // nom de l'onglet dans le Sheet
  UNSUB_SHEET_NAME: 'Désabonnements',    // onglet pour les désabonnements
  COLLECTIF_NAME:   'Collectif Jardin',  // nom modulable
  LIST_NAME:        'Écosystème Jardin', // nom de la liste — modulable
  CONTACT_EMAIL:    'coll.jardin@gmail.com',
  ALLOWED_ORIGINS:  [                    // domaines autorisés à soumettre
    'https://collectifjardin.org',
    'https://www.collectifjardin.org',
    'http://localhost',                  // pour les tests locaux
    'null'                               // GitHub Pages preview
  ],
  HONEYPOT_FIELD:   'website',           // nom du champ piège (doit rester vide)
  LOT_SIZE:         150,                 // taille d'un lot d'envoi (limite Gmail)
  MAX_PER_MINUTE:   5,                   // plafond anti-rafale (insertions/minute, global)
  MAX_PER_HOUR:     30                   // plafond horaire (insertions/heure, global)
};
// ───────────────────────────────────────────────────────────────────

// En-tête de l'onglet « Membres » — ordre = ordre d'écriture des lignes.
var MEMBRES_HEADERS = [
  'Date', 'Nom', 'Email', 'Source', 'Consentement', 'Statut',
  'Lot', 'Token désabo', 'Lien Désabonnement'
];


// ─── POINT D'ENTRÉE POST (inscription) ────────────────────────────
function doPost(e) {
  var headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    var data = JSON.parse(e.postData.contents);

    // Honeypot : bot détecté → succès silencieux, aucune écriture
    if (honeypotFilled({ parameter: data })) {
      return respond({ success: true, status: 'subscribed' }, headers);
    }

    var nom    = sanitize(data.nom    || '');
    var email  = sanitize(data.email  || '');
    var source = sanitize(data.source || 'site-web');
    var consent = data.consent === true || data.consent === 'true';

    // Validation serveur
    if (!email || !isValidEmail(email)) {
      return respond({ success: false, error: 'email_invalide' }, headers);
    }
    if (!consent) {
      return respond({ success: false, error: 'consentement_requis' }, headers);
    }

    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getOrCreateSheet(ss, CONFIG.SHEET_NAME, MEMBRES_HEADERS);

    // Vérifier si l'email existe déjà
    var existingRow = findEmail(sheet, email);
    if (existingRow > 0) {
      // Réactiver si désabonné
      var statut = sheet.getRange(existingRow, 6).getValue();
      if (statut === 'désabonné') {
        sheet.getRange(existingRow, 6).setValue('actif');
        sheet.getRange(existingRow, 1).setValue(new Date());
        sheet.getRange(existingRow, 4).setValue(source);
        return respond({ success: true, status: 'reactivated' }, headers);
      }
      // Déjà inscrit et actif
      return respond({ success: true, status: 'already_subscribed' }, headers);
    }

    // Rate-limiting : bloquer avant toute nouvelle insertion
    var rl = rateLimitExceeded();
    if (rl.limited) {
      return respond({ success: false, error: 'rate_limited' }, headers);
    }

    // Générer un token unique pour le désabonnement
    var token = generateToken(email);
    var lot   = currentLot(sheet);

    // Ajouter la nouvelle ligne (ordre = MEMBRES_HEADERS)
    sheet.appendRow([
      new Date(),          // A Date
      nom,                 // B Nom
      email,               // C Email
      source,              // D Source (ex: site-web, brise-lames-2026, don-zeffy)
      'oui',               // E Consentement
      'actif',             // F Statut
      lot,                 // G Lot (groupe de 150 — limite d'envoi Gmail)
      token,               // H Token désabo
      unsubLink(token)     // I Lien Désabonnement
    ]);
    recordInsertion();

    return respond({ success: true, status: 'subscribed' }, headers);

  } catch(err) {
    return respond({ success: false, error: 'server_error', detail: err.toString() }, headers);
  }
}


// ─── POINT D'ENTRÉE GET (inscription + désabonnement) ─────────────
function doGet(e) {
  var action = e.parameter.action || '';

  // Inscription depuis le site via GET
  if (action === 'subscribe') {
    try {
      // Honeypot : bot détecté → succès silencieux, aucune écriture
      if (honeypotFilled(e)) {
        return respond({ success: true, status: 'subscribed' }, {});
      }

      var nom    = sanitize(e.parameter.nom    || '');
      var email  = sanitize(e.parameter.email  || '');
      var source = sanitize(e.parameter.source || 'site-web');
      var consent = e.parameter.consent === 'true';

      if (!email || !isValidEmail(email)) {
        return respond({ success: false, error: 'email_invalide' }, {});
      }
      if (!consent) {
        return respond({ success: false, error: 'consentement_requis' }, {});
      }

      var ss    = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = getOrCreateSheet(ss, CONFIG.SHEET_NAME, MEMBRES_HEADERS);

      var existingRow = findEmail(sheet, email);
      if (existingRow > 0) {
        var statut = sheet.getRange(existingRow, 6).getValue();
        if (statut === 'désabonné') {
          sheet.getRange(existingRow, 6).setValue('actif');
          sheet.getRange(existingRow, 1).setValue(new Date());
          sheet.getRange(existingRow, 4).setValue(source);
          return respond({ success: true, status: 'reactivated' }, {});
        }
        return respond({ success: true, status: 'already_subscribed' }, {});
      }

      // Rate-limiting : bloquer avant toute nouvelle insertion
      var rl = rateLimitExceeded();
      if (rl.limited) {
        return respond({ success: false, error: 'rate_limited' }, {});
      }

      var token = generateToken(email);
      var lot   = currentLot(sheet);
      sheet.appendRow([new Date(), nom, email, source, 'oui', 'actif', lot, token, unsubLink(token)]);
      recordInsertion();
      return respond({ success: true, status: 'subscribed' }, {});

    } catch(err) {
      return respond({ success: false, error: 'server_error', detail: err.toString() }, {});
    }
  }

  // Désabonnement via lien email
  if (action === 'unsub' && e.parameter.token) {
    var result = processUnsub(e.parameter.token);
    return HtmlService.createHtmlOutput(buildUnsubPage(result));
  }

  // Page par défaut si accès direct
  return HtmlService.createHtmlOutput(
    '<html><body style="font-family:monospace;background:#141414;color:#fffbdb;padding:40px;text-align:center;">'
    + '<h2 style="color:#edacff;">' + CONFIG.COLLECTIF_NAME + '</h2>'
    + '<p>' + CONFIG.LIST_NAME + '</p>'
    + '</body></html>'
  );
}


// ─── DÉSABONNEMENT ─────────────────────────────────────────────────
function processUnsub(token) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) return { success: false, error: 'sheet_introuvable' };

  var data  = sheet.getDataRange().getValues();
  var tokenCol = 7; // index 0-based → colonne H = « Token désabo »

  for (var i = 1; i < data.length; i++) {
    if (data[i][tokenCol] === token) {
      var email = data[i][2];
      // Marquer désabonné
      sheet.getRange(i + 1, 6).setValue('désabonné');

      // Logger dans onglet désabonnements
      var unsubSheet = getOrCreateSheet(ss, CONFIG.UNSUB_SHEET_NAME, [
        'Date désabo', 'Email', 'Token'
      ]);
      unsubSheet.appendRow([new Date(), email, token]);

      return { success: true, email: email };
    }
  }
  return { success: false, error: 'token_introuvable' };
}


// ─── UTILITAIRES ──────────────────────────────────────────────────
function sanitize(str) {
  return String(str).replace(/<[^>]*>/g, '').trim().substring(0, 200);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── DÉFENSES ABUS (honeypot + rate-limiting) ─────────────────────
// Le honeypot : si le champ piège est rempli, c'est un bot.
function honeypotFilled(e) {
  var hp = (e && e.parameter) ? e.parameter[CONFIG.HONEYPOT_FIELD] : '';
  return hp != null && String(hp).trim() !== '';
}

// Vérifie les compteurs AVANT insertion (lecture seule, n'incrémente pas).
function rateLimitExceeded() {
  var cache   = CacheService.getScriptCache();
  var perMin  = parseInt(cache.get('cj_count_min')  || '0', 10);
  var perHour = parseInt(cache.get('cj_count_hour') || '0', 10);
  if (perMin >= CONFIG.MAX_PER_MINUTE) {
    return { limited: true, reason: 'minute' };
  }
  if (perHour >= CONFIG.MAX_PER_HOUR) {
    Logger.log('[CJ] Plafond horaire atteint (' + perHour + '/' + CONFIG.MAX_PER_HOUR
      + ') — refus temporaire des nouvelles insertions.');
    return { limited: true, reason: 'hour' };
  }
  return { limited: false };
}

// N'est appelé QUE sur une vraie insertion (pas réactivation/déjà inscrit/honeypot).
function recordInsertion() {
  var cache   = CacheService.getScriptCache();
  var perMin  = parseInt(cache.get('cj_count_min')  || '0', 10) + 1;
  var perHour = parseInt(cache.get('cj_count_hour') || '0', 10) + 1;
  cache.put('cj_count_min',  String(perMin),  60);    // fenêtre 1 minute
  cache.put('cj_count_hour', String(perHour), 3600);  // fenêtre 1 heure
}

// Lot d'envoi : groupe de CONFIG.LOT_SIZE membres (contourne la limite Gmail).
// La prochaine ligne ajoutée sera à getLastRow()+1 ; l'en-tête occupe la ligne 1,
// donc le rang du futur membre parmi les données = getLastRow().
function currentLot(sheet) {
  return Math.ceil(sheet.getLastRow() / CONFIG.LOT_SIZE);
}

// Lien de désabonnement personnalisé (URL du déploiement + token).
function unsubLink(token) {
  return ScriptApp.getService().getUrl() + '?action=unsub&token=' + token;
}

function generateToken(email) {
  var raw = email + Date.now() + Math.random();
  return Utilities.base64Encode(Utilities.computeDigest(
    Utilities.DigestAlgorithm.MD5,
    raw
  )).replace(/[+/=]/g, '').substring(0, 32);
}

function findEmail(sheet, email) {
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][2]).toLowerCase() === email.toLowerCase()) {
      return i + 1; // numéro de ligne (1-indexé)
    }
  }
  return -1;
}

function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    // Mise en forme de l'en-tête
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#38050e');
    headerRange.setFontColor('#fffbdb');
  }
  return sheet;
}

function respond(data, headers) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

function buildUnsubPage(result) {
  var bg      = '#141414';
  var cream   = '#fffbdb';
  var mauve   = '#edacff';
  var orange  = '#fd2f00';

  var message = result.success
    ? '<h2 style="color:' + mauve + ';font-size:24px;margin-bottom:16px;">Désabonnement confirmé</h2>'
      + '<p style="color:rgba(255,251,219,.65);line-height:1.8;">Tu as été retiré·e de <strong style="color:' + cream + ';">'
      + CONFIG.LIST_NAME + '</strong>.</p>'
      + '<p style="color:rgba(255,251,219,.4);font-size:11px;margin-top:24px;letter-spacing:.1em;">Le jardin reste ouvert si tu veux revenir.</p>'
    : '<h2 style="color:' + orange + ';font-size:22px;margin-bottom:16px;">Lien invalide</h2>'
      + '<p style="color:rgba(255,251,219,.55);line-height:1.8;">Ce lien de désabonnement n\'est pas valide ou a déjà été utilisé.</p>'
      + '<p style="color:rgba(255,251,219,.35);font-size:11px;margin-top:20px;">Pour toute question : '
      + '<a href="mailto:' + CONFIG.CONTACT_EMAIL + '" style="color:' + mauve + ';">' + CONFIG.CONTACT_EMAIL + '</a></p>';

  return '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<title>' + CONFIG.COLLECTIF_NAME + ' — Désabonnement</title>'
    + '</head><body style="font-family:\'Space Mono\',monospace;background:' + bg + ';color:' + cream + ';'
    + 'min-height:100vh;display:flex;align-items:center;justify-content:center;padding:40px;text-align:center;">'
    + '<div style="max-width:420px;">'
    + '<div style="font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:' + orange + ';margin-bottom:32px;">'
    + CONFIG.COLLECTIF_NAME + '</div>'
    + message
    + '<a href="https://collectifjardin.org" style="display:inline-block;margin-top:40px;border:1px solid rgba(237,172,255,.2);'
    + 'color:rgba(255,251,219,.45);padding:10px 24px;font-size:11px;letter-spacing:.15em;text-transform:uppercase;'
    + 'text-decoration:none;">← Retour au site</a>'
    + '</div></body></html>';
}

// ─── UTILITAIRE — Réparer tokens + liens + lots manquants ──────────
// À exécuter UNE FOIS depuis l'éditeur Apps Script pour combler les
// lignes existantes sans token, sans lien, ou sans numéro de lot.
function genererTokensManquants() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet()
                .getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) { SpreadsheetApp.getUi().alert('Onglet "' + CONFIG.SHEET_NAME + '" introuvable.'); return; }
  var data  = sheet.getDataRange().getValues();
  var count = 0;
  for (var i = 1; i < data.length; i++) {
    var email = data[i][2]; // C
    var lot   = data[i][6]; // G
    var token = data[i][7]; // H = Token désabo
    var lien  = data[i][8]; // I = Lien Désabonnement
    if (!email) continue;

    // Numéro de lot manquant → calculé depuis la position de la ligne
    if (!lot) {
      sheet.getRange(i + 1, 7).setValue(Math.ceil(i / CONFIG.LOT_SIZE)); // i = rang du membre
      count++;
    }
    // Token manquant → générer + poser le lien
    if (!token) {
      token = generateToken(email);
      sheet.getRange(i + 1, 8).setValue(token);            // H
      sheet.getRange(i + 1, 9).setValue(unsubLink(token)); // I
      count++;
    } else if (!lien) {
      // Token présent mais lien vide → reconstruire le lien
      sheet.getRange(i + 1, 9).setValue(unsubLink(token));
      count++;
    }
  }
  SpreadsheetApp.getUi().alert(count + ' correction(s) appliquée(s) avec succès.');
}

// ─── TEST MANUEL (à utiliser depuis l'éditeur Apps Script) ─────────
function testInscription() {
  var fakeEvent = {
    postData: {
      contents: JSON.stringify({
        nom: 'Test Jardin',
        email: 'test@exemple.com',
        source: 'test-manuel',
        consent: true
      })
    }
  };
  var result = doPost(fakeEvent);
  Logger.log(result.getContent());
}
