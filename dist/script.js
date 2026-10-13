// Navigation stays usable without JavaScript; enhance to a touch menu on small screens.
(() => {
 const header=document.querySelector('.site-header');
 const toggle=document.getElementById('menu-toggle');
 const nav=document.getElementById('primary-nav');
 if(!header || !toggle || !nav) return;
 const compact=window.matchMedia('(max-width: 1050px)');
 let open=false;
 const render=()=>{
  toggle.hidden=!compact.matches;
  nav.hidden=compact.matches && !open;
  toggle.setAttribute('aria-expanded',String(open && compact.matches));
  const english=document.documentElement.lang==='en';
  toggle.setAttribute('aria-label',english?(open?'Close menu':'Open menu'):(open?'Cerrar menú':'Abrir menú'));
 };
 header.classList.add('navigation-ready');
 render();
 toggle.addEventListener('click',()=>{open=!open;render()});
 nav.addEventListener('click',event=>{if(event.target.closest('a')){open=false;render()}});
 document.addEventListener('keydown',event=>{if(event.key==='Escape' && open){open=false;render();toggle.focus()}});
 compact.addEventListener('change',()=>{
  const focusInNav=nav.contains(document.activeElement);
  const focusOnToggle=document.activeElement===toggle;
  open=false;render();
  if(compact.matches && focusInNav)toggle.focus();
  if(!compact.matches && focusOnToggle)nav.querySelector('a')?.focus();
 });
 window.addEventListener('jr:language',render);
})();

(() => {
 const button=document.getElementById('language');
 const events=location.pathname.startsWith('/eventos');
 const metadata={es:events?["DJ para eventos sociales en Argentina | Juanfra Ruiz", "DJ, sonido, iluminación y pantallas para eventos sociales en todo el país. Consultá tu fecha con Juanfra Ruiz."]:["Juanfra Ruiz | DJ para boliches y eventos en Mendoza", "DJ para boliches y eventos en Mendoza. Reggaetón old school, cumbia y cuarteto. Conocé la experiencia de Juanfra Ruiz y consultá por tu fecha."],en:events?["DJ for private events across Argentina | Juanfra Ruiz", "DJ, sound, lighting and screens for private events across Argentina. Ask Juanfra Ruiz about your date."]:["Juanfra Ruiz | DJ for clubs and events in Mendoza", "DJ for clubs and events in Mendoza. Old-school reggaeton, cumbia and cuarteto. Explore Juanfra Ruiz’s experience and ask about availability."]};
 function applyLanguage(lang){
  document.documentElement.lang=lang;
  document.querySelectorAll('[data-href-es][data-href-en]').forEach(el=>{el.href=el.dataset[lang==='es'?'hrefEs':'hrefEn']});
  document.querySelectorAll('[data-es][data-en]').forEach(el=>{el.textContent=el.dataset[lang]});
  document.querySelectorAll('[data-alt-es][data-alt-en]').forEach(el=>{el.alt=el.dataset[lang==='es'?'altEs':'altEn']});
  document.querySelectorAll('[data-label-es][data-label-en]').forEach(el=>{el.setAttribute('aria-label',el.dataset[lang==='es'?'labelEs':'labelEn'])});
  button.textContent=lang==='es'?'EN':'ES';button.setAttribute('aria-label',lang==='es'?'Switch to English':'Cambiar a español');
  document.title=metadata[lang][0];document.querySelector('meta[name="description"]').content=metadata[lang][1];
  document.querySelector('meta[property="og:title"]').content=metadata[lang][0];document.querySelector('meta[property="og:description"]').content=metadata[lang][1];
  window.dispatchEvent(new Event('jr:language'));
 }
 let lang='es';try{lang=localStorage.getItem('jr-language')==='en'?'en':'es'}catch{}
 applyLanguage(lang);button.addEventListener('click',()=>{lang=lang==='es'?'en':'es';applyLanguage(lang);try{localStorage.setItem('jr-language',lang)}catch{}});
})();

// Each element enters once. Photos keep their authored CSS crop and transforms.
(() => {
 if(!window.gsap || !window.ScrollTrigger) return;
 gsap.registerPlugin(ScrollTrigger);
 const media=gsap.matchMedia();
 let refreshFrame;
 let disposed=false;
 const refresh=()=>{
  if(disposed)return;
  cancelAnimationFrame(refreshFrame);
  refreshFrame=requestAnimationFrame(()=>ScrollTrigger.refresh());
 };
 media.add({motion:'(prefers-reduced-motion: no-preference)',desktop:'(min-width: 761px)'},context=>{
  if(!context.conditions.motion)return;
  const desktop=context.conditions.desktop;
  const records=[];
  const reveal=(element,photo=false)=>{
   // Never replay an entrance on content already visible or above a restored scroll position.
   if(element.getBoundingClientRect().top<window.innerHeight*.94)return;
   let tween;
   let played=false;
   const clearProps=photo?'opacity':'transform,opacity';
   const play=()=>{
    if(played)return;
    played=true;
    const distance=desktop?24:10;
    const heading=/^H[1-3]$/.test(element.tagName);
    const from=photo?{opacity:.75}:{x:heading?-distance:distance,opacity:.65};
    const to=photo?{opacity:1}:{x:0,opacity:1};
    tween=gsap.fromTo(element,from,{...to,duration:desktop?.55:.4,ease:'power2.out',overwrite:'auto',clearProps});
   };
   const trigger=ScrollTrigger.create({trigger:element,start:'clamp(top 94%)',once:true,onEnter:play,onLeave:()=>tween?.progress(1)});
   records.push({element,trigger,getTween:()=>tween,clearProps});
  };
  // Animate text itself, never its containing grid, links, buttons or entire sections.
  document.querySelectorAll('main h1:not(.hero-brand), main h2, main h3, main p, .venue-list li, .live-gallery img, .bio-photo img, .social-teaser figure img, .event-hero figure img').forEach(element=>{
   reveal(element,element.tagName==='IMG');
  });
  const focus=event=>records.forEach(record=>{
   if(record.element===event.target || record.element.contains(event.target))record.getTween()?.progress(1);
  });
  const paused=new Set();
  const visibility=()=>{
   if(document.hidden){
    records.forEach(record=>{const tween=record.getTween();if(tween?.isActive()){paused.add(tween);tween.pause()}});
   }else{paused.forEach(tween=>tween.resume());paused.clear()}
  };
  document.addEventListener('focusin',focus);
  document.addEventListener('visibilitychange',visibility);
  return ()=>{
   document.removeEventListener('focusin',focus);
   document.removeEventListener('visibilitychange',visibility);
   records.forEach(record=>{
    record.trigger.kill();record.getTween()?.kill();
    gsap.set(record.element,{clearProps:record.clearProps});
   });
   paused.clear();
  };
 });
 window.addEventListener('jr:language',refresh);
 const pendingImages=[...document.querySelectorAll('img')].filter(img=>!img.complete);
 pendingImages.forEach(img=>img.addEventListener('load',refresh,{once:true}));
 if(document.fonts)document.fonts.ready.then(refresh);
 // The back/forward cache retains the page and its animation state.
 window.addEventListener('pageshow',refresh);
 window.addEventListener('pagehide',event=>{
  if(event.persisted)return;
  disposed=true;cancelAnimationFrame(refreshFrame);media.revert();
  window.removeEventListener('jr:language',refresh);
  window.removeEventListener('pageshow',refresh);
  pendingImages.forEach(img=>img.removeEventListener('load',refresh));
 });
})();
