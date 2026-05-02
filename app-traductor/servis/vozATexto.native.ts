import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system';

const VOZ_A_TEXTO_ENDPOINT = 'https://proyecto-inf276-traductor.onrender.com';

type TranscribeApiResponse = {
  text?: string;
  error?: string;
};

export function TextoAVoz(texto: string) {
  if (!texto) return;
  Speech.speak(texto);
}

export async function vozATexto(audioUri: string) {
  if (!audioUri) {
    throw new Error('Falta la ruta del audio para transcribir.');
  }

  const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
    encoding: 'base64',
  });

  const response = await fetch(VOZ_A_TEXTO_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audio: audioBase64 }),
  });

  const data = (await response.json()) as TranscribeApiResponse;

  if (!response.ok) {
    throw new Error(
      data?.error ||
        `Error ${response.status} al transcribir audio. Revisa URL del servidor y formato WAV PCM 16-bit mono.`
    );
  }

  return (data?.text || '').trim();
}
