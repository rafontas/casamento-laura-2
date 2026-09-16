const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, 'data');
const MUSIC_FILE = path.join(DATA_DIR, 'musicas.json');

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

function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

app.use(express.json());

// Serve todos os arquivos da pasta "public"
app.use(express.static(path.join(__dirname, 'public')));

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

  if (!musica || !autor) {
    return res.status(400).json({ erro: 'Informe a música e o autor.' });
  }

  const musicas = readMusicas();
  const novaMusica = {
    id: gerarId(),
    musica,
    autor,
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
});
