// tts-service.js — Google Translate TTS
import fs from 'fs/promises';
import path from 'path';

const AUDIO_DIR = path.resolve('temp/audio');

export async function ensureAudioDir() {
  await fs.mkdir(AUDIO_DIR, { recursive: true });
}

export async function generateSpeech(text, voice = 'fr', id = null) {
  const fileId = id || `tts_${Date.now()}`;
  const mp3Path = path.join(AUDIO_DIR, `${fileId}.mp3`);

  await ensureAudioDir();

  // Découper le texte en morceaux de 200 caractères max (limite Google TTS)
  const chunks = splitText(text, 190);

  const audioBuffers = [];

  for (const chunk of chunks) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${voice}&client=tw-ob`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    if (!response.ok) {
      throw new Error('HTTP ' + response.status + ' — Échec TTS Google');
    }
    const arrayBuffer = await response.arrayBuffer();
    audioBuffers.push(Buffer.from(arrayBuffer));
  }

  const buffer = Buffer.concat(audioBuffers);
  await fs.writeFile(mp3Path, buffer);

  return { mp3: `/temp/audio/${fileId}.mp3`, path: mp3Path };
}

function splitText(text, maxLen) {
  // Découpe le texte en phrases, puis regroupe les phrases par 190 caractères
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks = [];
  let current = '';
  for (const s of sentences) {
    if ((current + s).length > maxLen) {
      if (current) chunks.push(current.trim());
      current = s;
    } else {
      current += s;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks.length ? chunks : [text.slice(0, maxLen)];
}