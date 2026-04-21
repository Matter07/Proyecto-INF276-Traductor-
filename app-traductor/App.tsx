import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';



export default function App() {
  const [texto, setTexto] = useState('');
  const [resultado, setResultado] = useState('');
  const [cargando, setCargando] = useState(false);

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

      const datos = await respuesta.json();
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
      <Text style={styles.titulo}>Traductor Español - Haitiano</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Escribe algo en español..."
        onChangeText={setTexto}
        value={texto}
      />

      <TouchableOpacity style={styles.boton} onPress={TraducirTexto}>
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