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

// Native scrolling, small composited movements, and a static reduced-motion path.
(() => {
 if(!window.gsap || !window.ScrollTrigger) return;
 gsap.registerPlugin(ScrollTrigger);
 const media=gsap.matchMedia();
 let refreshFrame;
 let disposed=false;
 const refresh=()=>{if(disposed)return;cancelAnimationFrame(refreshFrame);refreshFrame=requestAnimationFrame(()=>ScrollTrigger.refresh())};
 media.add({motion:'(prefers-reduced-motion: no-preference)',desktop:'(min-width: 761px)'},context=>{
  if(!context.conditions.motion) return;
  const desktop=context.conditions.desktop;
  const timelines=[];
  let side=1;
  const reveal=(trigger,targets,options={})=>{
   const elements=gsap.utils.toArray(targets).filter(Boolean);
   if(!trigger || !elements.length) return;
   const tl=gsap.timeline({scrollTrigger:{trigger,start:'clamp(top 86%)',once:true},defaults:{ease:'power3.out'}});
   side*=-1;
   tl.from(elements,{x:side*(desktop?32:16),y:0,opacity:.45,duration:desktop?.65:.45,stagger:desktop?.07:.04,clearProps:'transform,opacity',immediateRender:false,...options});
   timelines.push({tl,elements});
  };
  const hero=document.querySelector('.hero');
  if(hero && window.scrollY<80 && !location.hash){
   const cue=gsap.timeline({defaults:{ease:'power3.out'}});
   cue.from(hero.querySelector('.hero-logo'),{y:12,opacity:.65,duration:.7,clearProps:'transform,opacity'},0)
      .from(hero.querySelector('.hero-art img'),{opacity:.88,duration:.75,clearProps:'opacity'},0)
      .from(hero.querySelectorAll('.hero-line,.hero-description'),{y:5,opacity:.75,duration:.4,stagger:.05,clearProps:'transform,opacity'},.08);
   timelines.push({tl:cue,elements:[hero]});
  }
  const bio=document.querySelector('.bio');
  if(bio){
   reveal(bio.querySelector('.bio-copy'),bio.querySelectorAll('h2,.bio-copy > p,.bio-copy .text-link'));
   reveal(bio.querySelector('.bio-photo'),bio.querySelector('.bio-photo img'),{x:0,y:0,scale:desktop?1.035:1,duration:desktop?.85:.4,clearProps:'transform,opacity'});
  }
  const biography=document.querySelector('.biography');
  if(biography){
   reveal(biography,biography.querySelector('h2'));
   reveal(biography.querySelector('.biography-copy'),biography.querySelectorAll('.biography-copy > p'),{y:12,stagger:.06});
  }
  const venues=document.querySelector('.venues');
  if(venues){
   reveal(venues,venues.querySelectorAll('.venues-heading > *'));
   reveal(venues.querySelector('.venue-list'),venues.querySelectorAll('.venue-list li'),{stagger:.08,y:12});
  }
  const trajectory=document.querySelector('.trajectory');
  if(trajectory){
   reveal(trajectory,trajectory.querySelectorAll('.trajectory-intro > h2, .trajectory-intro > p'));
   reveal(trajectory.querySelector('.experience-list'),trajectory.querySelectorAll('.experience-list article'),{x:desktop?16:0,y:desktop?0:12,stagger:.12});
  }
  document.querySelectorAll('.live-gallery .photo-window').forEach(frame=>{
   const image=frame.querySelector('img');
   if(frame.hasAttribute('data-full-image')){
    reveal(frame,image,{x:0,y:0,opacity:.8,duration:.55,clearProps:'opacity'});
    return;
   }
   if(desktop){
    gsap.fromTo(image,{yPercent:0,scale:1.2},{yPercent:-1,scale:1.2,ease:'none',scrollTrigger:{trigger:frame,start:'clamp(top bottom)',end:'clamp(bottom top)',scrub:.65}});
   }else reveal(frame,image,{x:0,y:0,opacity:.8,duration:.4,clearProps:'opacity'});
  });
  const music=document.querySelector('.music');
  if(music){
   reveal(music,music.querySelectorAll('.music-grid > div:first-child > *'));
   reveal(music.querySelector('.spotify-panel'),music.querySelector('.spotify-panel'),{x:desktop?18:0,y:desktop?0:12,opacity:.82});
  }
  const teaser=document.querySelector('.social-teaser');
  if(teaser)reveal(teaser,teaser.querySelectorAll(':scope > *'),{stagger:.1});
  const eventIntro=document.querySelector('.event-intro');
  if(eventIntro){
   reveal(eventIntro,eventIntro.querySelector('.intro-grid > h2'),{x:desktop?-32:-16});
   reveal(eventIntro,eventIntro.querySelectorAll('.intro-grid > div > *'),{x:desktop?32:16});
  }
  const production=document.querySelector('.event-production');
  if(production){
   reveal(production,production.querySelector('.production-grid h2'),{x:desktop?-32:-16});
   reveal(production,production.querySelectorAll('.production-grid > div:last-child > *'),{x:desktop?32:16});
   reveal(production.querySelector('.technical-services'),production.querySelectorAll('.technical-services article'),{y:12,stagger:.08});
  }
  const eventTypes=document.querySelector('.event-types');
  if(eventTypes)reveal(eventTypes,eventTypes.querySelectorAll('article'),{stagger:.11});
  const eventHero=document.querySelector('.event-hero');
  if(eventHero){
   reveal(eventHero,eventHero.querySelectorAll(':scope > div > h1, :scope > div > p'),{x:desktop?-32:-16});
   reveal(eventHero.querySelector('figure'),eventHero.querySelector('figure'),{x:desktop?24:12,opacity:.75});
  }
  const eventNext=document.querySelector('.event-next');
  if(eventNext)reveal(eventNext,eventNext.querySelectorAll(':scope > *'));
  const contact=document.querySelector('.contact');
  if(contact){
   reveal(contact,contact.querySelectorAll('.contact-grid > div:first-child > *'));
   reveal(contact.querySelector('.contact-links'),contact.querySelectorAll('.contact-links > a'),{y:10,duration:.45,stagger:.06});
  }
  // Never move a focused link away from its keyboard position.
  const focus=event=>timelines.forEach(({tl,elements})=>{
   if(elements.some(el=>el===event.target || el.contains(event.target))) tl.progress(1);
  });
  const paused=new Set();
  const visibility=()=>{
   if(document.hidden){timelines.forEach(({tl})=>{if(tl.isActive()){paused.add(tl);tl.pause()}})}
   else{paused.forEach(tl=>tl.resume());paused.clear()}
  };
  document.addEventListener('focusin',focus);
  document.addEventListener('visibilitychange',visibility);
  return ()=>{document.removeEventListener('focusin',focus);document.removeEventListener('visibilitychange',visibility)};
 });
 window.addEventListener('jr:language',refresh);
 const pendingImages=[...document.querySelectorAll('img')].filter(img=>!img.complete);
 pendingImages.forEach(img=>img.addEventListener('load',refresh,{once:true}));
 if(document.fonts)document.fonts.ready.then(refresh);
 window.addEventListener('pagehide',()=>{
  disposed=true;cancelAnimationFrame(refreshFrame);media.revert();
  window.removeEventListener('jr:language',refresh);
  pendingImages.forEach(img=>img.removeEventListener('load',refresh));
 },{once:true});
})();
