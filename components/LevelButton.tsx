import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface LevelButtonProps {
  title: string;
  isSelected: boolean;
  onPress: () => void;
}

export default function LevelButton({
  title,
  isSelected,
  onPress,
}: LevelButtonProps) {
  const getLevelColor = () => {
    switch (title) {
      case "Débutant":
        return "#34C759";
      case "Intermédiaire":
        return "#FF9500";
      case "Avancé":
        return "#FF3B30";
      default:
        return "#007AFF";
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getLevelColor() },
        isSelected && styles.selectedButton,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[styles.buttonText, isSelected && styles.selectedButtonText]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    margin: 5,
    opacity: 0.8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedButton: {
    opacity: 1,
    borderColor: "white",
    transform: [{ scale: 1.1 }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  selectedButtonText: {
    fontWeight: "bold",
  },
});
