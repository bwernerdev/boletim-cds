"""Gera app/imagens.js com todas as imagens de imagens/ embutidas em base64.

As imagens ficam dentro de um .js para que a página funcione abrindo o
index.html direto do disco (file://) e para que o boletim exportado saia
como um arquivo HTML único, sem pastas ao lado.

Uso (na raiz do projeto):
    python ferramentas/gerar_imagens_js.py
"""
import base64
import json
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
TIPOS = {".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg"}


def main() -> None:
    imagens = {}
    for arq in sorted((RAIZ / "imagens").iterdir()):
        tipo = TIPOS.get(arq.suffix.lower())
        if not tipo:
            continue
        dados = base64.b64encode(arq.read_bytes()).decode("ascii")
        imagens[arq.stem] = f"data:{tipo};base64,{dados}"

    destino = RAIZ / "app" / "imagens.js"
    corpo = json.dumps(imagens, indent=1)
    destino.write_text(
        "// Arquivo gerado por ferramentas/gerar_imagens_js.py. Não editar à mão.\n"
        f"window.IMAGENS = {corpo};\n",
        encoding="utf-8",
    )
    print(f"{len(imagens)} imagens -> {destino} ({destino.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
