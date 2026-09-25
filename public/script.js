// =============================================================
// LAURA & JOÃO VITOR — LANDING PAGE
// JS simples, sem dependências. Cuida do menu mobile e destaca
// o link do menu conforme a seção visível na tela.
// =============================================================

// ---- Lista de presentes (usada em presentes.html) ----
// Para adicionar, remover ou alterar um presente, basta editar
// estes dois arrays — o grid é montado automaticamente a partir
// deles.
const DEFAULT_HONEYMOON_ITEMS = [
  { id: 'taxas-embarque', name: 'Taxas de Embarque', desc: 'Ajuda com taxas e bagagens da viagem.', amount: 140.00, category: 'Lua de Mel', icon: '\uD83E\uDDF3' },
  { id: 'traslado-aeroporto', name: 'Traslado Aeroporto-Hotel', desc: 'Transporte seguro na chegada e saída.', amount: 200.00, category: 'Lua de Mel', icon: '\uD83D\uDE95' },
  { id: 'jantar-romantico', name: 'Jantar Romântico', desc: 'Um jantar especial a dois na viagem.', amount: 299.00, category: 'Lua de Mel', icon: '\uD83C\uDF7D\uFE0F' },
  { id: 'passeio-barco', name: 'Passeio de Barco', desc: 'Experiência inesquecível em alto-mar.', amount: 317.00, category: 'Lua de Mel', icon: '\u26F5' },
  { id: 'jantar-celebracao', name: 'Jantar de Celebração', desc: 'Noite especial para celebrar esse momento.', amount: 390.00, category: 'Lua de Mel', icon: '\uD83E\uDD42' },
  { id: 'spa-casal', name: 'Spa para o Casal', desc: 'Momento de relaxamento durante a lua de mel.', amount: 470.00, category: 'Lua de Mel', icon: '\uD83E\uDDD6' },
  { id: 'hospedagem-1-noite', name: 'Hospedagem de 1 Noite', desc: 'Contribuição para uma noite no hotel.', amount: 560.00, category: 'Lua de Mel', icon: '\uD83C\uDFE8' },
  { id: 'tour-privativo', name: 'Tour Privativo', desc: 'Um dia de passeio com guia local.', amount: 650.00, category: 'Lua de Mel', icon: '\uD83D\uDDFA\uFE0F' },
  { id: 'ensaio-fotografico', name: 'Ensaio Fotográfico', desc: 'Registro do nosso começo em viagem.', amount: 740.00, category: 'Lua de Mel', icon: '\uD83D\uDCF8' },
  { id: 'experiencia-premium', name: 'Experiência Premium', desc: 'Uma experiência única na viagem.', amount: 820.00, category: 'Lua de Mel', icon: '\u2728' },
  { id: 'passagem-aerea-casal', name: 'Passagem Aérea do Casal', desc: 'Contribuição para nossas passagens de ida.', amount: 849.00, category: 'Lua de Mel', icon: '\u2708\uFE0F' },
  { id: 'cota-lua-de-mel-completa', name: 'Cota Lua de Mel Completa', desc: 'Contribuição para tornar essa viagem perfeita.', amount: 999.00, category: 'Lua de Mel', icon: '\uD83D\uDC9B' },
];

