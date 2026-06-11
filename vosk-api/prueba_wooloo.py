

# Diccionarios de ambigüedad
ambiguas_español = {
    "banco": ["institución económica", "asiento"],
    "mono": ["animal", "prenda de vestir", "adjetivo cariñoso"],
    "vela": ["objeto de cera con mecha", "acto religioso/funeral"]
}

ambiguas_criollo = {
    "kay": ["casa", "hogar", "edificio"],
    "lekòl": ["escuela", "institución", "clases", "horario"],
    "pase": ["aprobar", "promover", "pasar", "planchar"],
    "lage": ["soltar", "dejar caer", "abandonar"],
    "ranmase": ["recoger", "juntar", "retirar"],
    "pòte": ["llevar", "traer", "vestir"],
    "gwo": ["grande", "gordo", "embarazada", "grave"],
    "tande": ["oír", "escuchar", "obedecer"],
    "moun": ["persona", "gente", "individuo"]
}


def detectar_ambiguas(diccionario, frase):
    palabras = frase.lower().split()
    ambiguas = {}
    for palabra in palabras:
        if palabra in diccionario:
            ambiguas[palabra] = diccionario[palabra]
    return ambiguas


def preguntar_opciones(ambiguas):
    elecciones = {}
    for palabra, opciones in ambiguas.items():
        print(f"{palabra}:")
        i = 1
        for opcion in opciones:
            print(f"[{i}] {opcion}")
            i += 1
        eleccion = int(input("Elige una opción: "))
        elecciones[palabra] = opciones[eleccion-1]
    return elecciones


def Verificacion(frase):

    # Paso 1: detectar palabras ambiguas en español
    ambiguas_es = detectar_ambiguas(ambiguas_español, frase)

    # Paso 2: preguntar qué significado quiere de cada palabra
    elecciones_es = preguntar_opciones(ambiguas_es)

    # Paso 3: traducir al criollo (simulado)
    traduccion = input("Traducción al criollo: ")

    # Paso 4: traducir de manera inversa al español
    traduccion_inversa = input("Traducción inversa al español: ")

    # Paso 5: detectar palabras en español que no cumplen con el significado elegido y advertir
    for palabra, significado in elecciones_es.items():
        if significado not in traduccion_inversa:
            print(f"La palabra '{palabra}' no se tradujo correctamente ({significado}). Sea más específico.")

    # Paso 6: detectar palabras ambiguas en el criollo y advertir
    ambiguas_cr = detectar_ambiguas(ambiguas_criollo, traduccion)
    elecciones_cr = preguntar_opciones(ambiguas_cr)
    for palabra, significado in elecciones_cr.items():
        if significado not in traduccion_inversa:
            print(f"Cuidado: '{palabra}' es ambigua en criollo ({significado}). Sea más específico.")

    return traduccion


def main():
    frase = input("Introduce una frase en español: ")
    resultado = Verificacion(frase)
    


if __name__ == "__main__":
    main()
