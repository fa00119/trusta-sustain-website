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
  addNavLink('/self-service.html','Self-service','/store.html');
  addNavLink('/assessments.html','Assessments','/self-service.html');
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

if(window.location.pathname.endsWith('/store.html')||window.location.pathname==='/store'){
  const managed=document.querySelector('#managed');
  if(managed&&!document.querySelector('#quick-services')){
    const section=document.createElement('section');
    section.className='section band';
    section.id='quick-services';
    section.innerHTML=`
      <div class="container">
        <div class="section-head">
          <div><span class="eyebrow">Self-service first · optional human QA</span><h2>Try the analysis yourself before paying for review.</h2></div>
          <p class="muted">For common decisions and CSV data checks, Trusta now offers browser-based analysis first. If the result is enough, stop there. If you need evidence review, deeper interpretation, or human QA, upgrade to a fixed-scope review.</p>
        </div>
        <div class="grid grid-3">
          <article class="card product-card">
            <span class="num">FREE → $195 optional</span><h3>Decision Snapshot</h3>
            <div class="typebar"><span class="type">self-service first</span><span class="type">human QA optional</span></div>
            <p>Compare options with weighted criteria, sensitivity, decision confidence, and an executive memo in your browser.</p>
            <details class="what" open><summary>Free self-service output</summary><ul><li>weighted option ranking</li><li>relative fit and score separation</li><li>most influential criteria</li><li>confidence / sensitivity posture</li><li>decision memo + next actions</li><li>Print / Save PDF</li></ul></details>
            <details class="what"><summary>When the $195 review adds value</summary><ul><li>evidence needs independent challenge</li><li>assumptions are uncertain</li><li>tradeoffs are high-impact</li><li>you want an independent recommendation</li></ul></details>
            <div class="actions"><a class="btn btn-accent" href="/self-service.html">Run free now</a><a class="btn" href="https://buy.stripe.com/4gM00ia9t4oj5cB7Wbgbm0u">Add human QA · $195</a></div>
          </article>
          <article class="card product-card">
            <span class="num">FREE → $249 optional</span><h3>Spreadsheet / CSV QuickScan</h3>
            <div class="typebar"><span class="type">local browser scan</span><span class="type">no upload</span></div>
            <p>Run a first-pass data-quality profile locally on your device before buying a deeper review.</p>
            <details class="what" open><summary>Free self-service output</summary><ul><li>rows and columns</li><li>missingness by column</li><li>exact duplicate rows</li><li>likely data types</li><li>possible numeric outlier flags</li><li>quality score + priority actions</li></ul></details>
            <details class="what"><summary>When the $249 review adds value</summary><ul><li>formula logic needs inspection</li><li>business meaning / lineage matters</li><li>multiple sheets or complex structures exist</li><li>you need independent decision-readiness QA</li></ul></details>
            <div class="actions"><a class="btn btn-accent" href="/self-service.html">Scan CSV free</a><a class="btn" href="https://buy.stripe.com/fZu3cuftN1c7gVjekzgbm0v">Add human QA · $249</a></div>
          </article>
          <article class="card product-card">
            <span class="num">FREE → $295 optional</span><h3>Proposal / RFP Readiness</h3>
            <div class="typebar"><span class="type">instant assessment</span><span class="type">red-team upgrade</span></div>
            <p>Run the free Proposal/RFP Readiness assessment first; buy a QuickScan only when the actual solicitation and response need evidence-based review.</p>
            <details class="what" open><summary>Free self-service output</summary><ul><li>readiness score</li><li>compliance / evidence / schedule gaps</li><li>priority findings</li><li>30-day action plan</li><li>PDF-ready report</li></ul></details>
            <details class="what"><summary>Paid QuickScan adds</summary><ul><li>review of one actual solicitation</li><li>review of one near-final response</li><li>mandatory requirement gaps</li><li>evidence and evaluator-risk flags</li><li>priority corrections</li></ul></details>
            <div class="actions"><a class="btn btn-accent" href="/instant-assessment.html">Assess free now</a><a class="btn" href="https://buy.stripe.com/aFa6oGepJbQLdJ76S7gbm0w">Add human QuickScan · $295</a></div>
          </article>
        </div>
      </div>`;
    managed.insertAdjacentElement('beforebegin',section);
    const catalog=document.querySelector('.catalog-nav');
    if(catalog&&!catalog.querySelector('a[href="#quick-services"]')){
      const a=document.createElement('a');a.href='#quick-services';a.textContent='Self-service + QA';catalog.appendChild(a);
    }
  }
}

if(window.location.pathname.endsWith('/self-service.html')||window.location.pathname==='/self-service'){
  const heroGrid=document.querySelector('.page-hero .lab-grid');
  if(heroGrid&&!heroGrid.querySelector('a[href="/roi-calculator.html"]')){
    const card=document.createElement('a');
    card.className='card';
    card.href='/roi-calculator.html';
    card.style.textDecoration='none';
    card.innerHTML='<h3>AI / Automation ROI Calculator</h3><p>Estimate annual value, implementation economics, payback, ROI, and conservative/base/upside sensitivity before committing to a pilot.</p><span class="eyebrow">Open calculator →</span>';
    heroGrid.appendChild(card);
  }
}

if(!document.querySelector('script[data-trusta-service-quality]')){
  const serviceQuality=document.createElement('script');
  serviceQuality.src='/assets/service-quality.js?v=20261028a';
  serviceQuality.defer=true;
  serviceQuality.dataset.trustaServiceQuality='true';
  document.head.appendChild(serviceQuality);
}
