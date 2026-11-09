/* ============================================================
   Cálculo del RFC de una persona física (13 caracteres)

     GODE 561231 GR 8
     │    │      │  └─ dígito verificador
     │    │      └──── homoclave (2 caracteres)
     │    └─────────── fecha de nacimiento AAMMDD
     └──────────────── 4 letras tomadas del nombre

   Sigue las reglas del instructivo del SAT: se quitan artículos y
   preposiciones de los apellidos, se omite JOSÉ / MARÍA cuando la
   persona tiene más de un nombre y se sustituyen las palabras
   altisonantes.
   ============================================================ */

const PARTICULAS = [
    'DA', 'DAS', 'DE', 'DEL', 'DER', 'DI', 'DIE', 'DD', 'EL', 'LA', 'LAS',
    'LE', 'LES', 'LOS', 'MAC', 'MC', 'VAN', 'VON', 'Y'
]

const NOMBRES_COMUNES = ['JOSE', 'J', 'MARIA', 'MA']

const ALTISONANTES = [
    'BUEI', 'BUEY', 'CACA', 'CACO', 'CAGA', 'CAGO', 'CAKA', 'CAKO', 'COGE',
    'COJA', 'COJE', 'COJI', 'COJO', 'CULO', 'FETO', 'GUEY', 'JOTO', 'KACA',
    'KACO', 'KAGA', 'KAGO', 'KAKA', 'KOGE', 'KOJO', 'KULO', 'MAME', 'MAMO',
    'MEAR', 'MEAS', 'MEON', 'MION', 'MOCO', 'MULA', 'PEDA', 'PEDO', 'PENE',
    'PUTA', 'PUTO', 'QULO', 'RATA', 'RUIN'
]

const VOCALES = 'AEIOU'

// Mayúsculas, sin acentos ni signos. La Ñ se conserva porque el SAT la acepta.
export function limpiar(texto = '') {
    return texto
        .toUpperCase()
        .replace(/[ÁÀÄÂ]/g, 'A')
        .replace(/[ÉÈËÊ]/g, 'E')
        .replace(/[ÍÌÏÎ]/g, 'I')
        .replace(/[ÓÒÖÔ]/g, 'O')
        .replace(/[ÚÙÜÛ]/g, 'U')
        .replace(/[^A-ZÑ& ]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
}

function sinParticulas(texto) {
    const palabras = limpiar(texto).split(' ').filter(Boolean)
    const utiles = palabras.filter(p => !PARTICULAS.includes(p))
    return (utiles.length ? utiles : palabras).join(' ')
}

function nombreParaClave(nombre) {
    const palabras = sinParticulas(nombre).split(' ').filter(Boolean)
    if (palabras.length > 1 && NOMBRES_COMUNES.includes(palabras[0])) {
        palabras.shift()
    }
    return palabras.join(' ')
}

function primeraVocalInterna(palabra) {
    for (let i = 1; i < palabra.length; i++) {
        if (VOCALES.includes(palabra[i])) return palabra[i]
    }
    return 'X'
}

function letrasDelNombre(nombre, paterno, materno) {
    const ap = sinParticulas(paterno).replace(/ /g, '')
    const am = sinParticulas(materno).replace(/ /g, '')
    const nm = nombreParaClave(nombre).replace(/ /g, '')

    let clave
    if (!ap || !am) {
        // Un solo apellido: dos letras del apellido y dos del nombre
        const unico = ap || am
        clave = unico.slice(0, 2) + nm.slice(0, 2)
    } else if (ap.length <= 2) {
        // Apellido paterno de una o dos letras
        clave = ap[0] + am[0] + nm.slice(0, 2)
    } else {
        clave = ap[0] + primeraVocalInterna(ap) + am[0] + nm[0]
    }

    clave = clave.padEnd(4, 'X')
    if (ALTISONANTES.includes(clave)) clave = clave.slice(0, 3) + 'X'
    return clave
}

function fechaAAMMDD(fecha) {
    const aa = String(fecha.getFullYear()).slice(-2)
    const mm = String(fecha.getMonth() + 1).padStart(2, '0')
    const dd = String(fecha.getDate()).padStart(2, '0')
    return aa + mm + dd
}

// --- Homoclave -------------------------------------------------------------
// Cada carácter del nombre completo se cambia por un número de dos dígitos;
// la suma de productos de esa cadena da un número del que se toman los
// tres últimos dígitos y se convierten a base 34.

const TABLA_HOMOCLAVE = '123456789ABCDEFGHIJKLMNPQRSTUVWXYZ'

function valorHomoclave(c) {
    if (c === ' ') return '00'
    if (c === '&') return '10'
    if (c === 'Ñ') return '40'
    if (c <= 'I') return String(c.charCodeAt(0) - 54) // A=11 … I=19
    if (c <= 'R') return String(c.charCodeAt(0) - 53) // J=21 … R=29
    return String(c.charCodeAt(0) - 51)               // S=32 … Z=39
}

function homoclave(nombre, paterno, materno) {
    const completo = limpiar(`${paterno} ${materno} ${nombre}`)
    const cadena = '0' + [...completo].map(valorHomoclave).join('')

    let suma = 0
    for (let i = 0; i < cadena.length - 1; i++) {
        suma += Number(cadena.slice(i, i + 2)) * Number(cadena[i + 1])
    }

    const tres = suma % 1000
    return TABLA_HOMOCLAVE[Math.floor(tres / 34)] + TABLA_HOMOCLAVE[tres % 34]
}

// --- Dígito verificador (módulo 11) ----------------------------------------

const TABLA_VERIFICADOR = '0123456789ABCDEFGHIJKLMN&OPQRSTUVWXYZ Ñ'

function digitoVerificador(rfc12) {
    let suma = 0
    for (let i = 0; i < 12; i++) {
        suma += TABLA_VERIFICADOR.indexOf(rfc12[i]) * (13 - i)
    }
    const residuo = suma % 11
    if (residuo === 0) return '0'
    const digito = 11 - residuo
    return digito === 10 ? 'A' : String(digito)
}

// --- API pública -----------------------------------------------------------

export function calcularRFC({ nombre, paterno, materno, fechaNacimiento }) {
    const base = letrasDelNombre(nombre, paterno, materno) + fechaAAMMDD(fechaNacimiento)
    const conHomoclave = base + homoclave(nombre, paterno, materno)
    return conHomoclave + digitoVerificador(conHomoclave)
}
