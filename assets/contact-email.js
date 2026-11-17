/* Progressive enhancement for public business contact; never claims a message was sent. */
(function () {
  const button = document.getElementById('copy-growth-email');
  const feedback = document.getElementById('copy-growth-feedback');
  if (!button || !feedback) return;
  const address = button.getAttribute('data-copy-address') || '';
  button.addEventListener('click', async function () {
    let copied = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(address);
        copied = true;
      }
    } catch (_err) {
      copied = false;
    }
    if (!copied) {
      const temp = document.createElement('textarea');
      temp.value = address;
      temp.setAttribute('readonly', '');
      temp.style.position = 'fixed';
      temp.style.opacity = '0';
      document.body.appendChild(temp);
      temp.select();
      try { copied = document.execCommand('copy'); } catch (_err) { copied = false; }
      temp.remove();
    }
    feedback.textContent = copied
      ? 'Email address copied. Compose and send your message in your preferred email service.'
      : 'Could not copy automatically. Select and copy: ' + address;
    if (copied && typeof window.gtag === 'function') {
      window.gtag('event', 'contact_email_copy', { source_path: window.location.pathname });
    }
  });
}());
