# Modelo de placas (YOLO)

Entrenas el detector **en el otro proyecto**. Aquí solo se carga el peso exportado.

## Dónde va cada cosa

| Qué | Dónde |
| --- | --- |
| Peso `best.pt` | `ml/placas/modelos/best.pt` |
| Entorno Python `.venv` | `ml/placas/.venv` (**no** dentro de `modelos/`) |
| `requirements.txt` y `reconocer.py` | `ml/placas/` (ya están; no los muevas) |

## Una vez, en `backend/ml/placas`

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

El API (`POST /api/vehiculos/reconocer`) llama a `reconocer.py` si encuentra `modelos/best.pt`. Si no está, la cámara pide los dígitos a mano.

En **Docker** no hace falta el `.venv` local: la imagen ya trae Python, ultralytics y Torch CPU. El peso tiene que existir en el VPS (`ml/placas/modelos/best.pt`) o dentro de la imagen (`/opt/placas-modelo`). Si Git no subió el `.pt`, cópialo al servidor y reinicia el backend:

```bash
scp backend/ml/placas/modelos/best.pt usuario@vps:~/Proyecto-taller/backend/ml/placas/modelos/
docker compose restart backend
```

Comprueba `GET /api/salud` → `"modeloPlacas": true`.

Opcional en `backend/.env` (arranque sin Docker): `PYTHON=` ruta de `.venv\Scripts\python.exe`, `PLACA_MODELO=` ruta al `.pt`.
