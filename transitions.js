document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href]').forEach(link => {
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname) return;

    link.addEventListener('click', e => {
      e.preventDefault();
      const href = link.href;
      document.body.classList.add('is-leaving');
      setTimeout(() => { location.href = href; }, 250);
    });
  });

  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open navigation');
      });
    });

    document.addEventListener('click', e => {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open navigation');
      }
    });
  }

  const header = document.querySelector('.site-header');
  if (header) {
    let lastY = window.scrollY;
    let scrollStopTimer = null;

    window.addEventListener('scroll', () => {
      const currentY = window.scrollY;
      const navEl = document.querySelector('.nav');

      if (navEl && navEl.classList.contains('is-open')) {
        lastY = currentY;
        return;
      }

      if (currentY > lastY + 5) {
        header.classList.add('is-hidden');
      } else if (currentY < lastY - 5) {
        header.classList.remove('is-hidden');
      }
      lastY = currentY;

      clearTimeout(scrollStopTimer);
      scrollStopTimer = setTimeout(() => {
        header.classList.remove('is-hidden');
      }, 1000);
    }, { passive: true });
  }
});
