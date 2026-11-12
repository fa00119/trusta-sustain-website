(() => {
  const form = document.getElementById('decision-review');
  const report = document.getElementById('decision-report');
  const title = document.getElementById('decision-title');
  const question = document.getElementById('decision-question');
  const evidenceList = document.getElementById('decision-evidence');
  const outcome = document.getElementById('decision-outcome');
  const evidence = [...form.querySelectorAll('[name="evidence"]')];
  const field = name => form.elements.namedItem(name);

  function describeOutcome() {
    const forecast = field('predicted').valueAsNumber;
    const actual = field('measured').valueAsNumber;
    const unit = field('outcome-unit').value.trim();
    if (!unit || !Number.isFinite(forecast) || !Number.isFinite(actual) || forecast <= 0) {
      return 'Enter a positive prediction, a measured result, and the shared outcome unit to compare outcomes.';
    }
    if (!field('comparable').checked) {
      return 'Confirm that both values use the same unit, baseline, scope, and period before calculating realization.';
    }
    const realization = actual / forecast;
    if (!Number.isFinite(realization)) return 'The values are outside the supported ratio range.';
    const format = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
    const percent = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });
    return `${format.format(actual)} ${unit} measured versus ${format.format(forecast)} predicted. Realization: ${percent.format(realization)} (based on your entries).`;
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const decision = field('decision').value.trim();
    if (!decision) {
      field('decision').setCustomValidity('Enter a decision or purchase.');
      field('decision').reportValidity();
      return;
    }
    title.textContent = 'Decision brief · ' + decision;
    document.getElementById('decision-context').textContent = field('stage').value;
    question.textContent = field('question').value.trim();
    question.hidden = !question.textContent;
    const covered = evidence.filter(input => input.checked).length;
    document.getElementById('decision-readiness').textContent =
      `${covered} of ${evidence.length} evidence items available for review.`;
    evidenceList.replaceChildren(...evidence.map(input => {
      const item = document.createElement('li');
      item.textContent = (input.checked ? 'Available: ' : 'To gather: ') + input.value;
      return item;
    }));
    outcome.textContent = describeOutcome();
    report.hidden = false;
    title.focus();
    window.trackTrustaEvent?.('decision_brief_generated');
  });
  form.addEventListener('input', () => {
    field('decision').setCustomValidity('');
    report.hidden = true;
  });
  form.addEventListener('reset', () => {
    field('decision').setCustomValidity('');
    report.hidden = true;
  });
  document.getElementById('decision-print').addEventListener('click', () => window.print());
  document.getElementById('decision-request').addEventListener('click', () => {
    window.trackTrustaEvent?.('decision_review_request_click');
  });
})();
