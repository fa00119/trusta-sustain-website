const GA4_MEASUREMENT_ID='G-8GD2215R3Y';
const analyticsPreferenceKey='trusta.analytics.v1';
let analyticsPreference;
try { analyticsPreference=localStorage.getItem(analyticsPreferenceKey); } catch (_) {}

function startTrustaAnalytics(){
  if(window.__trustaGa4Initialized)return;
  window.__trustaGa4Initialized=true;
  window.dataLayer=window.dataLayer||[];
  window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
  window.gtag('consent','default',{
    analytics_storage:'denied',ad_storage:'denied',
    ad_user_data:'denied',ad_personalization:'denied'
  });
  window.gtag('consent','update',{analytics_storage:'granted'});
  window.gtag('js',new Date());
  window.gtag('config',GA4_MEASUREMENT_ID,{
    send_page_view:true,
    page_location:location.origin+location.pathname,
    page_referrer:'',
    allow_google_signals:false,
    allow_ad_personalization_signals:false
  });
  const ga=document.createElement('script');
  ga.async=true;
  ga.src=`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_MEASUREMENT_ID)}`;
  ga.dataset.trustaGa4='true';
  document.head.appendChild(ga);
}

if(analyticsPreference==='allow')startTrustaAnalytics();
const analyticsSettings=document.createElement('details');
analyticsSettings.className='container';
analyticsSettings.innerHTML='<summary>Analytics preferences</summary><p>Optional analytics help us understand which pages and links are useful.</p><div class="actions"><button type="button" class="btn" data-choice="allow">Allow analytics</button><button type="button" class="btn" data-choice="deny">Decline analytics</button></div><p role="status"></p>';
const analyticsStatus=analyticsSettings.querySelector('[role="status"]');
const updateAnalyticsStatus=()=>{analyticsStatus.textContent=analyticsPreference==='allow'?'Analytics enabled.':'Analytics off.';};
updateAnalyticsStatus();
(document.querySelector('footer')||document.body).appendChild(analyticsSettings);
analyticsSettings.addEventListener('click',event=>{
  const choice=event.target.closest?.('button[data-choice]')?.dataset.choice;
  if(choice!=='allow'&&choice!=='deny')return;
  analyticsPreference=choice;
  try { localStorage.setItem(analyticsPreferenceKey,choice); } catch (_) {}
  updateAnalyticsStatus();
  if(choice==='allow'){
    window['ga-disable-'+GA4_MEASUREMENT_ID]=false;
    if(window.__trustaGa4Initialized)window.gtag('consent','update',{analytics_storage:'granted'});
    else startTrustaAnalytics();
  }
  else if(window.__trustaGa4Initialized){
    window['ga-disable-'+GA4_MEASUREMENT_ID]=true;
    window.gtag('consent','update',{analytics_storage:'denied'});
    if(localStorageChoiceSaved())location.reload();
  }
});
function localStorageChoiceSaved(){
  try { return localStorage.getItem(analyticsPreferenceKey)==='deny'; } catch (_) { return false; }
}

function trackTrustaEvent(name,params={}){
  if(analyticsPreference==='allow'&&!window['ga-disable-'+GA4_MEASUREMENT_ID]&&typeof window.gtag==='function'){
    window.gtag('event',name,params);
  }
}

// Pages with critical mobile CSS in the HTML head avoid loading it twice.
if(!document.querySelector('link[href^="/assets/mobile.css"]')){
  const responsive=document.createElement('link');
  responsive.rel='stylesheet';
  responsive.href='/assets/mobile.css?v=20261116b';
  document.head.appendChild(responsive);
}

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
  menu.setAttribute('aria-label','Open navigation');
  menu.setAttribute('aria-controls','site-navigation');
  links.id=links.id||'site-navigation';

  const closeMenu=()=>{
    links.classList.remove('open');
    menu.setAttribute('aria-expanded','false');
    menu.setAttribute('aria-label','Open navigation');
    document.body.classList.remove('nav-open');
  };

  menu.addEventListener('click',()=>{
    const isOpen=links.classList.toggle('open');
    menu.setAttribute('aria-expanded',String(isOpen));
    menu.setAttribute('aria-label',isOpen?'Close navigation':'Open navigation');
    document.body.classList.toggle('nav-open',isOpen);
  });

  links.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});
  window.addEventListener('resize',()=>{const cutoff=document.body.classList.contains('home-v2')?1600:900;if(window.innerWidth>cutoff)closeMenu();});
  document.addEventListener('click',event=>{if(!links.classList.contains('open'))return;const target=event.target;if(target instanceof Node&&!links.contains(target)&&!menu.contains(target))closeMenu();});
}

