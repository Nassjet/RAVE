import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

const MODELS = ['cats', 'dabourka', 'dogs', 'jazz', 'speech'];

export default function TypeSounds({ onSelect }) {
  const [selectedModel, setSelectedModel] = useState(null);

  const handleSelect = (model) => {
    setSelectedModel(model);
    if (onSelect) onSelect(model);
  };

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={MODELS}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.modelButton,
              selectedModel === item && styles.selectedButton,
            ]}
            onPress={() => handleSelect(item)}
          >
            <Text
              style={[
                styles.modelText,
                selectedModel === item && styles.selectedText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 10,
  },
  modelButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#eee',
    borderRadius: 20,
    marginRight: 10,
  },
  selectedButton: {
    backgroundColor: '#4CAF50',
  },
  modelText: {
    fontWeight: '500',
    color: '#333',
    textTransform: 'capitalize',
  },
  selectedText: {
    color: 'white',
  },
});
