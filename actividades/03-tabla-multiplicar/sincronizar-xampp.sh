#!/bin/bash
# Copia esta carpeta a htdocs/tabla, para probarla en Apache.
#
# Hace falta copiar en vez de enlazar: Apache corre como usuario «daemon» y
# no tiene permiso para entrar a /Users/<usuario>/Documents, así que un
# enlace simbólico devuelve «Error 403 — Acceso prohibido».
#
#   Uso:  ./sincronizar-xampp.sh
#   Luego: http://localhost/tabla/index.php?num=2

set -e

ORIGEN="$(cd "$(dirname "$0")" && pwd)"
DESTINO="/Applications/XAMPP/xamppfiles/htdocs/tabla"

rsync -a --delete \
      --exclude '.DS_Store' \
      --exclude 'sincronizar-xampp.sh' \
      "$ORIGEN/" "$DESTINO/"

# El usuario «daemon» necesita poder leer los archivos y entrar a las carpetas.
chmod -R a+rX "$DESTINO"

echo "Copiado a $DESTINO"
echo "Abre: http://localhost/tabla/index.php?num=2"
