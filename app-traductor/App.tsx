import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';

//Nota de 'Rukasu': por recomendación de un amigo mio, usare typescript para el frontend

interface Traduccion {
  text: string;
  to: string;
}

interface ResultadoTraduccion{
  translations: Traduccion[];
}


export default function App() {
  const [texto, setTexto] = useState<string>('');
  const [resultado, setResultado] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(false);

  const idiomaOrigen = "es";
  const idiomaDestino = "ht";

  const TraducirTexto = async () => {
    if(!texto) return;

    const apiKey = "";
    const region = "global"
    const endpoint = "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=es&to=ht"

    setCargando(true);

    try {
      const respuesta = await fetch(endpoint, {
        method: "POST",
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
          'Ocp-Apim-Subscription-Region': region,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{ text: texto }])
      });

      console.log("Status Code:", respuesta.status);

      if (!respuesta.ok) {
        const errorTexto = await respuesta.text(); // Leemos como texto plano para ver el error real
        console.error("Detalle del error de Azure:", errorTexto);
        setResultado(`Error ${respuesta.status}: ${errorTexto}`);
        setCargando(false);
        return; // Detenemos la ejecución aquí
      }

      //const datos = await respuesta.json();
      const datos: ResultadoTraduccion[] = await respuesta.json();
      if(datos[0] && datos[0].translations) {
        setResultado(datos[0].translations[0].text);
      }
    } catch (error) {
      console.error("Error en la traducción:", error);
      setResultado("Error al conectar con la API");
    } finally {
      setCargando(false);
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.cuadroidioma}>
        <Text style={styles.textoidioma}>idioma: {idiomaOrigen}</Text>
      </View>
      
      <TextInput
        style={styles.input}
        placeholder="Escribe algo en español..."
        onChangeText={setTexto}
        value={texto}
        multiline={true}
      />
      <View style={styles.cuadroidiomadestino}>
        <Text style={styles.textoidioma}>Traduciendo a: {idiomaDestino}</Text>
      </View>

      <TouchableOpacity style={styles.boton} onPress={TraducirTexto} disabled={cargando}>
        {cargando ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.textoBoton}>Traducir</Text>}
      </TouchableOpacity>

      {resultado ? (
        <View style={styles.contenedorResultado}>
          <Text style={styles.label}>Traducción:</Text>
          <Text style={styles.textoResultado}>{resultado}</Text>
        </View>
      ) : null}
    </View>
  );
}
/*
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', padding: 20},
  titulo: {fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#000000'},
  input: {width: '100%', height: 50, backgroundColor: '#ffffff', borderRadius: 10, paddingHorizontal: 15, borderWidth: 1, borderColor: '#000000', marginBottom: 20},
  boton: {width: '100%', height: 50, backgroundColor: '#000000', borderRadius: 10, alignItems: 'center', justifyContent: 'center'},
  textoBoton: {color: '#ffffff', fontSize: 18, fontWeight: '600'},
  contenedorResultado: {marginTop: 30, padding: 20, backgroundColor: '#ffffff', borderRadius: 10, width: '100%'},
  label: {fontSize: 14, color: '#666', marginBottom: 5},
  textoResultado: {fontSize: 18, color: '#000', fontWeight: '500'}
});

*/

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffee83',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  cuadroidioma: {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#ffb347',
    marginBottom: 10,
  },
  cuadroidiomadestino: {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#ffb347',
    marginBottom: 10,
    alignItems: 'flex-end'
  },
  input:{
    width: '100%',
    minheight: 50,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#cccccc',
    marginBottom: 10,
    textAlignVertical: 'top'
  },
  boton: {
    width: '100%',
    height: 50,
    backgroundColor: '#ff7f50',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  textoBoton: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contenedorResultado: {
    width: '100%',
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#cccccc',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  textoResultado: {
    fontSize: 18,
    color: '#000',
    fontWeight: '500'
  }
});
