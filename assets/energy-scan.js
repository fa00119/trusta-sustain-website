(() => {
  const form = document.getElementById('bill-scan');
  const report = document.getElementById('scan-report');
  const summary = document.getElementById('scan-summary');
  const metrics = document.getElementById('scan-metrics');
  const changes = document.getElementById('scan-changes');
  const error = document.getElementById('scan-error');
  const fields = ['days', 'usage', 'total', 'energy', 'demand', 'output'];
  const coldStorageExample = {
    earlier: [30, 120000, 18000, 12000, 4500, 1000],
    recent: [30, 114000, 18900, 11970, 5400, 900]
  };
  const factoryExample = {
    earlier: [30, 90000, 12500, 8100, 3300, 50000],
    recent: [32, 96000, 14000, 9120, 3700, 48000]
  };
  const utilities = {
    electricity: { name: 'Electricity', units: ['kWh'], charge: 'Demand charges', check: 'Review billed kW and demand windows.' },
    gas: { name: 'Natural gas', units: ['therms', 'CCF', 'MCF', 'MMBtu', 'm³'], charge: 'Fixed service charges', check: 'Review customer and meter fees. Include volumetric delivery charges with usage-based charges if itemized there.' },
    water: { name: 'Water', units: ['gallons', 'thousand gallons', 'CCF', 'm³'], charge: 'Fixed service charges', check: 'Review fixed meter and service fees. Sewer charges left in the total appear in other net charges.' }
  };
  const utilityInput = form.elements.namedItem('utility');
  const consumptionUnit = form.elements.namedItem('consumption-unit');
  const currentUtility = () => utilities[utilityInput?.value ?? 'electricity'];
  const currentUnit = () => consumptionUnit?.value ?? 'kWh';
  const additionalSamples = {
    gas: { earlier: [30, 2400, 3100, 2850, 100, 50000], recent: [32, 2600, 3500, 3250, 100, 48000] },
    water: { earlier: [30, 95, 1480, 1000, 125, 50000], recent: [32, 104, 1670, 1160, 125, 48000] }
  };

  function syncUnits() {
    const previous = currentUnit();
    const units = currentUtility().units;
    consumptionUnit.replaceChildren(...units.map(unit => new Option(unit, unit)));
    if (units.includes(previous)) consumptionUnit.value = previous;
    syncLabels();
  }

  function syncLabels() {
    for (const label of form.querySelectorAll('[data-usage-label]')) label.textContent = currentUtility().name + ' use (' + currentUnit() + ')';
    for (const label of form.querySelectorAll('[data-charge-label]')) label.textContent = currentUtility().charge + ' ($) (optional)';
  }

  const unitLabels = {
    tons: 'ton',
    pounds: 'pound',
    units: 'unit produced',
    orders: 'order shipped',
    visits: 'customer visit',
    'room nights': 'occupied room night',
    'operating hours': 'operating hour'
  };
  const unitInput = form.elements.namedItem('activity-unit');
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
  const rate = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 4 });
  let sampleLoaded = false;

  const inputFor = (period, field) => form.elements.namedItem(period + '-' + field);
  const readPeriod = period => Object.fromEntries(fields.map(field => {
    const input = inputFor(period, field);
    return [field, input.value === '' ? null : input.valueAsNumber];
  }));
  const signed = (value, formatter) => (value > 0 ? '+' : '') + formatter.format(value);

  function addMetric(label, earlier, recent, formatter = number) {
    const row = metrics.insertRow();
    const heading = document.createElement('th');
    heading.scope = 'row';
    heading.textContent = label;
    row.append(heading);
    row.insertCell().textContent = formatter.format(earlier);
    row.insertCell().textContent = formatter.format(recent);
    row.insertCell().textContent = signed(recent - earlier, formatter);
  }

  function addFinding(text) {
    const item = document.createElement('li');
    item.textContent = text;
    changes.append(item);
  }

  function renderReport(earlier, recent) {
    const utility = currentUtility();
    const usageUnit = currentUnit();
    const delta = recent.total - earlier.total;
    const percent = earlier.total > 0 ? ' (' + signed(delta / earlier.total * 100, number) + '%)' : '';
    summary.textContent = (sampleLoaded ? 'Illustrative sample. ' : '') +
      'Total ' + utility.name.toLowerCase() + ' bill change: ' + signed(delta, money) + percent + '.';
    metrics.replaceChildren();
    changes.replaceChildren();

    addMetric('Billing days', earlier.days, recent.days);
    addMetric('Total bill', earlier.total, recent.total, money);
    addMetric(utility.name + ' use (' + usageUnit + ')', earlier.usage, recent.usage);
    addMetric(utility.name + ' use per day (' + usageUnit + ')', earlier.usage / earlier.days, recent.usage / recent.days);
    addMetric('Bill cost per day', earlier.total / earlier.days, recent.total / recent.days, money);

    const hasEnergy = earlier.energy !== null && recent.energy !== null;
    const hasDemand = earlier.demand !== null && recent.demand !== null;
    if (hasEnergy) {
      addMetric('Usage-based charges', earlier.energy, recent.energy, money);
      addFinding('Usage-based charges changed by ' + signed(recent.energy - earlier.energy, money) + '.');
      if (earlier.usage > 0 && recent.usage > 0) {
        addMetric('Effective usage charge per ' + usageUnit, earlier.energy / earlier.usage, recent.energy / recent.usage, rate);
        addFinding('Check the rate schedule, usage tiers, and applicable adjustments before attributing a change in the effective usage charge.');
      }
    }
    if (hasDemand) {
      addMetric(utility.charge, earlier.demand, recent.demand, money);
      addFinding(utility.charge + ' changed by ' + signed(recent.demand - earlier.demand, money) + '. ' + utility.check);
    }
    if (hasEnergy && hasDemand) {
      const other = period => Math.round((period.total - period.energy - period.demand) * 100) / 100;
      addMetric('Other net charges', other(earlier), other(recent), money);
      addFinding('The remaining change was ' + signed(other(recent) - other(earlier), money) + ' in other net charges, which can include fixed fees, taxes, adjustments, and credits.');
    } else {
      addFinding('Enter usage-based charges and ' + utility.charge.toLowerCase() + ' from both bills to reconcile the full change.');
    }
    if (earlier.output > 0 && recent.output > 0) {
      addMetric('Activity (' + unitInput.selectedOptions[0].textContent.toLowerCase() + ')', earlier.output, recent.output);
      addMetric(utility.name + ' cost per ' + unitLabels[unitInput.value], earlier.total / earlier.output, recent.total / recent.output, rate);
      addMetric(utility.name + ' use per ' + unitLabels[unitInput.value] + ' (' + usageUnit + ')', earlier.usage / earlier.output, recent.usage / recent.output);
    }
    if (earlier.days !== recent.days) {
      addFinding('The billing periods differ in length. Use the daily comparisons alongside the bill totals.');
    }
    report.hidden = false;
    document.getElementById('report-title').focus();
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const invalid = [...form.querySelectorAll('input')].find(input => !input.validity.valid);
    error.hidden = !invalid;
    if (invalid) {
      report.hidden = true;
      error.textContent = invalid.closest('fieldset').querySelector('legend').textContent +
        ' · ' + invalid.parentElement.textContent.trim() + ': ' + invalid.validationMessage;
      invalid.focus();
      return;
    }
    renderReport(readPeriod('earlier'), readPeriod('recent'));
    window.trackTrustaEvent?.('energy_scan_completed', { mode: sampleLoaded ? 'sample' : 'manual' });
  });

  form.addEventListener('input', () => {
    sampleLoaded = false;
    report.hidden = true;
    error.hidden = true;
  });
  utilityInput?.addEventListener('change', () => {
    for (const period of ['earlier', 'recent']) for (const key of ['usage', 'total', 'energy', 'demand']) inputFor(period, key).value = '';
    syncUnits();
  });
  consumptionUnit?.addEventListener('change', () => {
    for (const period of ['earlier', 'recent']) inputFor(period, 'usage').value = '';
    syncLabels();
  });
  form.addEventListener('reset', () => {
    if (utilityInput) queueMicrotask(syncUnits);
    sampleLoaded = false;
    report.hidden = true;
    error.hidden = true;
  });

  document.getElementById('load-example').addEventListener('click', () => {
    const factory = form.dataset.sample === 'factory';
    const utility = utilityInput?.value ?? 'electricity';
    const example = additionalSamples[utility] ?? (factory ? factoryExample : coldStorageExample);
    if (consumptionUnit) {
      consumptionUnit.value = utility === 'water' ? 'thousand gallons' : currentUtility().units[0];
      syncLabels();
    }
    unitInput.value = factory ? 'units' : 'tons';
    for (const [period, values] of Object.entries(example)) {
      fields.forEach((field, index) => { inputFor(period, field).value = values[index]; });
    }
    sampleLoaded = true;
    form.requestSubmit();
  });

  document.getElementById('scan-paid-cta').addEventListener('click', () => {
    window.trackTrustaEvent?.('energy_scan_paid_analysis_click');
  });
  document.getElementById('scan-print').addEventListener('click', () => window.print());
})();