const style=document.createElement('style');
style.textContent=`
.brand{width:250px;height:70px;background:url('/assets/logo-lockup.svg?v=20261018h') left center/contain no-repeat!important;font-size:0!important;display:inline-block!important;flex:none;max-width:38vw}.brand>*{display:none!important}
@media(max-width:900px){.brand{width:184px;height:52px;max-width:64vw}}
@media(max-width:520px){.brand{width:164px;height:46px;max-width:62vw}}
@media(max-width:360px){.brand{width:146px;height:42px}}
`;
document.head.appendChild(style);

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

document.addEventListener('click',event=>{
  const anchor=event.target instanceof Element?event.target.closest('a[href]'):null;
  if(!anchor)return;
  const href=anchor.getAttribute('href')||'';
  const growthEvent=anchor.dataset.growthEvent;
  if(['demo_request_click','contact_click','investor_interest_click'].includes(growthEvent)){
    const product=anchor.dataset.growthProduct;
    const params={source_path:location.pathname, analytics_consent:'granted'};
    if(['orbit','poweros','conform'].includes(product))params.product=product;
    trackTrustaEvent(growthEvent,params);
    return;
  }
  const text=(anchor.textContent||'').trim().slice(0,80);
  if(href.includes('buy.stripe.com')){
    trackTrustaEvent('begin_checkout',{link_text:text,offer_path:window.location.pathname});
    return;
  }
  if(href.includes('/self-service.html')||href.includes('/instant-assessment.html')||href.includes('/roi-calculator.html')){
    trackTrustaEvent('self_service_start',{tool_url:href.split(/[?#]/)[0],source_path:window.location.pathname});
    return;
  }
  // Product demo attribution uses URL category, not visitor-provided data.
  if(href.includes('orbit.trusta-sustain.com/demo/orbit')){
    trackTrustaEvent('product_demo_open',{product:'orbit',source_path:window.location.pathname});
    return;
  }
  if(href.startsWith('https://poweros.trusta-sustain.com/')||href.startsWith('https://trusta-poweros-public-app-production.up.railway.app/')){
    trackTrustaEvent('product_demo_open',{product:'poweros',source_path:window.location.pathname});
    return;
  }
  if(href.startsWith('https://conform.trusta-sustain.com/')||href.startsWith('https://trusta-conform-public-app-production.up.railway.app/')){
    trackTrustaEvent('product_demo_open',{product:'conform',source_path:window.location.pathname});
    return;
  }
  if(href==='/contact.html'||href.startsWith('/contact.html#')||href.startsWith('/contact.html?')){
    trackTrustaEvent('contact_click',{source_path:window.location.pathname,analytics_consent:'granted'});
  }
  if(href.includes('app.trusta-sustain.com')){
    trackTrustaEvent('app_open',{destination:'customer_app',source_path:window.location.pathname});
    return;
  }
  if(href.startsWith('mailto:')){
    trackTrustaEvent('contact_click',{source_path:window.location.pathname,analytics_consent:'granted'});
    // Categorize product-specific inquiry clicks without collecting email contents or PII.
    const subject=(href.split('?')[1]||'').split('&').find(part=>part.toLowerCase().startsWith('subject='))||'';
    let category='other';
    if(/orbit/i.test(subject)) category='orbit';
    else if(/poweros/i.test(subject)) category='poweros';
    else if(/conform/i.test(subject)) category='conform';
    else if(/environmental|engineering/i.test(subject)) category='engineering';
    if(category!=='other')trackTrustaEvent('product_inquiry_intent',{product:category,source_path:window.location.pathname});
  }
});

if(!document.querySelector('script[data-trusta-service-quality]')){
  const serviceQuality=document.createElement('script');
  serviceQuality.src='/assets/service-quality.js?v=20261028a';
  serviceQuality.defer=true;
  serviceQuality.dataset.trustaServiceQuality='true';
  document.head.appendChild(serviceQuality);
}

if(!document.querySelector('script[data-trusta-marketing-foundation]')){
  const marketingFoundation=document.createElement('script');
  marketingFoundation.src='/assets/marketing-foundation.js?v=20261125';
  marketingFoundation.defer=true;
  marketingFoundation.dataset.trustaMarketingFoundation='true';
  document.head.appendChild(marketingFoundation);
}


// Avoid broken-image icons if a third-party editorial photo becomes unavailable.
// Preserve the layout, caption and source credit so the page remains usable.
document.querySelectorAll('.trusta-photo-frame img,.trusta-photo-inline img').forEach(img=>{
  const fallback=()=>{
    if(img.dataset.photoFallbackApplied)return;
    img.dataset.photoFallbackApplied='true';
    img.hidden=true;
    img.setAttribute('aria-hidden','true');
    const frame=img.closest('.trusta-photo-frame,.trusta-photo-inline');
    if(frame){frame.classList.add('trusta-photo-unavailable');const notice=document.createElement('span');notice.className='trusta-photo-placeholder';notice.textContent='Infrastructure & engineering';frame.insertBefore(notice,frame.firstChild);}
  };
  img.addEventListener('error',fallback,{once:true});
  if(img.complete&&img.naturalWidth===0)fallback();
});
