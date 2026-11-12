(() => {
  const get = id => document.getElementById(id);
  const form = get('portfolio-form');
  const field = name => form.elements.namedItem(name);
  const month = get('portfolio-month');
  const site = get('portfolio-site');
  const feedback = get('portfolio-feedback');
  const labels = { pending: 'Awaiting evidence', approved: 'Approved', measured: 'Outcome recorded' };
  const dollars = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const validMonth = value => typeof value === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
  const demoMonth = '2026-10';
  const demo = [
    { month: demoMonth, site: 'Illustrative Site A', decision: 'Cooling controls', status: 'measured', forecast: 2400, measured: 1680, next: 'Confirm persistence in next month’s meter data.' },
    { month: demoMonth, site: 'Illustrative Site B', decision: 'Metering retrofit', status: 'approved', forecast: 950, measured: null, next: 'Confirm commissioning date and data owner.' },
    { month: demoMonth, site: 'Illustrative Site B', decision: 'Shift scheduling', status: 'pending', forecast: 600, measured: null, next: 'Obtain production volumes by shift.' }
  ];
  let records = [];
  let editing = null;

  function cell(tag, content) {
    const element = document.createElement(tag);
    element.textContent = content;
    return element;
  }

  function render() {
    const all = records.filter(record => record.month === month.value);
    const sites = [...new Set(all.map(record => record.site))].sort();
    const selected = sites.includes(site.value) ? site.value : '';
    site.replaceChildren(new Option('All sites', ''), ...sites.map(name => new Option(name, name)));
    site.value = selected;
    const visible = all.filter(record => !selected || record.site === selected);
    const outcomes = visible.filter(record => record.status === 'measured');
    const sum = (group, key) => group.reduce((total, record) => total + record[key], 0);
    const metrics = [
      ['Forecast · approved and recorded', dollars.format(sum(visible.filter(record => record.status !== 'pending'), 'forecast'))],
      ['Measured · recorded outcomes', outcomes.length ? dollars.format(sum(outcomes, 'measured')) : '—'],
      ['Forecast · same recorded outcomes', outcomes.length ? dollars.format(sum(outcomes, 'forecast')) : '—']
    ];
    get('portfolio-metrics').replaceChildren(...metrics.map(([label, value]) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.append(cell('span', label), cell('strong', value));
      return card;
    }));
    const rows = get('portfolio-rows');
    rows.replaceChildren();
    if (!visible.length) {
      const empty = rows.insertRow().insertCell();
      empty.colSpan = 6;
      empty.textContent = 'No decisions for this month and site.';
    }
    for (const record of visible) {
      const row = rows.insertRow();
      const heading = cell('th', record.site + ' · ' + record.decision);
      heading.scope = 'row';
      row.append(heading);
      for (const value of [labels[record.status], dollars.format(record.forecast), record.measured === null ? '—' : dollars.format(record.measured), record.next || '—']) {
        row.append(cell('td', value));
      }
      const edit = cell('button', 'Edit');
      edit.type = 'button';
      edit.className = 'btn';
      edit.setAttribute('aria-label', 'Edit ' + record.decision + ' at ' + record.site);
      edit.addEventListener('click', () => {
        editing = record;
        for (const key of ['site', 'decision', 'status', 'forecast', 'measured', 'next']) field(key).value = record[key] ?? '';
        field('comparable').checked = record.status === 'measured';
        syncStatus();
        get('portfolio-form-title').textContent = 'Edit decision for ' + record.month;
        get('portfolio-remove').hidden = false;
        field('site').focus();
      });
      row.insertCell().append(edit);
    }
  }

  function syncStatus() {
    const measured = field('status').value === 'measured';
    field('measured').disabled = field('comparable').disabled = !measured;
    field('measured').required = field('comparable').required = measured;
    get('portfolio-basis-label').hidden = !measured;
  }

  function clearEditor() {
    editing = null;
    get('portfolio-form-title').textContent = 'Add a decision for this month';
    get('portfolio-remove').hidden = true;
  }

  form.addEventListener('reset', () => {
    clearEditor();
    queueMicrotask(syncStatus);
  });
  field('status').addEventListener('change', syncStatus);
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!month.reportValidity()) return;
    const status = field('status').value;
    const record = {
      month: month.value,
      site: field('site').value.trim(),
      decision: field('decision').value.trim(),
      status,
      forecast: field('forecast').valueAsNumber,
      measured: status === 'measured' ? field('measured').valueAsNumber : null,
      next: field('next').value.trim()
    };
    if (!record.site || !record.decision) {
      feedback.textContent = 'Enter a site and decision name.';
      return;
    }
    if (records.some(item => item !== editing && item.month === record.month && item.site.toLowerCase() === record.site.toLowerCase() && item.decision.toLowerCase() === record.decision.toLowerCase())) {
      feedback.textContent = 'This decision already exists for the selected site and month. Edit the existing record.';
      return;
    }
    if (editing) records[records.indexOf(editing)] = record;
    else records.push(record);
    form.reset();
    feedback.textContent = 'Decision saved in this tab.';
    render();
  });
  get('portfolio-remove').addEventListener('click', () => {
    records = records.filter(record => record !== editing);
    form.reset();
    feedback.textContent = 'Decision removed from this tab.';
    render();
  });
  month.addEventListener('change', () => { form.reset(); render(); });
  site.addEventListener('change', render);

  get('portfolio-demo').addEventListener('click', () => {
    const key = record => [record.month, record.site.toLowerCase(), record.decision.toLowerCase()].join('\u0000');
    const existing = new Set(records.map(key));
    records.push(...demo.filter(record => !existing.has(key(record))).map(record => ({ ...record })));
    month.value = demoMonth;
    form.reset();
    feedback.textContent = 'Illustrative records loaded. These are sample projects.';
    render();
  });
  get('portfolio-export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ version: 1, records }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'trusta-decision-portfolio.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  function validRecord(record) {
    const fits = (value, max) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
    const amount = value => Number.isFinite(value) && Math.abs(value) <= 1000000000;
    return record && validMonth(record.month) && fits(record.site, 80) && fits(record.decision, 140) &&
      Object.hasOwn(labels, record.status) && amount(record.forecast) && record.forecast >= 0 &&
      (record.status === 'measured' ? amount(record.measured) : record.measured === null) &&
      typeof record.next === 'string' && record.next.length <= 200;
  }

  get('portfolio-import').addEventListener('change', async event => {
    const input = event.target;
    const file = input.files[0];
    input.value = '';
    if (!file) return;
    try {
      if (file.size > 2000000) throw Error('File too large.');
      const saved = JSON.parse(await file.text());
      if (saved.version !== 1 || !Array.isArray(saved.records) || !saved.records.every(validRecord)) throw Error('Invalid format.');
      const key = record => JSON.stringify([record.month, record.site.trim().toLowerCase(), record.decision.trim().toLowerCase()]);
      const merged = new Map(records.map(record => [key(record), record]));
      for (const record of saved.records) if (!merged.has(key(record))) merged.set(key(record), record);
      records = [...merged.values()];
      if (saved.records.length) month.value = saved.records.map(record => record.month).sort().at(-1);
      form.reset();
      feedback.textContent = 'Saved records opened. Existing records with the same month, site and decision were kept.';
      render();
    } catch {
      feedback.textContent = 'Could not open this file. Choose a valid Trusta portfolio JSON file under 2 MB.';
    }
  });
  get('portfolio-print').addEventListener('click', () => window.print());
  const today = new Date();
  month.value = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
  render();
})();