const DEFAULT_HOUSEHOLD_ITEMS = [
  { id: 'jogo-panelas', name: 'Jogo de Panelas', desc: 'Para preparar muitas receitas no novo lar.', amount: 220.00, category: 'Casa', icon: '\uD83C\uDF73' },
  { id: 'airfryer', name: 'Airfryer', desc: 'Praticidade para o dia a dia da casa.', amount: 380.00, category: 'Casa', icon: '\uD83C\uDF5F' },
  { id: 'liquidificador', name: 'Liquidificador', desc: 'Essencial para sucos, vitaminas e receitas.', amount: 190.00, category: 'Casa', icon: '\uD83E\uDD64' },
  { id: 'cafeteira', name: 'Cafeteira', desc: 'Para começar o dia com energia e carinho.', amount: 260.00, category: 'Casa', icon: '\u2615' },
  { id: 'jogo-cama', name: 'Jogo de Cama', desc: 'Conforto para noites ainda mais especiais.', amount: 210.00, category: 'Casa', icon: '\uD83D\uDECF\uFE0F' },
  { id: 'jogo-toalhas', name: 'Jogo de Toalhas', desc: 'Um mimo útil para o enxoval.', amount: 130.00, category: 'Casa', icon: '\uD83E\uDDFA' },
  { id: 'faqueiro', name: 'Faqueiro', desc: 'Para receber visitas com elegância.', amount: 170.00, category: 'Casa', icon: '\uD83C\uDF74' },
  { id: 'aparelho-jantar', name: 'Aparelho de Jantar', desc: 'Para celebrar refeições em família.', amount: 320.00, category: 'Casa', icon: '\uD83C\uDF7D\uFE0F' },
  { id: 'aspirador', name: 'Aspirador de Pó', desc: 'Mais praticidade na rotina da limpeza.', amount: 450.00, category: 'Casa', icon: '\uD83E\uDDF9' },
  { id: 'microondas', name: 'Micro-ondas', desc: 'Agilidade para refeições e aquecimentos.', amount: 590.00, category: 'Casa', icon: '\uD83D\uDD25' },
  { id: 'rack-sala', name: 'Rack para Sala', desc: 'Um toque especial para o cantinho da sala.', amount: 720.00, category: 'Casa', icon: '\uD83D\uDECB\uFE0F' },
  { id: 'geladeira', name: 'Cota Geladeira', desc: 'Contribuição para um item essencial da casa.', amount: 990.00, category: 'Casa', icon: '\uD83E\uDDCA' },
];

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
            // Só mexe no destaque do menu se algum link corresponder a
            // essa seção (âncora "#id"). Em páginas próprias (como
            // presentes.html e historia.html), os links do menu apontam
            // para outras páginas, não para âncoras — nesse caso não há
            // link correspondente e o destaque fixado no HTML dessa
            // página é mantido como está.
            const matchingLink = Array.from(navLinks).find(
              (link) => link.getAttribute('href') === `#${id}`
            );
            if (matchingLink) {
              navLinks.forEach((link) => link.classList.remove('is-active'));
              matchingLink.classList.add('is-active');
            }
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

  // ---- Contador regressivo para o casamento (só existe em index.html) ----
  const countdownEl = document.getElementById('heroCountdown');
  if (countdownEl) {
    const WEDDING_TIME = new Date('2027-06-19T15:30:00-03:00').getTime();
    const valDias = countdownEl.querySelector('[data-countdown="dias"]');
    const valHoras = countdownEl.querySelector('[data-countdown="horas"]');
    const valMinutos = countdownEl.querySelector('[data-countdown="minutos"]');
    const valSegundos = countdownEl.querySelector('[data-countdown="segundos"]');
    const pad = (n) => String(n).padStart(2, '0');
    let intervalId;

    const atualizarContador = () => {
      const diff = WEDDING_TIME - Date.now();

      if (diff <= 0) {
        countdownEl.innerHTML = '<p class="countdown__done">Já estamos casados! 🎉</p>';
        clearInterval(intervalId);
        return;
      }

      const segundosTotais = Math.floor(diff / 1000);
      const dias = Math.floor(segundosTotais / 86400);
      const horas = Math.floor((segundosTotais % 86400) / 3600);
      const minutos = Math.floor((segundosTotais % 3600) / 60);
      const segundos = segundosTotais % 60;

      valDias.textContent = pad(dias);
      valHoras.textContent = pad(horas);
      valMinutos.textContent = pad(minutos);
      valSegundos.textContent = pad(segundos);
    };

    atualizarContador();
    intervalId = setInterval(atualizarContador, 1000);
  }

  // ---- Música de fundo ----
  // Toca automaticamente ao entrar em qualquer página do site.
  // Navegadores bloqueiam áudio com som sem interação do usuário,
  // então se o autoplay falhar, a música começa no primeiro clique/
  // toque/tecla. O botão flutuante permite pausar e retomar, e a
  // escolha do usuário (ligado/desligado) é lembrada entre as páginas.
  const bgMusic = document.getElementById('bgMusic');
  const musicToggle = document.getElementById('musicToggle');

  if (bgMusic && musicToggle) {
    const iconOn = musicToggle.querySelector('.music-toggle__icon--on');
    const iconOff = musicToggle.querySelector('.music-toggle__icon--off');
    const STORAGE_KEY = 'bgMusicEnabled';
    const TIME_KEY = 'bgMusicTime';
    let started = false;

    // ---- Continuidade entre páginas ----
    // Cada página é um carregamento novo (site multi-página, não SPA),
    // então o <audio> sempre nasce do zero. Para a música "continuar"
    // ao navegar, salvamos a posição atual no localStorage e retomamos
    // dali na página seguinte — não é o mesmo áudio tocando sem
    // interrupção (isso exigiria uma SPA), mas o efeito para quem ouve
    // é o de continuidade, sem reiniciar do começo.
    const restoreTime = () => {
      const saved = parseFloat(localStorage.getItem(TIME_KEY));
      if (isNaN(saved) || saved <= 0) return;
      const apply = () => {
        try {
          // Se a música salva for mais longa que o áudio atual (ex.:
          // trocou o arquivo), volta pro início em vez de travar no fim.
          bgMusic.currentTime = bgMusic.duration && saved < bgMusic.duration ? saved : 0;
        } catch (err) {
          // Alguns navegadores recusam setar currentTime cedo demais — ignora.
        }
      };
      if (bgMusic.readyState >= 1) {
        apply();
      } else {
        bgMusic.addEventListener('loadedmetadata', apply, { once: true });
      }
    };

    const saveTime = () => {
      try {
        localStorage.setItem(TIME_KEY, String(bgMusic.currentTime));
      } catch (err) {
        // localStorage indisponível — só não lembra a posição depois.
      }
    };

    restoreTime();

    // Salva a posição a cada ~2s tocando e sempre que a pessoa sai da
    // página (troca de página, fecha a aba, etc.).
    let lastSaved = 0;
    bgMusic.addEventListener('timeupdate', () => {
      const now = Date.now();
      if (now - lastSaved > 2000) {
        lastSaved = now;
        saveTime();
      }
    });
    window.addEventListener('pagehide', saveTime);
    window.addEventListener('beforeunload', saveTime);

    const setIcon = (playing) => {
      // Usamos setAttribute/removeAttribute em vez da propriedade
      // .hidden: em elementos <svg>, alguns navegadores atualizam a
      // propriedade mas não refletem no atributo de fato, deixando o
      // ícone errado escondido/visível.
      if (playing) {
        iconOn.removeAttribute('hidden');
        iconOff.setAttribute('hidden', '');
      } else {
        iconOn.setAttribute('hidden', '');
        iconOff.removeAttribute('hidden');
      }
      musicToggle.setAttribute('aria-pressed', String(playing));
      musicToggle.setAttribute('aria-label', playing ? 'Pausar música' : 'Tocar música');
    };

    // O ícone sempre reflete o estado real do <audio> (eventos nativos
    // play/pause), em vez de ser setado manualmente em cada chamada de
    // play() — assim não há inconsistência quando duas tentativas de
    // play() se sobrepõem (autoplay + clique, por exemplo).
    bgMusic.addEventListener('play', () => setIcon(true));
    bgMusic.addEventListener('pause', () => setIcon(false));

    const tryAutoplay = () => {
      if (started) return;
      bgMusic
        .play()
        .then(() => {
          started = true;
        })
        .catch(() => {
          // Autoplay bloqueado pelo navegador — espera a primeira interação.
        });
    };

    const userDisabled = localStorage.getItem(STORAGE_KEY) === 'off';

    if (userDisabled) {
      setIcon(false);
    } else {
      // O padrão é tocar: o ícone já nasce mostrando "ligado" no HTML.
      // Se o navegador bloquear o autoplay, o ícone continua assim
      // (representando o estado padrão) até a música realmente
      // começar no primeiro clique/toque/tecla.
      tryAutoplay();

      const onFirstInteraction = () => {
        if (!started) tryAutoplay();
      };
      document.addEventListener('click', onFirstInteraction, { once: true });
      document.addEventListener('keydown', onFirstInteraction, { once: true });
      document.addEventListener('touchstart', onFirstInteraction, { once: true });
    }

    musicToggle.addEventListener('click', () => {
      if (bgMusic.paused) {
        bgMusic
          .play()
          .then(() => {
            started = true;
            localStorage.setItem(STORAGE_KEY, 'on');
          })
          .catch((err) => {
            console.warn('Não foi possível tocar a música de fundo:', err);
          });
      } else {
        bgMusic.pause();
        localStorage.setItem(STORAGE_KEY, 'off');
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
    let hideTimer = null;

    const openEasterEgg = () => {
      clearTimeout(hideTimer);
      avengersOverlay.hidden = false;
      // Força o navegador a "perceber" o hidden=false antes de
      // adicionar a classe, para a transição de opacidade funcionar.
      void avengersOverlay.offsetWidth;
      avengersOverlay.classList.add('is-active');
      avengersBtn.setAttribute('aria-pressed', 'true');
      document.body.classList.add('no-scroll');
      avengersAudio.currentTime = 0;
      avengersAudio.play().catch((err) => {
        // Alguns navegadores bloqueiam autoplay; como o clique já é
        // uma interação do usuário, isso raramente deve acontecer.
        console.warn('Não foi possível tocar a música do easter egg:', err);
      });
    };

    const closeEasterEgg = () => {
      avengersOverlay.classList.remove('is-active');
      avengersBtn.setAttribute('aria-pressed', 'false');
      document.body.classList.remove('no-scroll');
      avengersAudio.pause();
      avengersAudio.currentTime = 0;
      // Espera a transição de saída terminar antes de esconder de fato.
      hideTimer = setTimeout(() => {
        avengersOverlay.hidden = true;
      }, 350);
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

  // ---- Grid de presentes (só existe em presentes.html) ----
  const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const renderGiftGrid = (containerId, items) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = items
      .map(
        (item) => `
      <div class="gift-card" data-id="${item.id}">
        <span class="gift-card__icon" aria-hidden="true">${item.icon}</span>
        <h3 class="gift-card__name">${item.name}</h3>
        <p class="gift-card__desc">${item.desc}</p>
        <p class="gift-card__amount">${currencyFormatter.format(item.amount)}</p>
      </div>
    `
      )
      .join('');
  };

  renderGiftGrid('honeymoonGifts', DEFAULT_HONEYMOON_ITEMS);
  renderGiftGrid('householdGifts', DEFAULT_HOUSEHOLD_ITEMS);


  // ---- Sugestão de música (só existe em musica.html) ----
  const musicList = document.getElementById('musicList');
  if (musicList) {
    const musicForm = document.getElementById('musicForm');
    const musicaInput = document.getElementById('musicaInput');
    const autorInput = document.getElementById('autorInput');
    const nomeInput = document.getElementById('nomeInput');
    const musicFeedback = document.getElementById('musicFormFeedback');
    const VOTES_KEY = 'musicVotes';

    const getVotes = () => {
      try {
        return JSON.parse(localStorage.getItem(VOTES_KEY)) || {};
      } catch (err) {
        return {};
      }
    };

    const saveVote = (id, tipo) => {
      const votes = getVotes();
      votes[id] = tipo;
      try {
        localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
      } catch (err) {
        // localStorage indisponível (ex.: modo privado) — o voto ainda
        // conta no servidor, só não fica travado neste navegador.
      }
    };

    const escapeHtml = (str) =>
      String(str).replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      }[ch]));

    const voteIcons = {
      up: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M12 5l-6 6M12 5l6 6"/></svg>',
      down: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M12 19l-6-6M12 19l6-6"/></svg>',
    };

    const renderMusicList = (items) => {
      if (!items.length) {
        musicList.innerHTML = '<p class="music-list__empty">Ainda não há sugestões. Que tal ser a primeira pessoa a sugerir uma música?</p>';
        return;
      }

      const votes = getVotes();

      musicList.innerHTML = items
        .map((item) => {
          const votedTipo = votes[item.id];
          return `
        <div class="music-item" data-id="${item.id}">
          <div class="music-item__info">
            <h3 class="music-item__title">${escapeHtml(item.musica)}</h3>
            <p class="music-item__author">${escapeHtml(item.autor)}</p>
            ${item.nome ? `<p class="music-item__suggested-by">Sugerido por ${escapeHtml(item.nome)}</p>` : ''}
          </div>
          <div class="music-item__votes">
            <button type="button" class="vote-btn vote-btn--up${votedTipo === 'up' ? ' is-voted' : ''}" data-action="up" ${votedTipo ? 'disabled' : ''} aria-label="Votar a favor de ${escapeHtml(item.musica)}">
              ${voteIcons.up}
              <span class="vote-btn__count">${item.upvotes || 0}</span>
            </button>
            <button type="button" class="vote-btn vote-btn--down${votedTipo === 'down' ? ' is-voted' : ''}" data-action="down" ${votedTipo ? 'disabled' : ''} aria-label="Votar contra ${escapeHtml(item.musica)}">
              ${voteIcons.down}
              <span class="vote-btn__count">${item.downvotes || 0}</span>
            </button>
          </div>
        </div>
      `;
        })
        .join('');
    };

    const loadMusicList = () => {
      fetch('/api/musicas')
        .then((res) => res.json())
        .then((items) => renderMusicList(items))
        .catch(() => {
          musicList.innerHTML = '<p class="music-list__error">Não foi possível carregar as sugestões agora. Tente recarregar a página.</p>';
        });
    };

    if (musicForm) {
      musicForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const musica = musicaInput.value.trim();
        const autor = autorInput.value.trim();
        const nome = nomeInput ? nomeInput.value.trim() : '';

        if (!musica || !autor) {
          musicFeedback.textContent = 'Preencha o nome da música e o autor.';
          musicFeedback.classList.add('is-error');
          return;
        }

        const submitBtn = musicForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        fetch('/api/musicas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ musica, autor, nome }),
        })
          .then((res) => {
            if (!res.ok) throw new Error('Falha ao salvar');
            return res.json();
          })
          .then(() => {
            musicaInput.value = '';
            autorInput.value = '';
            if (nomeInput) nomeInput.value = '';
            musicFeedback.textContent = 'Música adicionada, obrigado pela sugestão!';
            musicFeedback.classList.remove('is-error');
            loadMusicList();
          })
          .catch(() => {
            musicFeedback.textContent = 'Não foi possível adicionar agora. Tente novamente.';
            musicFeedback.classList.add('is-error');
          })
          .finally(() => {
            submitBtn.disabled = false;
          });
      });
    }

    musicList.addEventListener('click', (event) => {
      const btn = event.target.closest('.vote-btn');
      if (!btn || btn.disabled) return;

      const itemEl = btn.closest('.music-item');
      const id = itemEl.getAttribute('data-id');
      if (getVotes()[id]) return; // já votou nessa música neste navegador

      const tipo = btn.getAttribute('data-action'); // 'up' | 'down'
      const rota = tipo === 'up' ? 'upvote' : 'downvote';

      fetch(`/api/musicas/${encodeURIComponent(id)}/${rota}`, { method: 'POST' })
        .then((res) => {
          if (!res.ok) throw new Error('Falha ao votar');
          return res.json();
        })
        .then(() => {
          saveVote(id, tipo);
          loadMusicList();
        })
        .catch(() => {
          // silencioso — o voto simplesmente não é contabilizado agora
        });
    });

    loadMusicList();
  }

});