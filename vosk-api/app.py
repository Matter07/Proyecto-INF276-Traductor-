import base64
import io
import json
import os
import re
import subprocess
import tempfile
import wave
import zipfile
from pathlib import Path

import requests
from flask import Flask, jsonify, request
from flask_cors import CORS
from vosk import KaldiRecognizer, Model, SetLogLevel

MODEL_URL = os.getenv(
    "VOSK_MODEL_URL",
    "https://alphacephei.com/vosk/models/vosk-model-small-es-0.42.zip",
)
MODEL_ROOT = Path(os.getenv("VOSK_MODEL_ROOT", "./models"))
DOWNLOAD_TIMEOUT = 120

app = Flask(__name__)
CORS(app)

SetLogLevel(-1)


def _download_model_if_missing() -> Path:
    MODEL_ROOT.mkdir(parents=True, exist_ok=True)

    for folder in MODEL_ROOT.iterdir():
        if folder.is_dir() and folder.name.startswith("vosk-model"):
            return folder

    zip_path = MODEL_ROOT / "model.zip"
    with requests.get(MODEL_URL, stream=True, timeout=DOWNLOAD_TIMEOUT) as response:
        response.raise_for_status()
        with open(zip_path, "wb") as target:
            for chunk in response.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    target.write(chunk)

    with zipfile.ZipFile(zip_path, "r") as archive:
        archive.extractall(MODEL_ROOT)

    zip_path.unlink(missing_ok=True)

    for folder in MODEL_ROOT.iterdir():
        if folder.is_dir() and folder.name.startswith("vosk-model"):
            return folder

    raise RuntimeError("No se encontro un modelo Vosk valido luego de descargar.")


def _clean_base64_audio(data: str) -> bytes:
    cleaned = re.sub(r"^data:audio\/[^;]+;base64,", "", data)
    return base64.b64decode(cleaned)


def _to_wav_pcm(audio_bytes: bytes) -> bytes:
    """Convierte cualquier formato de audio a WAV PCM 16-bit mono 16000 Hz usando ffmpeg."""
    with tempfile.NamedTemporaryFile(suffix='.audio', delete=False) as src:
        src.write(audio_bytes)
        src_path = src.name
    dst_path = src_path + '.wav'
    try:
        subprocess.run(
            ['ffmpeg', '-y', '-i', src_path,
             '-ar', '16000', '-ac', '1', '-f', 'wav', dst_path],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        with open(dst_path, 'rb') as f:
            return f.read()
    finally:
        os.unlink(src_path)
        if os.path.exists(dst_path):
            os.unlink(dst_path)


def _transcribe_wav_bytes(audio_bytes: bytes) -> str:
    wav_bytes = _to_wav_pcm(audio_bytes)
    with wave.open(io.BytesIO(wav_bytes), "rb") as wav_file:
        sample_rate = wav_file.getframerate()
        recognizer = KaldiRecognizer(model, sample_rate)
        recognizer.SetWords(False)

        while True:
            data = wav_file.readframes(4000)
            if len(data) == 0:
                break
            recognizer.AcceptWaveform(data)

        final_result = json.loads(recognizer.FinalResult())
        return (final_result.get("text") or "").strip()


model_path = _download_model_if_missing()
model = Model(str(model_path))


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True, "model": model_path.name})


@app.route("/transcribe", methods=["POST"])
def transcribe():
    payload = request.get_json(silent=True) or {}
    audio_base64 = payload.get("audio")

    if not audio_base64:
        return jsonify({"error": "Falta el campo 'audio' en el body JSON."}), 400

    try:
        audio_bytes = _clean_base64_audio(audio_base64)
        text = _transcribe_wav_bytes(audio_bytes)
        return jsonify({"text": text})
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": f"Error interno: {exc}"}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", "3000"))
    app.run(host="0.0.0.0", port=port)
