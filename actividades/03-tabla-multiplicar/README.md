# Actividad 3 — Tabla de multiplicar con PHP

Script en PHP que recibe un número por la URL y devuelve su tabla de
multiplicar generada en el servidor.

```
http://localhost/tabla/index.php?num=2
```

## Archivos

| Archivo | Para qué es |
|---|---|
| `index.php` | El entregable. Necesita Apache con PHP (XAMPP). |
| `ficha.html` + `js/ficha.js` | Misma tabla resuelta en el navegador, para poder revisar la actividad desde el portafolio publicado, donde no hay PHP. |
| `css/estilos.css` | Estilos compartidos por los dos. |
| `img/logo-unach.png` | Copia local del logo, para que la carpeta funcione suelta dentro de `htdocs`. |
| `sincronizar-xampp.sh` | Copia la carpeta a `htdocs/tabla`. Solo es utilería; no forma parte de la práctica. |

## Cómo correrlo en XAMPP

1. Abrir el panel de XAMPP e iniciar **Apache**.
2. Copiar esta carpeta a `htdocs` con el nombre `tabla`:

   ```bash
   ./sincronizar-xampp.sh
   ```

   Equivale a `cp -R` de la carpeta a
   `/Applications/XAMPP/xamppfiles/htdocs/tabla`. Hay que volver a correrlo
   cada vez que se edite algo aquí.
3. Abrir <http://localhost/tabla/index.php?num=2>.

### Por qué una copia y no un enlace simbólico

Apache corre como el usuario `daemon`, que no tiene permiso para entrar a
`/Users/<usuario>` (`drwxr-x---`) ni a `Documents` (`drwx------`). Un enlace
simbólico desde `htdocs` hacia el repositorio apunta a un destino que ese
usuario no puede leer, y el navegador responde:

```
Error 403 — ¡Acceso prohibido!
AH00037: Symbolic link not allowed or link target not accessible
```

Por eso lo que vive en `htdocs` es una copia de verdad.

## Parámetros

| Parámetro | Obligatorio | Valores | Por omisión |
|---|---|---|---|
| `num` | sí | entero de −1000 a 1000 | — |
| `hasta` | no | entero de 1 a 20 | 10 |

Sin `num` la página muestra solo el formulario. Si `num` no es un entero o se
sale del rango, aparece el aviso correspondiente y no se genera la tabla.

## Lo que hace el script

`$_GET` es el arreglo superglobal donde PHP deja los parámetros de la URL,
usando como llave el nombre que va antes del `=`:

```php
$numeroCrudo = isset($_GET['num']) ? trim($_GET['num']) : '';
```

`isset()` evita el aviso *Undefined array key* cuando la página se abre sin
parámetros. Como todo lo que llega por la URL es texto —y lo escribe quien sea
desde la barra de direcciones—, el valor pasa por `filter_var()` con
`FILTER_VALIDATE_INT` antes de usarse en la multiplicación, y todo lo que se
imprime pasa por `htmlspecialchars()`.

El ciclo arma un arreglo `$filas` y la plantilla HTML solo lo recorre, para no
mezclar el cálculo con las etiquetas.

El formulario de la página usa `method="get"`, así que al enviarlo es el propio
navegador el que construye la URL con `?num=...&hasta=...`.
