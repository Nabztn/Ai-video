// server.js — Serveur Studio Créatif
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSpeech, ensureAudioDir } from './tts-service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));
app.use('/temp', express.static('temp'));

// ─── Endpoint TTS ─────────────────────────────────────
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice, id } = req.body;
    if (!text) return res.status(400).json({ error: 'text requis' });
    const result = await generateSpeech(text, voice, id);
    res.json(result);
  } catch (e) {
    console.error('TTS error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ─── Liste des voix ───────────────────────────────────
app.get('/api/voices', (req, res) => {
  res.json([
    { id: 'fr-FR-DeniseNeural', name: 'Denise (FR, féminine)' },
    { id: 'fr-FR-HenriNeural', name: 'Henri (FR, masculine)' },
    { id: 'fr-FR-EloiseNeural', name: 'Éloïse (FR, enfant)' },
    { id: 'fr-FR-RemyMultilingualNeural', name: 'Rémy (FR, masculin)' },
    { id: 'fr-FR-VivienneMultilingualNeural', name: 'Vivienne (FR, féminine)' },
    { id: 'fr-CA-SylvieNeural', name: 'Sylvie (CA, féminine)' },
    { id: 'fr-CA-JeanNeural', name: 'Jean (CA, masculin)' }
  ]);
});

// ─── Démarrage ────────────────────────────────────────
await ensureAudioDir();

app.listen(PORT, () => {
  console.log(`\n🎬 Studio Créatif démarré sur le port ${PORT}`);
  console.log(`   → http://localhost:${PORT}\n`);
});
