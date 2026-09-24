// tts-service.js — Génère des MP3 avec msedge-tts
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
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

  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

  const { audioStream } = await tts.toStream(text);

  return new Promise((resolve, reject) => {
    const chunks = [];
    audioStream.on('data', (chunk) => chunks.push(chunk));
    audioStream.on('end', async () => {
      try {
        const buffer = Buffer.concat(chunks);
        await fs.writeFile(mp3Path, buffer);
        resolve({
          mp3: `/temp/audio/${fileId}.mp3`,
          path: mp3Path
        });
      } catch (e) {
        reject(e);
      }
    });
    audioStream.on('error', reject);
  });
}
