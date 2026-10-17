#!/bin/bash
# Copia esta carpeta a htdocs/gestion-documentos, para probarla en Apache.
#
# Se copia en vez de enlazar porque Apache corre como el usuario «daemon»
# y no puede entrar a ~/Documents (un enlace simbólico da Error 403).
#
#   Uso:  ./sincronizar-xampp.sh            copia el código
#         ./sincronizar-xampp.sh --bd       además crea la base de datos
#                                           (¡borra los registros que haya!)
#   Luego: http://localhost/gestion-documentos/

set -e

ORIGEN="$(cd "$(dirname "$0")" && pwd)"
DESTINO="/Applications/XAMPP/xamppfiles/htdocs/gestion-documentos"
MYSQL="/Applications/XAMPP/xamppfiles/bin/mysql"

# Los PDF viven en MySQL, así que basta con copiar el código.
rsync -a --delete \
      --exclude '.DS_Store' \
      --exclude 'sincronizar-xampp.sh' \
      --exclude 'evidencias/' \
      --exclude '.vercel/' \
      "$ORIGEN/" "$DESTINO/"

# «daemon» necesita poder leer todo.
chmod -R a+rX "$DESTINO"

if [ "$1" = "--bd" ]; then
    "$MYSQL" -u root < "$ORIGEN/sql/gestion_documentos.sql"
    echo "Base de datos «gestion_documentos» creada con los datos de prueba."
fi

echo "Copiado a $DESTINO"
echo "Abre: http://localhost/gestion-documentos/"
