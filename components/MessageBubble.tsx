import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface MessageBubbleProps {
  message: string;
  isUser: boolean;
}

export default function MessageBubble({ message, isUser }: MessageBubbleProps) {
  return (
    <View
      style={[
        styles.bubbleContainer,
        isUser ? styles.userContainer : styles.botContainer,
      ]}
    >
      <View
        style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}
      >
        <Text
          style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.botMessageText,
          ]}
        >
          {message}
        </Text>
      </View>
      <Text style={styles.roleText}>{isUser ? "Vous" : "Tuteur IA"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubbleContainer: {
    marginVertical: 8,
    maxWidth: "85%",
  },
  userContainer: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  botContainer: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  bubble: {
    padding: 15,
    borderRadius: 20,
    marginBottom: 5,
  },
  userBubble: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 5,
  },
  botBubble: {
    backgroundColor: "#E5E5EA",
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: "white",
  },
  botMessageText: {
    color: "#1a1a1a",
  },
  roleText: {
    fontSize: 12,
    color: "#666",
    marginHorizontal: 5,
  },
});
