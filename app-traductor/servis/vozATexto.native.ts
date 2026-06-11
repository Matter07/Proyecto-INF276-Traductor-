import * as Speech from 'expo-speech';
import { File } from 'expo-file-system';

const VOZ_A_TEXTO_ENDPOINT = 'https://proyecto-inf276-traductor.onrender.com/transcribe';

type RespuestaApiTranscripcion = {
  text?: string;
  error?: string;
};

const IDIOMAS_TTS_PRIORIDAD = ['ht-HT', 'fr-FR', 'es-ES'];
const VELOCIDAD_VOZ = 0.92;
const TONO_VOZ = 1.0;

type ConfiguracionVoz = {
  idioma: string;
  identificadorVoz?: string;
};

function coincideIdioma(codigoObjetivo: string, codigoVoz: string) {
  const objetivo = codigoObjetivo.toLowerCase();
  const voz = codigoVoz.toLowerCase();
  return voz === objetivo || voz.startsWith(`${objetivo.split('-')[0]}-`) || voz === objetivo.split('-')[0];
}

function seleccionarMejorVoz(voices: Awaited<ReturnType<typeof Speech.getAvailableVoicesAsync>>, idioma: string) {
  const vocesDelIdioma = voices.filter((voice) => coincideIdioma(idioma, voice.language || ''));
  if (vocesDelIdioma.length === 0) return null;

  return vocesDelIdioma.find((voice) => voice.quality === Speech.VoiceQuality.Enhanced) || vocesDelIdioma[0];
}

async function construirConfiguracionesTts() {
  const configuraciones: ConfiguracionVoz[] = [];

  try {
    const voices = await Speech.getAvailableVoicesAsync();
    for (const idioma of IDIOMAS_TTS_PRIORIDAD) {
      const voz = seleccionarMejorVoz(voices, idioma);
      if (!voz) continue;

      configuraciones.push({
        idioma,
        identificadorVoz: voz.identifier,
      });
    }
  } catch {
    return [];
  }

  return configuraciones;
}

export async function TextoAVoz(texto: string) {
  if (!texto) return;
  const configuraciones = await construirConfiguracionesTts();

  const hablarConRespaldo = (indice: number) => {
    if (indice >= configuraciones.length) {
      Speech.speak(texto, {
        rate: VELOCIDAD_VOZ,
        pitch: TONO_VOZ,
      });
      return;
    }

    const configuracion = configuraciones[indice];
    Speech.speak(texto, {
      language: configuracion.idioma,
      voice: configuracion.identificadorVoz,
      rate: VELOCIDAD_VOZ,
      pitch: TONO_VOZ,
      onError: () => hablarConRespaldo(indice + 1),
    });
  };

  hablarConRespaldo(0);
}

export async function vozATexto(audioUri: string) {
  if (!audioUri) throw new Error('Falta la ruta del audio para transcribir.');

  const audioFile = new File(audioUri);
  const audioBase64 = await audioFile.base64();

  const response = await fetch(VOZ_A_TEXTO_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audio: audioBase64 }),
  });

  const data = (await response.json()) as RespuestaApiTranscripcion;
  if (!response.ok) throw new Error(data?.error || `Error ${response.status} al transcribir audio.`);
  return (data?.text || '').trim();
}
