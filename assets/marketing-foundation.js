(() => {
  const origin = 'https://trusta-sustain.com';

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
  if (path !== '/' && !path.endsWith('/index.html')) return;

  // Keep the home page synchronized with the current product architecture.
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

  // Standard offers should route to self-service/store instead of requiring an email.
  const quickStartSection = Array.from(document.querySelectorAll('section')).find(section => section.querySelector('h2')?.textContent.includes('You do not need a large program'));
  if (quickStartSection) {
    const actions = quickStartSection.querySelector('.actions');
    if (actions) {
      actions.innerHTML = '<a class="btn btn-accent" href="/self-service.html">Start self-service →</a><a class="btn" href="/store.html">Shop ready-to-buy services →</a>';
    }
  }

  const finalCta = Array.from(document.querySelectorAll('.cta')).find(cta => cta.querySelector('h2')?.textContent.includes('Need a quick technical answer'));
  if (finalCta) {
    const text = finalCta.querySelector('.muted');
    const actions = finalCta.querySelector('.actions');
    if (text) text.textContent = 'Start with a self-service tool, fixed-scope product, or secure standard service. Enterprise scoping is reserved for genuinely bespoke, regulated, multi-site, or integration-heavy work.';
    if (actions) actions.innerHTML = '<a class="btn btn-accent" href="/self-service.html">Start self-service</a><a class="btn" href="/store.html">Browse Store</a>';
  }

  // Replace generic infrastructure product wording in the visible home page where possible.
  document.querySelectorAll('a.card h3').forEach(heading => {
    if (heading.textContent.trim() === 'Energy & Infrastructure Intelligence') {
      const card = heading.closest('a');
      if (card) card.href = '/orbit.html';
      heading.textContent = 'ORBIT & Infrastructure Intelligence';
    }
  });
})();
