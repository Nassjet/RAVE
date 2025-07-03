import React, { useState } from 'react';
import { View, Text, useWindowDimensions, StyleSheet } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

// Onglet 1 : Son par défaut
const DefaultSoundRoute = () => (
  <View style={styles.tabContent}>
    <Text>Son par défaut (assets)</Text>
  </View>
);

// Onglet 2 : Enregistrements
const RecordingsRoute = () => (
  <View style={styles.tabContent}>
    <Text>Choisir un enregistrement</Text>
  </View>
);

// Onglet 3 : Depuis le téléphone
const FilePickerRoute = () => (
  <View style={styles.tabContent}>
    <Text>Sélectionner un fichier audio</Text>
  </View>
);

export default function RaveScreen() {
  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'default', title: 'Par défaut' },
    { key: 'recordings', title: 'Enregistrements' },
    { key: 'file', title: 'Fichier' },
  ]);

  const renderScene = SceneMap({
    default: DefaultSoundRoute,
    recordings: RecordingsRoute,
    file: FilePickerRoute,
  });

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={props => (
        <TabBar {...props} indicatorStyle={{ backgroundColor: 'black' }} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
