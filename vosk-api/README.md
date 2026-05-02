# Vosk API (Flask)

API de voz a texto en espanol usando Vosk.

## Endpoints

- `GET /health`
- `POST /transcribe`

Body esperado para `POST /transcribe`:

```json
{
  "audio": "BASE64_WAV_PCM_16BIT_MONO"
}
```

Respuesta:

```json
{
  "text": "texto transcrito"
}
```

## Ejecutar local

1. Crear entorno virtual:

```bash
python -m venv .venv
```

2. Activar entorno:

- Windows PowerShell:

```bash
.venv\Scripts\Activate.ps1
```

3. Instalar dependencias:

```bash
pip install -r requirements.txt
```

4. Ejecutar:

```bash
python app.py
```

El servidor quedara en `http://localhost:3000`.

## Deploy en Render

- Usa la carpeta `vosk-api` como Root Directory.
- Build Command: `pip install -r requirements.txt`
- Start Command: `python app.py`

## Integracion con app Expo

En `app-traductor/servis/vozATexto.native.ts` cambia:

```ts
const VOZ_A_TEXTO_ENDPOINT = 'https://TU-APP.onrender.com/transcribe';
```

por la URL publica real de tu API.
