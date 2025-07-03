import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Audio } from "expo-av";

export default function Recording({ item, onDelete }) {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState(null);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const playSound = async () => {
    if (isPlaying && sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setIsPlaying(false);
      setPlaybackStatus(null);
      return;
    }

    const { sound: newSound } = await Audio.Sound.createAsync({
      uri: item.uri,
    });
    setSound(newSound);
    await newSound.playAsync();
    setIsPlaying(true);

    newSound.setOnPlaybackStatusUpdate((status) => {
      setPlaybackStatus(status);
      if (!status.isPlaying) {
        setIsPlaying(false);
        setPlaybackStatus(null);
      }
    });
  };

  return (
    <View style={styles.item}>
      <View style={styles.headerRow}>
        <Text style={styles.filename}>{item.name}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={playSound}>
            <Text style={styles.play}>{isPlaying ? "⏹️" : "▶️"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(item.name, item.uri)}>
            <Text style={styles.delete}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {playbackStatus &&
        playbackStatus.isLoaded &&
        playbackStatus.durationMillis > 0 && (
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${
                    (playbackStatus.positionMillis /
                      playbackStatus.durationMillis) *
                    100
                  }%`,
                },
              ]}
            />
          </View>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  filename: {
    fontSize: 16,
    marginBottom: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
  },
  play: {
    fontSize: 20,
  },
  delete: {
    fontSize: 20,
    color: "red",
  },
  progressContainer: {
    height: 4,
    backgroundColor: "#ddd",
    marginTop: 6,
    width: "100%",
    borderRadius: 2,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#4caf50",
    borderRadius: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
