// tts-service.js — ElevenLabs TTS
import fs from 'fs/promises';
import path from 'path';

const AUDIO_DIR = path.resolve('temp/audio');

export async function ensureAudioDir() {
  await fs.mkdir(AUDIO_DIR, { recursive: true });
}

export async function generateSpeech(text, voice = 'EXAVITQu4vr4xnSDxMaL', id = null) {
  const fileId = id || `tts_${Date.now()}`;
  const mp3Path = path.join(AUDIO_DIR, `${fileId}.mp3`);

  await ensureAudioDir();

  const apiKey = (process.env.ELEVENLABS_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY manquante dans .env');
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voice}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg'
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true
      }
    })
  });

  if (!response.ok) {
    let errMsg = 'HTTP ' + response.status;
    try {
      const errJson = await response.json();
      if (errJson.detail && errJson.detail.message) {
        errMsg += ' — ' + errJson.detail.message;
      }
    } catch (e) {
      errMsg += ' — ' + (await response.text()).slice(0, 200);
    }
    throw new Error(errMsg);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (buffer.length === 0) {
    throw new Error('Aucun audio reçu');
  }

  await fs.writeFile(mp3Path, buffer);

  return { mp3: `/temp/audio/${fileId}.mp3`, path: mp3Path };
}