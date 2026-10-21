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

// Prepare below-fold elements before they enter; observe native scrolling without refresh resets.
(() => {
 if(!window.gsap || !('IntersectionObserver' in window))return;
 const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
 const completed=new WeakSet();
 let observer;
 let records=[];
 const reset=()=>{
  observer?.disconnect();
  records.forEach(record=>{
   record.tween?.progress(1);
   gsap.set(record.element,{clearProps:record.photo?'opacity':'transform,opacity'});
  });
  records=[];
 };
 const setup=()=>{
  reset();
  if(motion.matches)return;
  const desktop=window.matchMedia('(min-width: 761px)').matches;
  const elements=[...document.querySelectorAll('main h1:not(.hero-brand), main h2, main h3, main p, .venue-name, .venue-mark > span, .live-gallery img, .bio-photo img, .social-teaser figure img, .event-hero figure img')];
  // Measure all positions before writing any style.
  const measurements=elements.map(element=>({element,top:element.getBoundingClientRect().top}));
  const byElement=new Map();
  observer=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    const record=byElement.get(entry.target);
    if(!record || completed.has(record.element))return;
    completed.add(record.element);
    observer.unobserve(record.element);
    const target=record.photo?{opacity:1}:{x:0,opacity:1};
    record.tween=gsap.to(record.element,{...target,duration:record.photo?1.3:1.15,ease:'power1.inOut',overwrite:'auto',clearProps:record.photo?'opacity':'transform,opacity'});
   });
  },{rootMargin:'0px 0px -4% 0px',threshold:0});
  measurements.forEach(({element,top})=>{
   if(completed.has(element) || top<window.innerHeight){completed.add(element);return}
   const photo=element.tagName==='IMG';
   const heading=/^H[1-3]$/.test(element.tagName);
   const distance=desktop?30:14;
   const record={element,photo,tween:null};
   records.push(record);byElement.set(element,record);
   gsap.set(element,photo?{opacity:0}:{x:heading?-distance:distance,opacity:0});
   observer.observe(element);
  });
 };
 const focus=event=>records.forEach(record=>{
  if(record.element===event.target || record.element.contains(event.target)){
   observer?.unobserve(record.element);completed.add(record.element);
   record.tween?.progress(1);
   gsap.set(record.element,{clearProps:record.photo?'opacity':'transform,opacity'});
  }
 });
 motion.addEventListener('change',setup);
 document.addEventListener('focusin',focus);
 window.addEventListener('pagehide',event=>{if(!event.persisted)reset()});
 setup();
})();
