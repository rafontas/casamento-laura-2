const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve todos os arquivos da pasta "public"
app.use(express.static(path.join(__dirname, 'public')));

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