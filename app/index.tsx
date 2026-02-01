import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import LevelButton from "../components/LevelButton";
import SubjectButton from "../components/SubjectButton";

const subjects = [
  "Fractions",
  "Python",
  "Histoire de France",
  "Anglais",
  "Physique",
  "Chimie",
];
const levels = ["Débutant", "Intermédiaire", "Avancé"];

export default function HomeScreen() {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const handleStart = () => {
    if (selectedSubject && selectedLevel) {
      router.push({
        pathname: "/chat",
        params: {
          subject: selectedSubject,
          level: selectedLevel,
        },
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📚 Apprentissage avec IA</Text>
      <Text style={styles.subtitle}>Choisis un sujet à apprendre</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sujets disponibles</Text>
        <View style={styles.buttonGrid}>
          {subjects.map((subject) => (
            <SubjectButton
              key={subject}
              title={subject}
              isSelected={selectedSubject === subject}
              onPress={() => setSelectedSubject(subject)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Niveau</Text>
        <View style={styles.buttonGrid}>
          {levels.map((level) => (
            <LevelButton
              key={level}
              title={level}
              isSelected={selectedLevel === level}
              onPress={() => setSelectedLevel(level)}
            />
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.startButton,
          (!selectedSubject || !selectedLevel) && styles.disabledButton,
        ]}
        onPress={handleStart}
        disabled={!selectedSubject || !selectedLevel}
        activeOpacity={0.7}
      >
        <Text style={styles.startButtonText}>
          {selectedSubject && selectedLevel
            ? `🎯 Commencer ${selectedSubject} (${selectedLevel})`
            : "👉 Sélectionne un sujet et un niveau"}
        </Text>
      </TouchableOpacity>

      {selectedSubject && selectedLevel && (
        <Text style={styles.hintText}>
          Appuie sur le bouton pour commencer avec le tuteur IA
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginVertical: 20,
    textAlign: "center",
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
    color: "#333",
  },
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  startButton: {
    backgroundColor: "#34C759",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  startButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  hintText: {
    marginTop: 15,
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
  },
});
