// =============================================================
// LAURA & JOÃO VITOR — LANDING PAGE
// JS simples, sem dependências. Cuida do menu mobile e destaca
// o link do menu conforme a seção visível na tela.
// =============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ---- Menu mobile (abrir/fechar) ----
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      menuToggle.classList.toggle('is-open', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Fecha o menu ao clicar em um link (útil no mobile)
    nav.querySelectorAll('.nav__link').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        menuToggle.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---- Destaca o link do menu de acordo com a seção visível ----
  const sections = document.querySelectorAll('main section[id], header[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
              link.classList.toggle(
                'is-active',
                link.getAttribute('href') === `#${id}`
              );
            });
          }
        });
      },
      { rootMargin: '-40% 0px -50% 0px' }
    );

    sections.forEach((section) => observer.observe(section));
  }

  // ---- Botão de RSVP (placeholder) ----
  // Troque este alerta pelo link do seu formulário de RSVP
  // (Google Forms, WhatsApp, etc.) quando estiver pronto.
  const rsvpBtn = document.getElementById('rsvpBtn');
  if (rsvpBtn) {
    rsvpBtn.addEventListener('click', (event) => {
      if (rsvpBtn.getAttribute('href') === '#') {
        event.preventDefault();
        alert('Link de confirmação de presença ainda não configurado.');
      }
    });
  }

});
