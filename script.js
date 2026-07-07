/* ==========================================================================
   script.js — behavior layer only. No inline JS, no frameworks.
   ========================================================================== */

/* Always land on Home on refresh: stop the browser from restoring a
   mid-page scroll position, and reset to top immediately. */
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  initLandingTransition();
  initNavbar();
  initMobileNav();
  initScrollSpy();
  initRevealAnimations();
  initContactForm();
  initMouseGlow();
  initHeroParallax();
  initImageFade();
  document.getElementById('year').textContent = new Date().getFullYear();
  window.scrollTo(0, 0);

  /* ------------------------------------------------------------------
     Landing screen → Hero transition
     ------------------------------------------------------------------ */
  function initLandingTransition() {
    const landing = document.getElementById('landing');
    const cta = document.getElementById('landingCta');
    const navbar = document.getElementById('navbar');
    const hero = document.getElementById('hero');
    const body = document.body;

    body.classList.add('no-scroll');

    function enterSite() {
      landing.classList.add('is-leaving');
      landing.setAttribute('aria-hidden', 'true');

      const heroRevealDelay = prefersReducedMotion ? 0 : 260;
      window.setTimeout(() => {
        hero.classList.add('is-revealed');
      }, heroRevealDelay);

      const revealDelay = prefersReducedMotion ? 0 : 550;
      window.setTimeout(() => {
        navbar.classList.add('is-visible');
        body.classList.remove('no-scroll');
      }, revealDelay);

      const hideDelay = prefersReducedMotion ? 0 : 950;
      window.setTimeout(() => {
        landing.classList.add('is-hidden');
      }, hideDelay);

      cta.removeEventListener('click', enterSite);
    }

    cta.addEventListener('click', enterSite);
    cta.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        enterSite();
      }
    });
  }

  /* ------------------------------------------------------------------
     Navbar: shadow on scroll + smooth scroll for in-page links
     ------------------------------------------------------------------ */
  function initNavbar() {
    const navbar = document.getElementById('navbar');

    const onScroll = () => {
      navbar.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    document.querySelectorAll('.navbar__link').forEach((link) => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        const target = document.querySelector(targetId);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
        closeMobileNav();
      });
    });
  }

  /* ------------------------------------------------------------------
     Mobile nav toggle
     ------------------------------------------------------------------ */
  function initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const list = document.getElementById('navList');

    toggle.addEventListener('click', () => {
      const isOpen = list.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function closeMobileNav() {
    const toggle = document.getElementById('navToggle');
    const list = document.getElementById('navList');
    list.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  /* ------------------------------------------------------------------
     Scroll-spy: highlight active nav link based on visible section
     ------------------------------------------------------------------ */
  function initScrollSpy() {
    const sections = document.querySelectorAll('main section[id]');
    const links = document.querySelectorAll('.navbar__link');

    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          links.forEach((link) => {
            link.classList.toggle('is-active', link.dataset.section === id);
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach((section) => spy.observe(section));
  }

  /* ------------------------------------------------------------------
     Scroll reveal: animate sections into view once
     ------------------------------------------------------------------ */
  function initRevealAnimations() {
    document.querySelectorAll('.section__header').forEach((el) => el.classList.add('reveal'));

    document.querySelectorAll(
      '.about__grid, .edu-card, .bento, .cards-grid, .cert-grid, .contact__grid'
    ).forEach((el) => el.classList.add('reveal-stagger'));

    if (prefersReducedMotion) {
      document.querySelectorAll('.reveal, .reveal-stagger').forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('.reveal, .reveal-stagger').forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------
     Mouse glow
     ------------------------------------------------------------------ */
  function initMouseGlow() {
    // Disabled on mobile viewports to prevent weird touch drags and battery drain
    if (prefersReducedMotion || window.innerWidth <= 800) return;

    const glow = document.createElement('div');
    glow.className = 'mouse-glow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let active = false;

    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!active) {
        active = true;
        glow.classList.add('is-active');
        requestAnimationFrame(tick);
      }
    }, { passive: true });

    function tick() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      requestAnimationFrame(tick);
    }
  }

  /* ------------------------------------------------------------------
     Hero background parallax
     ------------------------------------------------------------------ */
  function initHeroParallax() {
    // Disabled on mobile viewports for performance
    if (prefersReducedMotion || window.innerWidth <= 800) return;

    const hero = document.getElementById('hero');
    const bg = hero.querySelector('.hero__bg');
    const spherePar = document.getElementById('sphereParallax');

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;

      if (bg) {
        bg.style.setProperty('--parallax-x', (relX * -14).toFixed(2));
        bg.style.setProperty('--parallax-y', (relY * -10).toFixed(2));
      }
      if (spherePar) {
        spherePar.style.setProperty('--sphere-mx', (relX * 16).toFixed(2));
        spherePar.style.setProperty('--sphere-my', (relY * -12).toFixed(2));
      }
    }, { passive: true });

    hero.addEventListener('mouseleave', () => {
      if (bg) {
        bg.style.setProperty('--parallax-x', 0);
        bg.style.setProperty('--parallax-y', 0);
      }
      if (spherePar) {
        spherePar.style.setProperty('--sphere-mx', 0);
        spherePar.style.setProperty('--sphere-my', 0);
      }
    });
  }

  /* ------------------------------------------------------------------
     Image fade-in
     ------------------------------------------------------------------ */
  function initImageFade() {
    document.querySelectorAll('img').forEach((img) => {
      img.classList.add('img-fade');
      if (img.complete && img.naturalWidth > 0) {
        img.classList.add('is-loaded');
        return;
      }
      img.addEventListener('load', () => img.classList.add('is-loaded'));
      img.addEventListener('error', () => img.classList.add('is-loaded'));
    });
  }

  /* ------------------------------------------------------------------
     Contact form
     ------------------------------------------------------------------ */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        status.textContent = 'Please fill in all fields before sending.';
        status.style.color = 'var(--rose-400)';
        return;
      }
      status.textContent = 'Message ready — connect this form to an email service or backend to send it.';
      status.style.color = 'var(--teal-400)';
      form.reset();
    });
  }
});