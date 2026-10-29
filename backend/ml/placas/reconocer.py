"""Lee una foto de placa con el YOLO exportado y escribe un JSON en stdout.

El peso se entrenó con caracteres sueltos. Aquí se recorta la placa (fondo
amarillo peruano), se ignora la franja PERU y se lee cada dígito en una ventana.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path

os.environ.setdefault("YOLO_VERBOSE", "False")

CARPETA = Path(__file__).resolve().parent
CARPETA_MODELOS = CARPETA / "modelos"
CANDIDATOS = ("best.pt", "best.onnx", "placa.pt", "yolo.pt")


def emitir(payload: dict) -> None:
    sys.stdout.write(json.dumps(payload, ensure_ascii=False) + "\n")
    sys.stdout.flush()


def localizar_modelo(indicado: str | None) -> Path | None:
    if indicado:
        ruta = Path(indicado)
        return ruta if ruta.is_file() else None
    for nombre in CANDIDATOS:
        ruta = CARPETA_MODELOS / nombre
        if ruta.is_file():
            return ruta
    return None


def formatear_placa(texto: str) -> str | None:
    limpio = re.sub(r"[^A-Z0-9]", "", (texto or "").upper())
    if len(limpio) >= 6:
        return f"{limpio[:3]}-{limpio[3:6]}"
    if len(limpio) == 5:
        return f"{limpio[:3]}-{limpio[3:]}"
    return None


def filtrar_solapes(piezas: list) -> list:
    piezas.sort(key=lambda p: p[0])
    out = []
    for pieza in piezas:
        if out:
            prev = out[-1]
            umbral = max((pieza[4] - pieza[3] + prev[4] - prev[3]) * 0.35, 4)
            if abs(pieza[0] - prev[0]) < umbral:
                if pieza[2] > prev[2]:
                    out[-1] = pieza
                continue
        out.append(pieza)
    return out


def caracteres_desde_cajas(resultado) -> tuple[str, float]:
    cajas = getattr(resultado, "boxes", None)
    nombres = getattr(resultado, "names", {}) or {}
    if cajas is None or len(cajas) == 0:
        return "", 0.0

    piezas = []
    for caja in cajas:
        xyxy = caja.xyxy[0].tolist()
        x1, _y1, x2, _y2 = xyxy
        x_centro = (x1 + x2) / 2
        clase = int(caja.cls[0])
        confianza = float(caja.conf[0])
        etiqueta = str(nombres.get(clase, clase)).strip().upper()
        if len(etiqueta) != 1 or not etiqueta.isalnum():
            continue
        piezas.append((x_centro, etiqueta, confianza, x1, x2))

    piezas = filtrar_solapes(piezas)
    texto = "".join(p[1] for p in piezas)
    media = sum(p[2] for p in piezas) / len(piezas) if piezas else 0.0
    return texto, media


def mejor_clase(resultado) -> tuple[str, float]:
    cajas = getattr(resultado, "boxes", None)
    nombres = getattr(resultado, "names", {}) or {}
    if cajas is None or len(cajas) == 0:
        return "", 0.0
    mejor = ("", 0.0)
    for caja in cajas:
        confianza = float(caja.conf[0])
        if confianza < mejor[1]:
            continue
        etiqueta = str(nombres.get(int(caja.cls[0]), "")).strip().upper()
        if len(etiqueta) == 1 and etiqueta.isalnum():
            mejor = (etiqueta, confianza)
    return mejor


def realzar(bgr):
    import cv2
    lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    l = cv2.createCLAHE(clipLimit=2.4, tileGridSize=(8, 8)).apply(l)
    return cv2.cvtColor(cv2.merge((l, a, b)), cv2.COLOR_LAB2BGR)


def recortar_placa(bgr):
    import cv2
    import numpy as np

    h, w = bgr.shape[:2]
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    amarillo = cv2.inRange(hsv, (8, 20, 70), (45, 255, 255))
    claro = cv2.inRange(hsv, (0, 0, 140), (50, 90, 255))
    mascara = cv2.bitwise_or(amarillo, claro)
    mascara = cv2.morphologyEx(mascara, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    mascara = cv2.morphologyEx(mascara, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))

    contornos, _ = cv2.findContours(mascara, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    mejor = None
    mejor_area = 0
    for contorno in contornos:
        x, y, cw, ch = cv2.boundingRect(contorno)
        area = cw * ch
        if area < (h * w * 0.03) or ch < 20 or cw < ch:
            continue
        ratio = cw / max(ch, 1)
        if ratio < 1.3 or ratio > 6:
            continue
        if area > mejor_area:
            mejor = (x, y, cw, ch)
            mejor_area = area

    if mejor is None:
        x, y, cw, ch = int(w * 0.08), int(h * 0.18), int(w * 0.84), int(h * 0.64)
    else:
        x, y, cw, ch = mejor
        pad_x = int(cw * 0.04)
        pad_y = int(ch * 0.08)
        x = max(0, x - pad_x)
        y = max(0, y - pad_y)
        cw = min(w - x, cw + pad_x * 2)
        ch = min(h - y, ch + pad_y * 2)

    placa = bgr[y:y + ch, x:x + cw]
    if placa.size == 0:
        return bgr
    # La franja PERU queda arriba; los dígitos van en el 70 % inferior.
    y0 = int(placa.shape[0] * 0.28)
    banda = placa[y0:, :]
    return banda if banda.size else placa


LETRA_SI = {"0": "O", "1": "I", "2": "Z", "4": "A", "5": "S", "6": "G", "8": "B"}
DIGITO_SI = {"O": "0", "D": "0", "Q": "0", "I": "1", "L": "1", "Z": "2", "A": "4", "S": "5", "G": "6", "T": "7", "B": "8"}


def forzar_formato_peru(texto: str) -> str:
    limpio = re.sub(r"[^A-Z0-9]", "", (texto or "").upper())
    if len(limpio) < 5:
        return limpio
    chars = list(limpio[:6].ljust(6))
    for i in range(3):
        chars[i] = LETRA_SI.get(chars[i], chars[i])
    for i in range(3, 6):
        chars[i] = DIGITO_SI.get(chars[i], chars[i])
    return "".join(chars)


def cuadrar_caracter(recorte, lado=128, fondo=(240, 240, 240)):
    import cv2
    import numpy as np

    if recorte is None or recorte.size == 0:
        return None
    h, w = recorte.shape[:2]
    if h < 4 or w < 2:
        return None
    escala = (lado * 0.78) / max(h, w)
    nh, nw = max(1, int(h * escala)), max(1, int(w * escala))
    pequeno = cv2.resize(recorte, (nw, nh), interpolation=cv2.INTER_CUBIC)
    lienzo = np.full((lado, lado, 3), fondo, dtype=np.uint8)
    y = (lado - nh) // 2
    x = (lado - nw) // 2
    lienzo[y:y + nh, x:x + nw] = pequeno
    return lienzo


def recortes_por_contorno(banda):
    import cv2
    import numpy as np

    h, w = banda.shape[:2]
    gris = cv2.cvtColor(banda, cv2.COLOR_BGR2GRAY)
    gris = cv2.GaussianBlur(gris, (3, 3), 0)
    _, binaria = cv2.threshold(gris, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    binaria = cv2.morphologyEx(binaria, cv2.MORPH_OPEN, np.ones((2, 2), np.uint8))
    contornos, _ = cv2.findContours(binaria, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cajas = []
    for contorno in contornos:
        x, y, cw, ch = cv2.boundingRect(contorno)
        if ch < h * 0.32 or cw < 3:
            continue
        if cw > w * 0.28 or ch > h * 0.98:
            continue
        if cw / max(ch, 1) > 1.15:
            continue
        pad = max(2, int(ch * 0.12))
        x0 = max(0, x - pad)
        y0 = max(0, y - pad)
        x1 = min(w, x + cw + pad)
        y1 = min(h, y + ch + pad)
        cajas.append((x0, y0, x1 - x0, y1 - y0))
    cajas.sort(key=lambda c: c[0])
    fusion = []
    for caja in cajas:
        if fusion and caja[0] < fusion[-1][0] + fusion[-1][2] * 0.55:
            if caja[2] * caja[3] > fusion[-1][2] * fusion[-1][3]:
                fusion[-1] = caja
            continue
        fusion.append(caja)
    if len(fusion) > 6:
        fusion = sorted(fusion, key=lambda c: c[2] * c[3], reverse=True)[:6]
        fusion.sort(key=lambda c: c[0])
    return [banda[y:y + ch, x:x + cw] for x, y, cw, ch in fusion]


def ventanas_caracteres(banda):
    import cv2

    h, w = banda.shape[:2]
    if h < 8 or w < 8:
        return []
    alto = max(h, 128)
    ancho = max(int(w * alto / h), alto * 3)
    banda = cv2.resize(banda, (ancho, alto), interpolation=cv2.INTER_CUBIC)
    h, w = banda.shape[:2]
    lado = h

    def tres(x0, x1):
        recortes = []
        span = max(x1 - x0, lado)
        for i in range(3):
            cx = int(x0 + (i + 0.5) * span / 3)
            x = max(0, min(w - lado, cx - lado // 2))
            recortes.append(banda[:, x:x + lado])
        return recortes

    return tres(0, int(w * 0.48)) + tres(int(w * 0.52), w)


def predecir_texto(modelo, imagen_bgr, imgsz, conf):
    import cv2

    rgb = cv2.cvtColor(imagen_bgr, cv2.COLOR_BGR2RGB)
    resultados = modelo.predict(source=rgb, imgsz=imgsz, conf=conf, verbose=False)
    if not resultados:
        return "", 0.0
    return caracteres_desde_cajas(resultados[0])


def clasificar_recortes(modelo, recortes):
    import cv2

    letras = []
    confs = []
    for recorte in recortes:
        lienzo = cuadrar_caracter(recorte)
        if lienzo is None:
            letras.append("")
            continue
        rgb = cv2.cvtColor(lienzo, cv2.COLOR_BGR2RGB)
        resultados = modelo.predict(source=rgb, imgsz=128, conf=0.05, verbose=False)
        if not resultados:
            letras.append("")
            continue
        simbolo, confianza = mejor_clase(resultados[0])
        letras.append(simbolo)
        if confianza:
            confs.append(confianza)
    texto = "".join(letras)
    media = sum(confs) / len(confs) if confs else 0.0
    return texto, media


def leer_por_caracteres(modelo, banda):
    candidatos = []
    blobs = recortes_por_contorno(banda)
    if blobs:
        candidatos.append(clasificar_recortes(modelo, blobs))
    candidatos.append(clasificar_recortes(modelo, ventanas_caracteres(banda)))
    if not candidatos:
        return "", 0.0
    return max(candidatos, key=lambda item: (len(re.sub(r"[^A-Z0-9]", "", item[0])), item[1]))


def reconocer(ruta_imagen: str, ruta_modelo: str) -> dict:
    import cv2
    from ultralytics import YOLO

    original = cv2.imread(ruta_imagen)
    if original is None:
        return {"ok": False, "placa": None, "confianza": None, "error": "No se pudo abrir la imagen"}

    modelo = YOLO(ruta_modelo)
    banda = realzar(recortar_placa(original))

    candidatos = []
    for imagen, imgsz, conf in (
        (banda, 640, 0.08),
        (original, 640, 0.08),
    ):
        texto, confianza = predecir_texto(modelo, imagen, imgsz, conf)
        candidatos.append((texto, confianza))

    texto_v, conf_v = leer_por_caracteres(modelo, banda)
    candidatos.append((texto_v, conf_v))

    texto, confianza = max(candidatos, key=lambda item: (len(re.sub(r"[^A-Z0-9]", "", item[0])), item[1]))
    texto = forzar_formato_peru(texto)
    placa = formatear_placa(texto)
    return {
        "ok": True,
        "placa": placa,
        "confianza": round(confianza, 4) if confianza else None,
        "texto": texto or "",
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Reconocer placa peruana con YOLO")
    parser.add_argument("--imagen", required=True)
    parser.add_argument("--modelo", default="")
    args = parser.parse_args()

    imagen = Path(args.imagen)
    if not imagen.is_file():
        emitir({"ok": False, "placa": None, "confianza": None, "error": "No se encontró la imagen"})
        return 0

    modelo = localizar_modelo(args.modelo or None)
    if modelo is None:
        emitir({"ok": False, "placa": None, "confianza": None, "error": "Sin modelo. Copia best.pt a ml/placas/modelos/"})
        return 0

    try:
        emitir(reconocer(str(imagen), str(modelo)))
    except Exception as error:
        emitir({"ok": False, "placa": None, "confianza": None, "error": str(error)})
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
