(function () {
  const params = new URLSearchParams(window.location.search);
  const returnTo = params.get('returnTo');

  if (returnTo) {
    document.querySelectorAll('[data-return-link]').forEach((link) => {
      link.setAttribute('href', returnTo);
    });
  }

  const revealElements = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    revealElements.forEach((el) => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: '0px 0px -6% 0px'
    }
  );

  revealElements.forEach((el) => observer.observe(el));
})();
