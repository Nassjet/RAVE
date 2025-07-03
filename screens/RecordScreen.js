import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { FlatList } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export default function RecordScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingRef = useRef(null);
  const soundRef = useRef(null);
  const intervalRef = useRef(null);

  // Formatage du temps (mm:ss)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Demander les permissions
  const requestPermissions = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissions requises', 'Cette application a besoin des permissions microphone');
      return false;
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    return true;
  };

  // Démarrer l'enregistrement
  const startRecording = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      // Arrêter tout son en cours
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // Préparer l'enregistrement
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      await recording.startAsync();

      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);

      // Mettre à jour le timer
      intervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Erreur démarrage enregistrement:', error);
      Alert.alert('Erreur', 'Impossible de démarrer l\'enregistrement');
    }
  };

  // Arrêter l'enregistrement
  const stopRecording = async () => {
    try {
      if (!recordingRef.current) return;

      clearInterval(intervalRef.current);
      await recordingRef.current.stopAndUnloadAsync();

      const uri = recordingRef.current.getURI();
      const fileName = `recording_${Date.now()}.m4a`;
      const newPath = `${FileSystem.documentDirectory}${fileName}`;

      // Déplacer le fichier vers un emplacement permanent
      await FileSystem.moveAsync({
        from: uri,
        to: newPath,
      });

      // Ajouter à la liste des enregistrements
      setRecordings(prev => [...prev, {
        uri: newPath,
        name: fileName,
        duration: recordingDuration,
      }]);

      setIsRecording(false);
      recordingRef.current = null;
    } catch (error) {
      console.error('Erreur arrêt enregistrement:', error);
      Alert.alert('Erreur', 'Impossible d\'arrêter l\'enregistrement');
    }
  };

  // Jouer un enregistrement
  const playRecording = async (uri) => {
    try {
      // Arrêter tout son en cours
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // Configurer et jouer
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const { sound } = await Audio.Sound.createAsync({ uri });
      soundRef.current = sound;
      await sound.playAsync();

      // Gérer la fin de lecture
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.didJustFinish) {
          await sound.unloadAsync();
          soundRef.current = null;
        }
      });

    } catch (error) {
      console.error('Erreur lecture:', error);
      Alert.alert('Erreur', 'Impossible de lire l\'enregistrement');
    }
  };
  const deleteRecording = async (uri, index) => {
    try {
      // Arrêter la lecture si c'est l'enregistrement en cours
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Supprimer le fichier
      await FileSystem.deleteAsync(uri, { idempotent: true });

      // Mettre à jour la liste
      setRecordings(prev => prev.filter((_, i) => i !== index));

    } catch (error) {
      console.error('Erreur suppression:', error);
      Alert.alert('Erreur', 'Impossible de supprimer l\'enregistrement');
    }
  };

  // Confirmation de suppression
  const confirmDelete = (uri, index) => {
    Alert.alert(
      'Supprimer l\'enregistrement',
      'Êtes-vous sûr de vouloir supprimer cet enregistrement ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          onPress: () => deleteRecording(uri, index),
          style: 'destructive',
        },
      ]
    );
  };

  // Nettoyer à la fin
  useEffect(() => {
    return () => {
      // Nettoyer les ressources
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enregistreur Audio</Text>

      <View style={styles.controls}>
        {!isRecording ? (
          <TouchableOpacity style={styles.button} onPress={startRecording}>
            <Text style={styles.buttonText}>Démarrer</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.recordingContainer}>
            <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={stopRecording}>
              <Text style={styles.buttonText}>Arrêter</Text>
            </TouchableOpacity>
            <Text style={styles.duration}>{formatTime(recordingDuration)}</Text>
          </View>
        )}
      </View>

      <View style={styles.recordings}>
        <Text style={styles.subtitle}>Enregistrements ({recordings.length})</Text>

        {recordings.length === 0 ? (
          <Text style={styles.empty}>Aucun enregistrement</Text>
        ) : (
          <FlatList
            data={recordings}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.recordingItem}>
                <View style={styles.recordingInfo}>
                  <Text style={styles.recordingName} numberOfLines={1}>
                    Enregistrement {index + 1}
                  </Text>
                  <Text style={styles.recordingDuration}>
                    {formatTime(item.duration)}
                  </Text>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.playButton]}
                    onPress={() => playRecording(item.uri)}
                  >
                    <Text style={styles.actionButtonText}>Écouter</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => confirmDelete(item.uri, index)}
                  >
                    <Text style={styles.actionButtonText}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#444',
  },
  controls: {
    marginBottom: 30,
    alignItems: 'center',
  },
  recordingContainer: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: 200,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  duration: {
    fontSize: 18,
    marginTop: 8,
    color: '#666',
  },
  recordings: {
    flex: 1,
    marginTop: 10,
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
    fontSize: 16,
  },
  recordingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
  },
  recordingText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
  },
  playButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 5,
    paddingHorizontal: 12,
  },
  playButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});
