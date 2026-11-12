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
    const delta = recent.total - earlier.total;
    const percent = earlier.total > 0 ? ' (' + signed(delta / earlier.total * 100, number) + '%)' : '';
    summary.textContent = (sampleLoaded ? 'Illustrative sample. ' : '') +
      'Total electricity bill change: ' + signed(delta, money) + percent + '.';
    metrics.replaceChildren();
    changes.replaceChildren();

    addMetric('Billing days', earlier.days, recent.days);
    addMetric('Total bill', earlier.total, recent.total, money);
    addMetric('Electricity use (kWh)', earlier.usage, recent.usage);
    addMetric('Electricity use per day (kWh)', earlier.usage / earlier.days, recent.usage / recent.days);
    addMetric('Bill cost per day', earlier.total / earlier.days, recent.total / recent.days, money);

    const hasEnergy = earlier.energy !== null && recent.energy !== null;
    const hasDemand = earlier.demand !== null && recent.demand !== null;
    if (hasEnergy) {
      addMetric('Usage-based charges', earlier.energy, recent.energy, money);
      addFinding('Usage-based charges changed by ' + signed(recent.energy - earlier.energy, money) + '.');
      if (earlier.usage > 0 && recent.usage > 0) {
        addMetric('Effective usage charge per kWh', earlier.energy / earlier.usage, recent.energy / recent.usage, rate);
        addFinding('The effective usage charge per kWh can change with the tariff, time-of-use mix, or both. Check the rate schedule before attributing the change.');
      }
    }
    if (hasDemand) {
      addMetric('Demand charges', earlier.demand, recent.demand, money);
      addFinding('Billed demand charges changed by ' + signed(recent.demand - earlier.demand, money) + '. Review billed kW and demand windows to investigate.');
    }
    if (hasEnergy && hasDemand) {
      const other = period => Math.round((period.total - period.energy - period.demand) * 100) / 100;
      addMetric('Other net charges', other(earlier), other(recent), money);
      addFinding('The remaining change was ' + signed(other(recent) - other(earlier), money) + ' in other net charges, which can include fixed fees, taxes, adjustments, and credits.');
    } else {
      addFinding('Enter the usage-based and demand charge amounts from both bills to reconcile the full bill change.');
    }
    if (earlier.output > 0 && recent.output > 0) {
      addMetric('Activity (' + unitInput.selectedOptions[0].textContent.toLowerCase() + ')', earlier.output, recent.output);
      addMetric('Electricity cost per ' + unitLabels[unitInput.value], earlier.total / earlier.output, recent.total / recent.output, rate);
      addMetric('Electricity use per ' + unitLabels[unitInput.value] + ' (kWh)', earlier.usage / earlier.output, recent.usage / recent.output);
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
        ' · ' + invalid.parentElement.firstChild.textContent + ': ' + invalid.validationMessage;
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
  form.addEventListener('reset', () => {
    sampleLoaded = false;
    report.hidden = true;
    error.hidden = true;
  });

  document.getElementById('load-example').addEventListener('click', () => {
    const factory = form.dataset.sample === 'factory';
    const example = factory ? factoryExample : coldStorageExample;
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
