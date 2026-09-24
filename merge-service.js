// server.js — Serveur Studio Créatif
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSpeech, ensureAudioDir } from './tts-service.js';
import { mergeVideoWithAudio, ensureOutputDir } from './merge-service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));
app.use('/temp', express.static('temp'));

// ─── Endpoint TTS (ElevenLabs) ────────────────────────
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

// ─── Endpoint Merge (fusion vidéo + audio) ─────────────
app.post('/api/merge', async (req, res) => {
  try {
    const { videoUrl, audioPath, outputName } = req.body;
    if (!videoUrl || !audioPath) {
      return res.status(400).json({ error: 'videoUrl et audioPath requis' });
    }
    await ensureOutputDir();
    const result = await mergeVideoWithAudio(videoUrl, audioPath, outputName);
    res.json(result);
  } catch (e) {
    console.error('Merge error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ─── Liste des voix ───────────────────────────────────
app.get('/api/voices', (req, res) => {
  res.json([
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella (femme)' },
    { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam (homme)' },
    { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni (homme)' }
  ]);
});

// ─── Démarrage ────────────────────────────────────────
await ensureAudioDir();
await ensureOutputDir();

app.listen(PORT, () => {
  console.log(`\n🎬 Studio Créatif démarré sur le port ${PORT}`);
  console.log(`   → http://localhost:${PORT}\n`);
});