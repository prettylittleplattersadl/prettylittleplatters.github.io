(function () {
  if (sessionStorage.getItem('promoSeen')) return;

  setTimeout(function () {
    var overlay = document.getElementById('promoOverlay');
    if (!overlay) return;
    overlay.classList.add('is-open');
    sessionStorage.setItem('promoSeen', '1');
  }, 1500);

  document.addEventListener('click', function (e) {
    var overlay = document.getElementById('promoOverlay');
    if (!overlay) return;
    if (e.target === overlay || e.target.closest('.promo-popup-close')) {
      overlay.classList.remove('is-open');
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var overlay = document.getElementById('promoOverlay');
      if (overlay) overlay.classList.remove('is-open');
    }
  });
}());
