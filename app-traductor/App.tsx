import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Platform, Alert, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

/*wooloo : Para la funcion de voz a texto, tube que separalo si es que lo compila en web o en movil,
  porque expo-speech-recognition no es compatible con web y el programa se ponia a llorar
  si lo importaba en este archivo
*/
const { TextoAVoz, vozATexto } =
  Platform.OS === 'web'
    ? require('./servis/vozATexto.web')
    : require('./servis/vozATexto.native');

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
  
  //wooloo: estados para la grabacion de voz
  const [grabando, setGrabando] = useState<boolean>(false);
  const [transcribiendo, setTranscribiendo] = useState<boolean>(false);
  const grabacionRef = useRef<Audio.Recording | null>(null);

  const idiomaOrigen = "Español";
  const idiomaDestino = "Creolle";

  const TraducirTexto = async () => {
    if (!texto) return;

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
      if (datos[0] && datos[0].translations) {
        setResultado(datos[0].translations[0].text);
      }
    } catch (error) {
      console.error("Error en la traducción:", error);
      setResultado("Error al conectar con la API");
    } finally {
      setCargando(false);
    }
  };

  //wooloo: función para manejar la grab
  const toggleHablar = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('No disponible en web', 'La grabacion por microfono esta habilitada solo en movil.');
      return;
    }

    try {
      if (!grabando) {
        const permiso = await Audio.requestPermissionsAsync();
        if (!permiso.granted) {
          Alert.alert('Permiso requerido', 'Debes permitir acceso al microfono para usar Hablar.');
          return;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const recording = new Audio.Recording();
        await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        await recording.startAsync();
        grabacionRef.current = recording;
        setGrabando(true);
        return;
      }

      const recording = grabacionRef.current;
      if (!recording) {
        setGrabando(false);
        return;
      }

      setGrabando(false);
      setTranscribiendo(true);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      grabacionRef.current = null;

      if (!uri) {
        Alert.alert('Error', 'No se encontro el audio grabado.');
        return;
      }

      const textoTranscrito = await vozATexto(uri);
      if (textoTranscrito) {
        setTexto(textoTranscrito);
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo convertir tu voz a texto.';
      Alert.alert('Error de voz a texto', mensaje);
    } finally {
      setTranscribiendo(false);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
    }
  };
  // wooloo :aqui paraaaaaaaaaaaaaa
  //Rukasu Nota: copia al portapapeleeees
  const copiarAlPortapapeles = async () => {
    if (resultado){
      await Clipboard.setStringAsync(resultado);
      Alert.alert('Copiado', 'El texto ha sido copiado al portapapeles.');
    }
  };

  
//Rukasu nota: cambie los botones de microfono y salida de audio y agregué un titulo
  return (
      <View style={styles.container}>
        <Text style={styles.titulo}>CREO-ÑOL</Text>
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
        <TouchableOpacity
          style={styles.botonCircular}
          onPress={toggleHablar}
          disabled={cargando || transcribiendo}
        >
          {transcribiendo ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Ionicons 
              name={grabando ? "mic-off" : "mic"} 
              size={30} 
              color="#ffffff" 
            />
          )}
        </TouchableOpacity>


        <TouchableOpacity style={styles.boton} onPress={TraducirTexto} disabled={cargando}>
          {cargando ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.textoBoton}>Traducir</Text>}
        </TouchableOpacity>

        {resultado ? (
          <>
            <View style={styles.contenedorResultado}>
              <Text style={styles.label}>Traducción:</Text>
              <ScrollView 
              style={{ maxHeight: 50 }}
              showsVerticalScrollIndicator={true}
              persistentScrollbar={true}
              >
                <Text style={styles.textoResultado}>{resultado}</Text>
              </ScrollView>
            </View>

            <View style={styles.cuadroidiomadestino}>
              <Text style={styles.textoidioma}>Traduciendo a: {idiomaDestino}</Text>
            </View>

            {/* wooloo: botón para escuchar la traducción en voz alta */}
            <View style={styles.contenedorBotones}>
              <TouchableOpacity style={styles.botonCircular} onPress={() => TextoAVoz(resultado)}>
                <Ionicons name="volume-high" size={30} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonCircular} onPress={copiarAlPortapapeles}>
                <Ionicons name="copy-outline" size={30} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </>
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
    backgroundColor: '#fff176',
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

  titulo:{
    fontSize: 30,
    fontWeight: 'bold',
    color: '#822300',
    marginBottom: 25,
    textAlign: 'center',
    fontFamily: 'Comic Sans MS',
  },
  textoidioma: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },

  cuadroidiomadestino: {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#ffb347',
    marginTop: 10,
    alignItems: 'flex-end'
  },
  input:{
    width: '100%',
    minHeight: 70,
    backgroundColor: '#fff5c6',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#fff5c6',
    marginBottom: 10,
    textAlignVertical: 'top'
  },
  boton: {
    width: '100%',
    height: 50,
    backgroundColor: '#ad520d',
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
    backgroundColor: '#421a00',
    borderRadius: 8,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#421a00',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
  },

  botonCircular:{
    width: 60,
    height: 60,
    backgroundColor: '#ad520d',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,

  },
  contenedorBotones: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 15,
  },

  
  label: {
    fontSize: 12,
    color: '#ffffff',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  textoResultado: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500'
  }
});
