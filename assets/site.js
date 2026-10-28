const responsive=document.createElement('link');
responsive.rel='stylesheet';
responsive.href='/assets/mobile.css?v=20261027a';
document.head.appendChild(responsive);

const menu=document.querySelector('.menu');
const links=document.querySelector('.nav-links');

if(links){
  const hasLink=href=>Array.from(links.querySelectorAll('a')).some(link=>link.getAttribute('href')===href);
  const addNavLink=(href,label,afterHref)=>{
    if(hasLink(href))return;
    const anchor=document.createElement('a');
    anchor.href=href;
    anchor.textContent=label;
    const after=Array.from(links.querySelectorAll('a')).find(link=>link.getAttribute('href')===afterHref);
    if(after)after.insertAdjacentElement('afterend',anchor);
    else{
      const cta=links.querySelector('.btn');
      if(cta)links.insertBefore(anchor,cta);
      else links.appendChild(anchor);
    }
  };
  addNavLink('/pricing.html','Pricing','/products.html');
  addNavLink('/store.html','Store','/pricing.html');
}

if(menu&&links){
  menu.setAttribute('aria-expanded','false');
  menu.setAttribute('aria-controls','site-navigation');
  links.id=links.id||'site-navigation';

  const closeMenu=()=>{
    links.classList.remove('open');
    menu.setAttribute('aria-expanded','false');
    document.body.classList.remove('nav-open');
  };

  menu.addEventListener('click',()=>{
    const isOpen=links.classList.toggle('open');
    menu.setAttribute('aria-expanded',String(isOpen));
    document.body.classList.toggle('nav-open',isOpen);
  });

  links.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});
  window.addEventListener('resize',()=>{if(window.innerWidth>900)closeMenu();});
}

const style=document.createElement('style');
style.textContent=`
.brand{width:250px;height:70px;background:url('/assets/logo-lockup.svg?v=20261018h') left center/contain no-repeat!important;font-size:0!important;display:inline-block!important;flex:none;max-width:38vw}.brand>*{display:none!important}
@media(max-width:900px){.brand{width:184px;height:52px;max-width:64vw}}
@media(max-width:520px){.brand{width:164px;height:46px;max-width:62vw}}
@media(max-width:360px){.brand{width:146px;height:42px}}
`;
document.head.appendChild(style);

document.querySelectorAll('body *').forEach(el=>{
  if(el.children.length===0&&el.textContent.includes('Los Angeles, California')){
    el.textContent=el.textContent.replace('Los Angeles, California','Missouri & California');
  }
});