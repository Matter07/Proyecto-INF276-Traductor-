import * as Speech from 'expo-speech';

export const vozATextoDisponible = false;
export function getVozATexto() {
  return null;
}

type VozATextoHandlers = {
  onResult: (texto: string) => void;
  onEnd: () => void;
  onError: () => void;
};

export async function VozATexto(_handlers: VozATextoHandlers) {
  return false;
}

export function detenerVozATexto() {
  return;
}
export function TextoAVoz(texto: string) {
  if (!texto) return;
  Speech.speak(texto, { language: 'fr-FR' });
}
