const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Em produção (Hostinger), cada deploy via Git cria uma pasta nova pra
// versão do app — então uma pasta "data" dentro do próprio projeto seria
// apagada a cada deploy, junto com as músicas e mensagens já salvas.
// Por isso, se DATA_DIR estiver definida (variável de ambiente configurada
// no painel, apontando pra uma pasta FORA da área de deploy), os dados
// ficam guardados lá e sobrevivem a todos os deploys futuros. Sem essa
// variável (ex.: no seu computador), continua usando a pasta "data" ao
// lado do server.js, como sempre.
const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(__dirname, 'data');
const MUSIC_FILE = path.join(DATA_DIR, 'musicas.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'mensagens.json');

// Fotos da galeria (galeria.html): em produção, ficam dentro de DATA_DIR,
// numa pasta própria, pelo mesmo motivo das músicas e mensagens — assim,
// pra trocar ou adicionar fotos, basta colocar os arquivos nessa pasta
// (direto pelo gerenciador de arquivos da Hostinger, por exemplo), sem
// precisar mexer em código nem fazer um novo deploy. No seu computador
// (sem DATA_DIR configurada), lê direto da pasta "galeria-fotos" ao lado
// do server.js, pra facilitar testar com fotos reais sem precisar
// configurar nada.
const GALLERY_DIR = process.env.DATA_DIR
  ? path.join(DATA_DIR, 'galeria-fotos')
  : path.join(__dirname, 'galeria-fotos');
const GALLERY_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);

// Arquivo com a senha do painel administrativo (fora do git, veja .gitignore)
const ADMIN_CONFIG_FILE = path.join(__dirname, 'admin-config.json');

// A cada IP, guarda a hora da última tentativa de validação de senha,
// para permitir no máximo 1 tentativa a cada 10 segundos (anti-força-bruta).
const ADMIN_RATE_LIMIT_MS = 10 * 1000;
const lastAdminAttempt = new Map();
const lastAdminAttemptMensagens = new Map();

// ---- Armazenamento simples em arquivo JSON para as sugestões de música ----

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(MUSIC_FILE)) {
    fs.writeFileSync(MUSIC_FILE, '[]', 'utf-8');
  }
}

function readMusicas() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(MUSIC_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Erro lendo musicas.json:', err);
    return [];
  }
}

function writeMusicas(musicas) {
  ensureDataFile();
  fs.writeFileSync(MUSIC_FILE, JSON.stringify(musicas, null, 2), 'utf-8');
}

// ---- Armazenamento simples em arquivo JSON para as mensagens aos noivos ----

function ensureMessagesFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(MESSAGES_FILE)) {
    fs.writeFileSync(MESSAGES_FILE, '[]', 'utf-8');
  }
}

function readMensagens() {
  ensureMessagesFile();
  try {
    const raw = fs.readFileSync(MESSAGES_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Erro lendo mensagens.json:', err);
    return [];
  }
}

function writeMensagens(mensagens) {
  ensureMessagesFile();
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(mensagens, null, 2), 'utf-8');
}

// ---- Galeria de fotos (pasta persistente DATA_DIR/galeria-fotos) ----

function ensureGalleryDir() {
  if (!fs.existsSync(GALLERY_DIR)) {
    fs.mkdirSync(GALLERY_DIR, { recursive: true });
  }
}

// Lista os arquivos de imagem dentro da pasta da galeria, em ordem natural
// (foto2 antes de foto10), ignorando arquivos ocultos e qualquer coisa que
// não seja uma imagem.
function listarFotosGaleria() {
  ensureGalleryDir();
  let arquivos;
  try {
    arquivos = fs.readdirSync(GALLERY_DIR);
  } catch (err) {
    console.error('[galeria] Erro lendo a pasta da galeria:', err);
    return [];
  }
  return arquivos
    .filter((nome) => !nome.startsWith('.'))
    .filter((nome) => GALLERY_EXTENSIONS.has(path.extname(nome).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true, sensitivity: 'base' }));
}

function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ---- Painel administrativo (admin-musicas.html) ----

