// Versión mejorada del overlay: validación, estados y manejo de respuestas
(function(){
  try{
    var css = `
#beta-overlay{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:99999;font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial;}
#beta-overlay .nm-card{pointer-events:auto;max-width:720px;margin:0 1rem;background:linear-gradient(180deg,rgba(18,12,30,0.96),rgba(22,16,36,0.96));color:#f7efe6;border:1px solid rgba(212,175,55,0.12);padding:18px 20px;border-radius:12px;box-shadow:0 14px 40px rgba(0,0,0,0.6);backdrop-filter:blur(6px);}
.nm-row{display:flex;align-items:center;gap:14px;margin-bottom:10px;}
.nm-logo{width:44px;height:44px;border-radius:10px;background:linear-gradient(135deg,#d4af37,#f7e2a3);display:flex;align-items:center;justify-content:center;color:#1a1220;font-weight:700;font-size:16px;}
.nm-title{font-size:1.03rem;font-weight:700;color:#f3e7d6;}
.nm-sub{font-size:0.9rem;color:#e6d7c3;}
#beta-close{margin-left:auto;background:transparent;border:1px solid rgba(212,175,55,0.14);color:#d4af37;padding:6px 10px;border-radius:8px;cursor:pointer;font-weight:600;}
#beta-newsletter{display:flex;gap:10px;align-items:center;}
#beta-email{flex:1;padding:10px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.02);color:#fff;outline:none;font-size:0.95rem;}
#beta-newsletter button{background:linear-gradient(90deg,#d4af37,#f8e6a0);color:#1a1220;border:none;padding:10px 14px;border-radius:8px;font-weight:700;cursor:pointer;}
#beta-feedback{margin-top:8px;font-size:0.9rem;color:#cfc2a8;}
#beta-overlay .small{font-size:12px;color:#bfb1a0;margin-top:6px}
`;
    var style=document.createElement('style'); style.appendChild(document.createTextNode(css)); document.head.appendChild(style);

    var overlayKey='beta-closed-v2';
    if(localStorage.getItem(overlayKey)) return;

    var container=document.createElement('div'); container.id='beta-overlay';
    container.innerHTML='\n  <div class="nm-card">\n    <div class="nm-row">\n      <div class="nm-logo">NM</div>\n      <div>\n        <div class="nm-title">Nebulosa Mágica — BETA</div>\n        <div class="nm-sub">Estamos en pruebas. Suscríbete para recibir novedades y acceso anticipado.</div>\n      </div>\n      <button id="beta-close">Cerrar</button>\n    </div>\n    <form id="beta-newsletter">\n      <input id="beta-email" type="email" placeholder="Tu email (p.ej. nombre@ejemplo.com)" required />\n      <button type="submit">Suscribirse</button>\n    </form>\n    <div id="beta-feedback"></div>\n    <div class="small">No compartimos tu email. Puedes cerrar este mensaje si no quieres suscribirte.</div>\n  </div>\n';
    document.body.appendChild(container);

    var closeBtn=document.getElementById('beta-close');
    var form=document.getElementById('beta-newsletter');
    var emailInput=document.getElementById('beta-email');
    var feedback=document.getElementById('beta-feedback');
    closeBtn.addEventListener('click',function(){ container.style.display='none'; try{ localStorage.setItem(overlayKey,'1'); }catch(e){} });
    form.addEventListener('submit',function(ev){ ev.preventDefault(); var email=emailInput.value.trim(); if(!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){ feedback.style.color='#f6c2c2'; feedback.textContent='Introduce un email válido.'; return; } feedback.style.color='#cfc2a8'; feedback.textContent='Enviando…';
      fetch('/api/newsletter/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email})}).then(function(res){ return res.json().then(function(j){ return {ok:res.ok, j}; }); }).then(function(r){ if(r.ok && r.j && r.j.success){ feedback.style.color='#bfe8c9'; feedback.textContent='¡Gracias! Revisa tu inbox para confirmar.'; try{localStorage.setItem('nm-subscribed',email);}catch(e){} } else { feedback.style.color='#f6c2c2'; feedback.textContent=(r.j && r.j.error) ? ('Error: '+r.j.error) : 'No se pudo suscribir. Intenta más tarde.'; } }).catch(function(err){ console.error(err); feedback.style.color='#f6c2c2'; feedback.innerHTML='No se pudo suscribir automáticamente. <a href="mailto:hola@nebulosamagica.com?subject=Suscripción%20newsletter&body='+encodeURIComponent('Por favor suscríbeme: '+email)+'">Envíanos un email</a>'; });
    });
  }catch(e){ console.error('beta-overlay error',e); }
})();
