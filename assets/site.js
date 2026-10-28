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
  addNavLink('/assessments.html','Assessments','/store.html');
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
          <div><span class="eyebrow">Low-cost micro-services · $195–$295</span><h2>Need a small answer, not a $650+ engagement?</h2></div>
          <p class="muted">These are intentionally narrow. Checkout, intake and file upload are online; Trusta analyzes the submitted evidence, performs QA, and returns the result through Secure Delivery. Standard target: within 2 business days after complete intake.</p>
        </div>
        <div class="grid grid-3">
          <article class="card product-card">
            <span class="num">$195</span><h3>Decision Snapshot</h3>
            <div class="typebar"><span class="type">one decision</span><span class="type">managed + QA</span></div>
            <p>For one defined business or technical decision when you need a short, evidence-aware recommendation rather than a full consulting project.</p>
            <details class="what" open><summary>What you submit</summary><ul><li>the decision/question</li><li>context and constraints</li><li>supporting evidence if available</li><li>who will use the answer</li></ul></details>
            <details class="what" open><summary>What you receive</summary><ul><li>decision framing</li><li>facts, assumptions and evidence gaps</li><li>options and tradeoffs</li><li>material risks</li><li>recommended next action</li></ul></details>
            <div class="actions"><a class="btn btn-accent" href="https://buy.stripe.com/4gM00ia9t4oj5cB7Wbgbm0u">Start for $195</a></div>
          </article>
          <article class="card product-card">
            <span class="num">$249</span><h3>Spreadsheet QuickCheck</h3>
            <div class="typebar"><span class="type">1 XLSX/CSV</span><span class="type">≤ 5 MB</span></div>
            <p>A focused quality and decision-readiness review before committing to a full cleanup or analysis engagement.</p>
            <details class="what" open><summary>What is checked</summary><ul><li>obvious data-quality gaps</li><li>formula / logic risk</li><li>duplicates / consistency issues</li><li>decision-readiness and traceability</li></ul></details>
            <details class="what" open><summary>What you receive</summary><ul><li>priority issue register</li><li>risk observations</li><li>recommended fixes</li><li>next-step recommendation: DIY, Rescue, or deeper analysis</li></ul></details>
            <div class="actions"><a class="btn btn-accent" href="https://buy.stripe.com/fZu3cuftN1c7gVjekzgbm0v">Start for $249</a></div>
          </article>
          <article class="card product-card">
            <span class="num">$295</span><h3>RFP Compliance QuickScan</h3>
            <div class="typebar"><span class="type">1 solicitation</span><span class="type">1 near-final response</span></div>
            <p>A narrow compliance/readiness screen before a full red-team review.</p>
            <details class="what" open><summary>What is checked</summary><ul><li>mandatory requirements</li><li>missing or weak evidence</li><li>obvious evaluator-risk flags</li><li>submission-readiness gaps</li></ul></details>
            <details class="what" open><summary>What you receive</summary><ul><li>priority compliance gaps</li><li>evidence-gap list</li><li>priority corrections</li><li>go-to-submit / needs-red-team posture</li></ul></details>
            <div class="actions"><a class="btn btn-accent" href="https://buy.stripe.com/aFa6oGepJbQLdJ76S7gbm0w">Start for $295</a></div>
          </article>
        </div>
      </div>`;
    managed.insertAdjacentElement('beforebegin',section);
    const catalog=document.querySelector('.catalog-nav');
    if(catalog&&!catalog.querySelector('a[href="#quick-services"]')){
      const a=document.createElement('a');a.href='#quick-services';a.textContent='Quick services';catalog.appendChild(a);
    }
  }
}