function getAdminPassword() {
  // Em produção (Hostinger), cada novo deploy via Git cria uma pasta nova
  // para a versão da aplicação — então um arquivo solto (não versionado)
  // como o admin-config.json não sobrevive de um deploy pro outro. Por
  // isso a senha é lida primeiro de uma variável de ambiente (ADMIN_SENHA),
  // que se configura uma única vez no painel da Hostinger e persiste em
  // todos os deploys futuros.
  if (process.env.ADMIN_SENHA) {
    return process.env.ADMIN_SENHA;
  }

  // Fallback para desenvolvimento local: continua funcionando com o
  // admin-config.json na pasta do projeto, sem precisar configurar nada.
  let raw;
  try {
    raw = fs.readFileSync(ADMIN_CONFIG_FILE, 'utf-8');
  } catch (err) {
    // Loga o caminho exato que o servidor tentou ler, para facilitar
    // conferir se o admin-config.json está na pasta certa no deploy.
    console.error(`[admin] Nem ADMIN_SENHA nem o arquivo ${ADMIN_CONFIG_FILE} foram encontrados.`, err.message);
    return null;
  }

  let config;
  try {
    config = JSON.parse(raw);
  } catch (err) {
    console.error('[admin] admin-config.json existe, mas não é um JSON válido:', err.message);
    return null;
  }

  if (!config || !config.senha) {
    console.error('[admin] admin-config.json foi lido, mas não tem a chave "senha" preenchida.');
    return null;
  }

  return config.senha;
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket && req.socket.remoteAddress;
}

// Compara duas strings em tempo constante, para evitar vazar informação
// sobre a senha correta através do tempo de resposta.
// Verifica o rate-limit de um IP num mapa de tentativas. Retorna null se
// a tentativa pode seguir (e já marca o horário atual), ou o número de
// segundos que faltam para poder tentar de novo.
function checarRateLimit(map, ip) {
  const agora = Date.now();
  const ultima = map.get(ip) || 0;
  const decorrido = agora - ultima;
  if (decorrido < ADMIN_RATE_LIMIT_MS) {
    return Math.ceil((ADMIN_RATE_LIMIT_MS - decorrido) / 1000);
  }
  map.set(ip, agora);
  return null;
}

