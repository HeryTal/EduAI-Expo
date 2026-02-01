import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface SubjectButtonProps {
  title: string;
  isSelected: boolean;
  onPress: () => void;
}

export default function SubjectButton({
  title,
  isSelected,
  onPress,
}: SubjectButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, isSelected && styles.selectedButton]}
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
    backgroundColor: "#e9ecef",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    margin: 5,
    minWidth: 120,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedButton: {
    backgroundColor: "#007AFF",
    borderColor: "#0056CC",
    transform: [{ scale: 1.05 }],
  },
  buttonText: {
    color: "#495057",
    fontSize: 16,
    fontWeight: "500",
  },
  selectedButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
