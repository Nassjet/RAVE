import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useDispatch } from 'react-redux';
import { setIP, setPort } from '../store/redux';


// fonction qui envoie une requete de connexion (promise) avec 10 s max d'attente
const fetchConnexion = (url, options = {}, timeout = 10000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), timeout);
    })
  ]);
};

export default function HomeScreen() {
  const [ipInput, setIpInput] = useState('');
  const [portInput, setPortInput] = useState('');
  const [loading, setLoading] = useState(false); 
  const [connectionStatus, setConnectionStatus] = useState('');

  const dispatch = useDispatch();

  const handleConnect = async () => {
    setLoading(true);
    setConnectionStatus('');
    const cleanedIp = ipInput.trim(); // trim() pour supp les espaces
    const cleanedPort = portInput.trim();
    const url = `http://${cleanedIp}:${cleanedPort}/`; // formatage de l'url à laquelle on envoit une requête

    try {
      const response = await fetchConnexion(url);
      const text = await response.text();

      if (text.toLowerCase().includes('connection success')) { //l'api renvoit ce message quand on se connecte 
        setConnectionStatus('✅ Connexion réussie'); 
        dispatch(setIP(cleanedIp));
        dispatch(setPort(cleanedPort));
      } else {
        setConnectionStatus('⚠️ Réponse inattendue du serveur');
      }
    } catch (error) {
      console.error(error);
      if (error.message === 'Timeout') {
        setConnectionStatus('⏳ Délai dépassé (10s)');
      } else {
        setConnectionStatus('❌ Impossible de contacter le serveur');
      }
    } finally {
      setLoading(false);
    }
  };
  // TouchableWithoutFeedback permet de faire disparaitre le clavier quand on tap en dehors des zones de texte. 
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.label}>Adresse IP du serveur</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 192.168.1.42"
          value={ipInput}
          onChangeText={setIpInput}
        />

        <Text style={styles.label}>Port</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 5000"
          value={portInput}
          onChangeText={setPortInput}
        />

        <Button
          title={loading ? "Connexion en cours..." : "Se connecter"}
          onPress={handleConnect}
          disabled={loading}
        />

        {loading && <ActivityIndicator style={styles.loader} size="large" />}
        {connectionStatus !== '' && (
          <Text style={styles.statusText}>{connectionStatus}</Text>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    padding: 10,
    borderRadius: 6,
    fontSize: 16,
  },
  loader: {
    marginTop: 15,
  },
  statusText: {
    marginTop: 15,
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
});