(() => {
  const path = window.location.pathname;

  const makeBadge = (text) => {
    const span = document.createElement('span');
    span.className = 'trusta-service-badge';
    span.textContent = text;
    return span;
  };

  const ensureStyle = () => {
    if (document.getElementById('trusta-service-quality-style')) return;
    const style = document.createElement('style');
    style.id = 'trusta-service-quality-style';
    style.textContent = `
      .trusta-service-meta{display:flex;flex-wrap:wrap;gap:7px;margin:10px 0 14px}
      .trusta-service-badge{display:inline-flex;align-items:center;border:1px solid rgba(111,231,207,.28);border-radius:999px;padding:5px 9px;color:#7be7d3;font-size:.72rem;font-weight:850;letter-spacing:.035em}
      .trusta-service-standard{margin:18px 0 24px;padding:16px 18px;border:1px solid rgba(111,231,207,.18);border-radius:16px;background:rgba(111,231,207,.035)}
      .trusta-service-standard strong{display:block;margin-bottom:4px;color:#e6f3f0}
      .trusta-service-standard p{margin:0;color:#9fb3b7;font-size:.9rem}
    `;
    document.head.appendChild(style);
  };

  const addMeta = (card, items) => {
    if (!card || card.querySelector('.trusta-service-meta')) return;
    const meta = document.createElement('div');
    meta.className = 'trusta-service-meta';
    items.forEach(item => meta.appendChild(makeBadge(item)));
    const heading = card.querySelector('h3');
    if (heading) heading.insertAdjacentElement('afterend', meta);
  };

  const cardsByTitle = () => Array.from(document.querySelectorAll('.card')).map(card => ({
    card,
    title: (card.querySelector('h3')?.textContent || '').trim(),
  }));

  ensureStyle();

  if (path.endsWith('/store.html') || path === '/store') {
    const digitalIntro = Array.from(document.querySelectorAll('#digital p')).find(p => p.textContent.includes('editable Markdown workbooks'));
    if (digitalIntro) {
      digitalIntro.textContent = 'Each purchase includes an editable source workbook plus a polished browser-ready edition with Print / Save PDF. Payment redirects to Trusta Secure Delivery and no consulting intake is required.';
    }

    const standards = {
      'Proposal / RFP Pursuit Workbook v2': ['instant secure delivery', 'editable + polished/PDF-ready'],
      'AI Policy & Prompt Workbook v2': ['instant secure delivery', 'editable + polished/PDF-ready'],
      'Sales & CRM AI Operating Workbook v2': ['instant secure delivery', 'editable + polished/PDF-ready'],
      'Practical AI for Teams': ['scheduled live delivery', 'certificate eligible'],
      'AI Implementation Lab': ['scheduled live delivery', 'certificate eligible'],
      'Spreadsheet & Data Rescue': ['managed + human QA', 'target 3–5 business days'],
      'AI Workflow QA & Reliability Review': ['managed + human QA', 'target 3–5 business days'],
      'Executive Decision Memo': ['managed + human QA', 'target 3–5 business days'],
      'Proposal / RFP Red-Team Review': ['managed + human QA', 'target 3–5 business days'],
      'Decision Snapshot': ['self-service first', 'human QA target 2 business days'],
      'Spreadsheet / CSV QuickScan': ['self-service first', 'human QA target 2 business days'],
      'Proposal / RFP Readiness': ['self-service first', 'human QA target 2 business days'],
    };
    cardsByTitle().forEach(({card,title}) => { if (standards[title]) addMeta(card, standards[title]); });

    const managed = document.querySelector('#managed .container');
    if (managed && !managed.querySelector('.trusta-service-standard')) {
      const note = document.createElement('div');
      note.className = 'trusta-service-standard';
      note.innerHTML = '<strong>Managed-service timing standard</strong><p>Standard target timing begins after payment, complete intake, and usable source evidence are received. Typical fixed-scope reviews target 3–5 business days. If evidence is incomplete or the requested scope falls outside the published boundary, Trusta will flag the dependency rather than silently expanding the engagement.</p>';
      const heading = managed.querySelector('.section-head');
      if (heading) heading.insertAdjacentElement('afterend', note);
    }
  }

  if (path.endsWith('/assessments.html') || path === '/assessments') {
    const standardTitles = [
      'Data Quality & Decision Readiness Audit',
      'AI & Automation ROI Assessment',
      'Process & Workflow Audit',
      'KPI & Decision System Assessment',
      'Technology Stack Rationalization',
      'Operational Risk & Control Gaps',
      'Cost-Savings Opportunity Scan',
      'Vendor & Contract Savings Review',
      'Capacity & Bottleneck Assessment',
    ];
    cardsByTitle().forEach(({card,title}) => {
      if (standardTitles.includes(title)) addMeta(card, ['fixed scope', 'secure intake + upload', 'human QA', 'target 3–5 business days']);
    });
    const managed = document.querySelector('#managed .container');
    if (managed && !managed.querySelector('.trusta-service-standard')) {
      const note = document.createElement('div');
      note.className = 'trusta-service-standard';
      note.innerHTML = '<strong>What “3–5 business days” means</strong><p>The target begins when the secure intake is complete and the evidence required for the published scope is usable. Trusta does not count waiting-on-customer time as analysis time. Complex, regulated, multi-site, engineering-stamped, or materially broader work is routed to a custom scope before additional work is performed.</p>';
      const heading = managed.querySelector('.section-head');
      if (heading) heading.insertAdjacentElement('afterend', note);
    }
  }

  if (path.endsWith('/business-ai.html') || path === '/business-ai') {
    const standards = {
      'AI Workflow QA & Reliability Review': ['one workflow', 'managed + human QA', 'target 3–5 business days'],
      'AI & Automation ROI Assessment': ['fixed-scope assessment', 'target 3–5 business days'],
      'Operations Automation Blueprint': ['managed implementation design', 'scope-bound delivery'],
      'Practical AI for Teams': ['90 min + Q&A', 'up to 12 participants', 'certificate eligible'],
      'AI Implementation Lab': ['120 min', 'up to 8 participants', 'certificate eligible'],
    };
    cardsByTitle().forEach(({card,title}) => { if (standards[title]) addMeta(card, standards[title]); });
  }
})();
