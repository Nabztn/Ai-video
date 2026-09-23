// tts-service.js — Génère des MP3 avec Edge TTS
import { EdgeTTS } from 'edge-tts';
import fs from 'fs/promises';
import path from 'path';

const AUDIO_DIR = path.resolve('temp/audio');

export async function ensureAudioDir() {
  await fs.mkdir(AUDIO_DIR, { recursive: true });
}

export async function generateSpeech(text, voice = 'fr-FR-DeniseNeural', id = null) {
  const fileId = id || `tts_${Date.now()}`;
  const mp3Path = path.join(AUDIO_DIR, `${fileId}.mp3`);

  await ensureAudioDir();

  const tts = new EdgeTTS(text, voice);
  await tts.toFile(mp3Path);

  return {
    mp3: `/temp/audio/${fileId}.mp3`,
    path: mp3Path
  };
}
