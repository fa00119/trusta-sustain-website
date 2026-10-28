(() => {
  const origin = 'https://trusta-sustain.com';

  // GA4 is initialized once by assets/site.js. This shared layer only emits events.
  const track = (name, params={}) => {
    try { if (typeof window.gtag === 'function') window.gtag('event', name, params); } catch (_) {}
  };

  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    const text = (link.textContent || '').trim().slice(0,120);
    if (href.includes('buy.stripe.com') || href.includes('book.stripe.com')) {
      track('begin_checkout', { link_url: href, link_text: text, page_path: location.pathname });
    } else if (href.startsWith('/self-service') || href.startsWith('/instant-assessment') || href.startsWith('/roi-calculator') || href.startsWith('/infrastructure-assessment') || href.startsWith('/value-opportunity-prioritizer')) {
      track('self_service_start', { destination: href, link_text: text, page_path: location.pathname });
    } else if (href.startsWith('mailto:growth@')) {
      track('enterprise_contact_intent', { link_text: text, page_path: location.pathname });
    } else if (href.includes('app.trusta-sustain.com')) {
      track('app_open', { link_url: href, link_text: text, page_path: location.pathname });
    }
  }, { capture: true });

  // Entity disambiguation for search engines and AI systems. Keep the legal entity name explicit.
  if (!document.querySelector('script[data-trusta-org-schema]')) {
    const schema = document.createElement('script');
    schema.type = 'application/ld+json';
    schema.dataset.trustaOrgSchema = 'true';
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${origin}/#organization`,
          name: 'Trusta Sustain Corporation',
          legalName: 'Trusta Sustain Corporation',
          alternateName: ['Trusta Sustain', 'TrustaSustain'],
          url: `${origin}/`,
          foundingDate: '2023',
          email: 'growth@trusta-sustain.com',
          description: 'U.S.-based AI, engineering, decision-intelligence, technical-services, products, and applied R&D company.',
          areaServed: { '@type': 'Country', name: 'United States' },
          knowsAbout: [
            'Artificial intelligence',
            'Decision intelligence',
            'Workflow automation',
            'Infrastructure optimization',
            'Data center energy and cooling',
            'Water and wastewater engineering',
            'Environmental engineering',
            'Evidence intelligence',
            'Value realization',
            'Applied research and development'
          ]
        },
        {
          '@type': 'WebSite',
          '@id': `${origin}/#website`,
          url: `${origin}/`,
          name: 'Trusta Sustain Corporation',
          publisher: { '@id': `${origin}/#organization` },
          inLanguage: 'en-US'
        }
      ]
    });
    document.head.appendChild(schema);
  }

  if (!document.querySelector('meta[name="application-name"]')) {
    const appName = document.createElement('meta');
    appName.name = 'application-name';
    appName.content = 'Trusta Sustain Corporation';
    document.head.appendChild(appName);
  }

  const path = window.location.pathname;

  if (path.endsWith('/self-service.html') || path === '/self-service') {
    const grid = document.querySelector('.page-hero .lab-grid');
    const addToolCard = (href, title, copy, eyebrow) => {
      if (!grid || grid.querySelector(`a[href="${href}"]`)) return;
      const card = document.createElement('a');
      card.className = 'card';
      card.href = href;
      card.style.textDecoration = 'none';
      card.innerHTML = `<h3>${title}</h3><p>${copy}</p><span class="eyebrow">${eyebrow} →</span>`;
      grid.appendChild(card);
    };
    addToolCard('/infrastructure-assessment.html','ORBIT Infrastructure Readiness','Score system mapping, capacity evidence, dependencies, operating data, economics, resilience, and decision controls before paying for deeper analysis.','Run screening');
    addToolCard('/value-opportunity-prioritizer.html','YIELD Value Opportunity Prioritizer','Compare modeled benefit, implementation cost, payback, difficulty, risk, and evidence confidence while keeping forecast value distinct from realized value.','Prioritize opportunities');
    return;
  }

  // ORBIT should offer a no-login screening before asking for a paid diagnostic or enterprise scope.
  if (path.endsWith('/orbit.html') || path === '/orbit') {
    const heroActions = document.querySelector('.page-hero .actions');
    if (heroActions && !heroActions.querySelector('a[href="/infrastructure-assessment.html"]')) {
      heroActions.innerHTML = '<a class="btn btn-accent" href="/infrastructure-assessment.html">Run free infrastructure screening</a><a class="btn" href="#commercial">Commercial paths</a>';
    }
    const commercial = document.querySelector('#commercial .container');
    if (commercial && !commercial.querySelector('[data-orbit-screening]')) {
      const screening = document.createElement('div');
      screening.className = 'card';
      screening.dataset.orbitScreening = 'true';
      screening.style.marginTop = '18px';
      screening.innerHTML = '<span class="eyebrow">Self-service first</span><h3>Infrastructure Decision Readiness Screening</h3><p>Before paying for a diagnostic, score system mapping, capacity evidence, dependencies, operating data, economics, resilience and decision controls. Get an instant readiness score, evidence gaps and recommended next step.</p><div class="actions"><a class="btn btn-accent" href="/infrastructure-assessment.html">Run free · 5–8 min</a></div>';
      commercial.appendChild(screening);
    }
    return;
  }

  // YIELD should demonstrate value-state discipline before asking for a portfolio diagnostic.
  if (path.endsWith('/yield.html') || path === '/yield') {
    const heroActions = document.querySelector('.page-hero .actions');
    if (heroActions && !heroActions.querySelector('a[href="/value-opportunity-prioritizer.html"]')) {
      heroActions.innerHTML = '<a class="btn btn-accent" href="/value-opportunity-prioritizer.html">Prioritize opportunities free</a><a class="btn" href="#lifecycle">Value lifecycle</a>';
    }
    const commercialHeading = Array.from(document.querySelectorAll('section')).find(section => section.querySelector('h2')?.textContent.includes('From improvement portfolio'));
    const commercial = commercialHeading?.querySelector('.container');
    if (commercial && !commercial.querySelector('[data-yield-prioritizer]')) {
      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.yieldPrioritizer = 'true';
      card.style.marginTop = '18px';
      card.innerHTML = '<span class="eyebrow">Self-service first</span><h3>Value Opportunity Prioritizer</h3><p>Compare up to five opportunities by modeled annual benefit, implementation cost, payback, difficulty, operational risk and evidence confidence. Modeled opportunity value remains explicitly separate from verified realized value.</p><div class="actions"><a class="btn btn-accent" href="/value-opportunity-prioritizer.html">Prioritize free now</a></div>';
      commercial.appendChild(card);
    }
    return;
  }

  if (path !== '/' && !path.endsWith('/index.html')) return;

  const productCards = Array.from(document.querySelectorAll('.compact-section .card'));
  const infrastructure = productCards.find(card => card.querySelector('h3')?.textContent.trim() === 'Infrastructure Intelligence');
  if (infrastructure) {
    infrastructure.href = '/orbit.html';
    const heading = infrastructure.querySelector('h3');
    const copy = infrastructure.querySelector('p');
    if (heading) heading.textContent = 'Trusta ORBIT';
    if (copy) copy.textContent = 'Infrastructure decision intelligence across energy, cooling, water, utilities, capacity, cost, resilience, scenarios, and ROI.';

    const productGrid = infrastructure.parentElement;
    if (productGrid && !Array.from(productGrid.querySelectorAll('h3')).some(h => h.textContent.trim() === 'Trusta YIELD')) {
      const yieldCard = document.createElement('a');
      yieldCard.className = 'card';
      yieldCard.href = '/yield.html';
      yieldCard.innerHTML = '<span class="num">04</span><h3>Trusta YIELD</h3><p>Value-realization intelligence that converts selected opportunities into governed initiatives and keeps forecast, implemented, and verified realized value distinct.</p>';
      productGrid.appendChild(yieldCard);
    }
  }

  const railInfrastructure = Array.from(document.querySelectorAll('.solution-rail .solution-chip')).find(card => card.textContent.includes('INFRASTRUCTURE'));
  if (railInfrastructure) {
    railInfrastructure.href = '/orbit.html';
    const label = railInfrastructure.querySelector('span:nth-of-type(2)');
    if (label) label.innerHTML = 'ORBIT<br>INFRASTRUCTURE';
  }

  const quickStartSection = Array.from(document.querySelectorAll('section')).find(section => section.querySelector('h2')?.textContent.includes('You do not need a large program'));
  if (quickStartSection) {
    const actions = quickStartSection.querySelector('.actions');
    if (actions) actions.innerHTML = '<a class="btn btn-accent" href="/self-service.html">Start self-service →</a><a class="btn" href="/store.html">Shop ready-to-buy services →</a>';
  }

  const finalCta = Array.from(document.querySelectorAll('.cta')).find(cta => cta.querySelector('h2')?.textContent.includes('Need a quick technical answer'));
  if (finalCta) {
    const text = finalCta.querySelector('.muted');
    const actions = finalCta.querySelector('.actions');
    if (text) text.textContent = 'Start with a self-service tool, fixed-scope product, or secure standard service. Enterprise scoping is reserved for genuinely bespoke, regulated, multi-site, or integration-heavy work.';
    if (actions) actions.innerHTML = '<a class="btn btn-accent" href="/self-service.html">Start self-service</a><a class="btn" href="/store.html">Browse Store</a>';
  }

  document.querySelectorAll('a.card h3').forEach(heading => {
    if (heading.textContent.trim() === 'Energy & Infrastructure Intelligence') {
      const card = heading.closest('a');
      if (card) card.href = '/orbit.html';
      heading.textContent = 'ORBIT & Infrastructure Intelligence';
    }
  });
})();
