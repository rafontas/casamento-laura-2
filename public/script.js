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

  // ---- Easter egg: ícone dos Avengers ----
  // Ao clicar, mostra a foto, toca a música e escurece o fundo.
  // Clicando de novo (no ícone, no fundo escurecido ou apertando
  // Esc), volta tudo ao normal.
  const avengersBtn = document.getElementById('avengersEgg');
  const avengersOverlay = document.getElementById('avengersOverlay');
  const avengersAudio = document.getElementById('avengersAudio');

  if (avengersBtn && avengersOverlay && avengersAudio) {
    const isOpen = () => avengersOverlay.classList.contains('is-active');

    const openEasterEgg = () => {
      avengersOverlay.classList.add('is-active');
      avengersOverlay.setAttribute('aria-hidden', 'false');
      avengersBtn.setAttribute('aria-pressed', 'true');
      document.body.classList.add('no-scroll');
      avengersAudio.currentTime = 0;
      avengersAudio.play().catch(() => {
        // Alguns navegadores bloqueiam autoplay; como o clique já é
        // uma interação do usuário, isso raramente deve acontecer.
      });
    };

    const closeEasterEgg = () => {
      avengersOverlay.classList.remove('is-active');
      avengersOverlay.setAttribute('aria-hidden', 'true');
      avengersBtn.setAttribute('aria-pressed', 'false');
      document.body.classList.remove('no-scroll');
      avengersAudio.pause();
      avengersAudio.currentTime = 0;
    };

    avengersBtn.addEventListener('click', () => {
      if (isOpen()) {
        closeEasterEgg();
      } else {
        openEasterEgg();
      }
    });

    avengersOverlay.querySelector('.easter-egg__backdrop').addEventListener('click', closeEasterEgg);
    avengersOverlay.querySelector('.easter-egg__content').addEventListener('click', closeEasterEgg);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isOpen()) {
        closeEasterEgg();
      }
    });
  }

});