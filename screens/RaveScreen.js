import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, useWindowDimensions, ActivityIndicator } from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';
import { useSelector } from 'react-redux';
import { Audio } from 'expo-av';
import TypeSounds from '../components/TypeSounds';
import * as FileSystem from 'expo-file-system';

const DefaultSoundRoute = () => (
  <View style={styles.tabContent}>
    <Text>Son par défaut (assets)</Text>
  </View>
);

const RecordingsRoute = ({ onSelect }) => {
  const clips = useSelector((state) => state.audio.clips);
  const { ip, port } = useSelector((state) => state.server);

  const [selectedClip, setSelectedClip] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [transformedUri, setTransformedUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const soundRef = useRef(null); // Ajout de la référence pour le son

  const playRecording = async (uri) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync({ uri });
      soundRef.current = sound;
      await sound.playAsync();

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

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

  // 1. Fonction pour sélectionner le modèle sur le serveur
  const selectModelOnServer = async (baseUrl, modelName) => {
    const response = await fetch(`${baseUrl}/selectModel/${modelName}`, {
      method: 'GET'
    });
    if (!response.ok) throw new Error('Échec sélection modèle');
    return response;
  };

  // 2. Fonction pour uploader le fichier audio
  const uploadAudioFile = async (baseUrl, fileUri) => {
    const uploadResponse = await FileSystem.uploadAsync(
      `${baseUrl}/upload`,
      fileUri,
      {
        fieldName: "file",
        httpMethod: "POST",
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        headers: {
          filename: selectedClip.name // Gardez le nom original
        }
      }
    );
    return uploadResponse;
  };

  // 3. Fonction pour créer un dossier de destination
  const createOutputDirectory = async () => {
    const downloadDir = `${FileSystem.documentDirectory}transformed`;
    await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
    return downloadDir;
  };

  // 4. Fonction pour télécharger le résultat transformé
  const downloadTransformedAudio = async (baseUrl, downloadDir) => {
    const downloadPath = `${downloadDir}/${Date.now()}_output.wav`;
    const downloadRes = await FileSystem.downloadAsync(
      `${baseUrl}/download`,
      downloadPath
    );
    return downloadRes.uri;
  };

  // 5. Fonction principale recomposée
  const handleTransform = async () => {
    if (!selectedClip || !selectedModel) return;

    try {
      setLoading(true);
      setTransformedUri(null);

      const baseUrl = `http://${ip}:${port}`;

      // 1. Sélection du modèle
      await selectModelOnServer(baseUrl, selectedModel);

      // 2. Upload du fichier
      await uploadAudioFile(baseUrl, selectedClip.uri, selectedClip.name);

      // 3. Préparation dossier de sortie
      const outputDir = await createOutputDirectory();

      // 4. Téléchargement du résultat
      const transformedUri = await downloadTransformedAudio(baseUrl, outputDir);

      setTransformedUri(transformedUri);
    } catch (err) {
      console.error('Erreur transformation:', err);
      Alert.alert('Erreur', 'Échec de la transformation audio');
    } finally {
      setLoading(false);
    }
  };

  // Nettoyage
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  if (!clips || clips.length === 0) {
    return (
      <View style={styles.tabContent}>
        <Text>Aucun enregistrement disponible</Text>
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      <Text style={styles.subtitle}>Les transformations proposées:</Text>
      <View>
        <TypeSounds onSelect={(model) => setSelectedModel(model)} />
      </View>

      <Text style={styles.subtitle}>Mes enregistrements :</Text>
      <FlatList
        data={clips}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.itemContainer,
              selectedClip?.id === item.id && styles.selectedItem
            ]}
            onPress={() => setSelectedClip(item)}
          >
            <Text numberOfLines={1} style={{ flex: 1 }}>{item.name}</Text>
            <Text>{Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}</Text>
          </TouchableOpacity>
        )}
      />

      {selectedClip && selectedModel && !loading && (
        <TouchableOpacity
          style={styles.transformButton}
          onPress={handleTransform}
          disabled={loading}
        >
          <Text style={styles.transformButtonText}>Transformer le son</Text>
        </TouchableOpacity>
      )}

      {loading && (
        <View style={{ marginTop: 20, alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={{ marginTop: 10 }}>Traitement en cours...</Text>
        </View>
      )}

      {transformedUri && (
        <View style={{ marginTop: 20 }}>
          <TouchableOpacity
            onPress={() => playRecording(selectedClip.uri)}
            style={styles.playButton}
          >
            <Text style={styles.actionButtonText}>Écouter original</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => playRecording(transformedUri)}
            style={styles.playButton}
          >
            <Text style={styles.actionButtonText}>Écouter transformé</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const FilePickerRoute = () => (
  <View style={styles.tabContent}>
    <Text>Sélectionner un fichier audio</Text>
  </View>
);


export default function RaveScreen() {
  const layout = useWindowDimensions();

  const [selectedUri, setSelectedUri] = useState(null);

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'default', title: 'Par défaut' },
    { key: 'recordings', title: 'Enregistrements' },
    { key: 'file', title: 'Fichier' },
  ]);

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'default':
        return <DefaultSoundRoute />;
      case 'recordings':
        return <RecordingsRoute />;
      case 'file':
        return <FilePickerRoute />;
      default:
        return null;
    }
  };

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={(props) => (
        <TabBar {...props} indicatorStyle={{ backgroundColor: 'black' }} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    padding: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
  selectedItem: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  transformButton: {
    backgroundColor: '#4CAF50',
    marginTop: 16,
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  transformButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  playButton: {
    backgroundColor: '#2196F3',
    marginVertical: 8,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  }

});