function senhasIguais(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) {
    // Ainda assim compara contra um buffer do mesmo tamanho, para não
    // retornar instantaneamente quando o tamanho já denuncia a resposta.
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

app.use(express.json());

// Serve todos os arquivos da pasta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Serve as fotos da galeria diretamente da pasta persistente (DATA_DIR)
ensureGalleryDir();
app.use('/galeria-fotos', express.static(GALLERY_DIR));

// ---- API: lista de fotos da galeria (galeria.html), paginada ----
// A página carrega as fotos aos poucos (30 por vez, por padrão) em vez de
// tudo de uma vez, buscando mais conforme a pessoa rola a tela. Por isso
// essa rota aceita "offset" (a partir de qual foto) e "limit" (quantas
// fotos por vez) via query string, e devolve "proximoOffset" (ou null,
// quando já mostrou todas) pra página saber se deve buscar mais.
app.get('/api/galeria', (req, res) => {
  const todasAsFotos = listarFotosGaleria();

  const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
  const limitePedido = parseInt(req.query.limit, 10) || 30;
  const limit = Math.min(Math.max(limitePedido, 1), 100);

  const pagina = todasAsFotos.slice(offset, offset + limit);
  const fimDaPagina = offset + pagina.length;

  res.json({
    arquivos: pagina,
    total: todasAsFotos.length,
    proximoOffset: fimDaPagina < todasAsFotos.length ? fimDaPagina : null,
  });
});

// ---- API: sugestões de música (musica.html) ----

// Lista todas as músicas, ordenadas por saldo de votos (maior primeiro)
app.get('/api/musicas', (req, res) => {
  const musicas = readMusicas()
    .slice()
    .sort((a, b) => {
      const scoreA = (a.upvotes || 0) - (a.downvotes || 0);
      const scoreB = (b.upvotes || 0) - (b.downvotes || 0);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return new Date(a.criadoEm) - new Date(b.criadoEm);
    });
  res.json(musicas);
});

// Adiciona uma nova sugestão de música
app.post('/api/musicas', (req, res) => {
  const musica = ((req.body && req.body.musica) || '').toString().trim().slice(0, 120);
  const autor = ((req.body && req.body.autor) || '').toString().trim().slice(0, 120);
  const nome = ((req.body && req.body.nome) || '').toString().trim().slice(0, 80);

  if (!musica || !autor) {
    return res.status(400).json({ erro: 'Informe a música e o autor.' });
  }

  const musicas = readMusicas();
  const novaMusica = {
    id: gerarId(),
    musica,
    autor,
    nome,
    upvotes: 0,
    downvotes: 0,
    criadoEm: new Date().toISOString(),
  };
  musicas.push(novaMusica);
  writeMusicas(musicas);
  res.status(201).json(novaMusica);
});

function votar(req, res, campo) {
  const musicas = readMusicas();
  const item = musicas.find((m) => m.id === req.params.id);
  if (!item) {
    return res.status(404).json({ erro: 'Música não encontrada.' });
  }
  item[campo] = (item[campo] || 0) + 1;
  writeMusicas(musicas);
  res.json(item);
}

app.post('/api/musicas/:id/upvote', (req, res) => votar(req, res, 'upvotes'));
app.post('/api/musicas/:id/downvote', (req, res) => votar(req, res, 'downvotes'));

// ---- API: mensagens para os noivos (modal "Deixe uma mensagem") ----

// Recebe uma nova mensagem e a armazena em data/mensagens.json
app.post('/api/mensagens', (req, res) => {
  const nome = ((req.body && req.body.nome) || '').toString().trim().slice(0, 80);
  const mensagem = ((req.body && req.body.mensagem) || '').toString().trim().slice(0, 500);

  if (!mensagem) {
    return res.status(400).json({ erro: 'Escreva uma mensagem antes de enviar.' });
  }

  const mensagens = readMensagens();
  const novaMensagem = {
    id: gerarId(),
    nome,
    mensagem,
    criadoEm: new Date().toISOString(),
  };
  mensagens.push(novaMensagem);
  writeMensagens(mensagens);
  res.status(201).json(novaMensagem);
});

// Valida a senha do painel administrativo e, se correta, devolve a lista
// completa de músicas (ordenada por saldo de votos). No máximo 1 tentativa
// a cada 10 segundos por IP, para dificultar ataques de força bruta.
app.post('/api/admin/musicas', (req, res) => {
  const ip = getClientIp(req) || 'desconhecido';
  const espera = checarRateLimit(lastAdminAttempt, ip);
  if (espera !== null) {
    res.set('Retry-After', String(espera));
    return res.status(429).json({ erro: `Aguarde ${espera}s antes de tentar novamente.` });
  }

  const senhaConfigurada = getAdminPassword();
  if (!senhaConfigurada) {
    return res.status(500).json({ erro: 'Painel administrativo não configurado no servidor.' });
  }

  const senhaEnviada = (req.body && req.body.senha) || '';
  if (!senhaEnviada || !senhasIguais(senhaEnviada, senhaConfigurada)) {
    return res.status(401).json({ erro: 'Senha incorreta.' });
  }

  const musicas = readMusicas()
    .slice()
    .sort((a, b) => {
      const scoreA = (a.upvotes || 0) - (a.downvotes || 0);
      const scoreB = (b.upvotes || 0) - (b.downvotes || 0);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return new Date(a.criadoEm) - new Date(b.criadoEm);
    });
  res.json(musicas);
});

// Valida a senha do painel administrativo e, se correta, devolve a lista
// completa de mensagens deixadas para os noivos (mais recentes primeiro).
// Mesmo limite de 1 tentativa a cada 10 segundos por IP (mapa próprio,
// independente do painel de músicas).
app.post('/api/admin/mensagens', (req, res) => {
  const ip = getClientIp(req) || 'desconhecido';
  const espera = checarRateLimit(lastAdminAttemptMensagens, ip);
  if (espera !== null) {
    res.set('Retry-After', String(espera));
    return res.status(429).json({ erro: `Aguarde ${espera}s antes de tentar novamente.` });
  }

  const senhaConfigurada = getAdminPassword();
  if (!senhaConfigurada) {
    return res.status(500).json({ erro: 'Painel administrativo não configurado no servidor.' });
  }

  const senhaEnviada = (req.body && req.body.senha) || '';
  if (!senhaEnviada || !senhasIguais(senhaEnviada, senhaConfigurada)) {
    return res.status(401).json({ erro: 'Senha incorreta.' });
  }

  const mensagens = readMensagens()
    .slice()
    .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
  res.json(mensagens);
});

// Rota para a raiz (opcional, pois o static já resolve)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Fallback para 404
app.use((req, res) => {
  res.status(404).send('<h1>404 - Página não encontrada</h1>');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  // Ajuda a descobrir, pelos logs do painel da Hostinger, onde a aplicação
  // está rodando de verdade (essa pasta muda a cada deploy) e onde os
  // dados estão sendo salvos (essa, se DATA_DIR estiver configurada,
  // deve ser sempre a mesma em todos os deploys).
  console.log(`[info] Pasta da aplicação nesta versão: ${__dirname}`);
  console.log(`[info] Pasta onde os dados estão sendo salvos: ${DATA_DIR}`);
  console.log(`[info] Pasta de onde as fotos da galeria estão sendo lidas: ${GALLERY_DIR}`);
});
