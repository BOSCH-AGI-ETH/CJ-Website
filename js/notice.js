(function(){
  'use strict';
  var KEY='cj_notice_dismissed';
  if(localStorage.getItem(KEY))return;

  var banner=document.createElement('div');
  banner.id='cj-notice';
  banner.style.cssText=[
    'position:fixed',
    'bottom:0','left:0','right:0',
    'z-index:9990',
    'background:#1a1a1a',
    'border-top:1px solid rgba(237,172,255,.2)',
    'padding:14px 24px',
    'display:flex',
    'align-items:center',
    'justify-content:space-between',
    'flex-wrap:wrap',
    'gap:12px',
    'opacity:0',
    'transition:opacity .3s ease',
    'font-family:"Space Mono",monospace',
    'font-size:11px',
    'letter-spacing:.05em',
    'line-height:1.7',
    'color:rgba(255,251,219,.8)'
  ].join(';');

  var privacyUrl=function(){
    var path=location.pathname;
    var depth=(path.match(/\//g)||[]).length-1;
    var prefix=depth>0?'../'.repeat(depth):'';
    return prefix+'privacy-policy.html';
  }();

  banner.innerHTML=
    '<span>Ce site n\'utilise <strong style="color:#fffbdb;">aucun cookie de traçage</strong>. '+
    'Seules des données techniques minimales (adresse IP) sont transmises à '+
    '<a href="https://policies.google.com/privacy" target="_blank" rel="noopener" style="color:#edacff;text-decoration:none;">Google Fonts</a> '+
    'et à notre hébergeur pour le fonctionnement du site. '+
    '<a href="'+privacyUrl+'" style="color:#edacff;text-decoration:none;">Politique de confidentialité →</a></span>'+
    '<button id="cj-notice-ok" style="'+
      'background:none;'+
      'border:1px solid rgba(237,172,255,.35);'+
      'color:#edacff;'+
      'font-family:\'Space Mono\',monospace;'+
      'font-size:10px;'+
      'letter-spacing:.14em;'+
      'text-transform:uppercase;'+
      'padding:9px 18px;'+
      'cursor:pointer;'+
      'white-space:nowrap;'+
      'flex-shrink:0;'+
      '-webkit-tap-highlight-color:transparent;'+
    '">Compris</button>';

  document.body.appendChild(banner);

  requestAnimationFrame(function(){
    requestAnimationFrame(function(){
      banner.style.opacity='1';
    });
  });

  document.getElementById('cj-notice-ok').addEventListener('click',function(){
    banner.style.opacity='0';
    setTimeout(function(){if(banner.parentNode)banner.parentNode.removeChild(banner);},300);
    try{localStorage.setItem(KEY,'1');}catch(e){}
  });
})();
