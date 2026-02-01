import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import ChatInput from "../components/ChatInput";
import MessageBubble from "../components/MessageBubble";
import { ChatContext } from "../context/ChatContext";

export default function ChatScreen() {
  const { subject, level } = useLocalSearchParams<{
    subject: string;
    level: string;
  }>();

  const router = useRouter();
  const { messages, sendMessage, isLoading, clearMessages, startNewSession } =
    useContext(ChatContext);
  const flatListRef = useRef<FlatList>(null);
  const [currentTopic, setCurrentTopic] = useState<string>("");

  // Quand le sujet/niveau change, démarre une nouvelle session
  useEffect(() => {
    if (subject && level) {
      const topicKey = `${subject}-${level}`;

      // Si c'est un nouveau sujet/niveau
      if (topicKey !== currentTopic) {
        console.log(`🔄 Changement vers: ${subject} (${level})`);
        setCurrentTopic(topicKey);
        startNewSession(subject, level);
      }
    }
  }, [subject, level, currentTopic, startNewSession]);

  // Scroll automatique
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = (text: string) => {
    sendMessage(text);
  };

  const handleBack = () => {
    router.back();
  };

  const handleRestartSession = () => {
    if (subject && level) {
      clearMessages();
      setTimeout(() => {
        startNewSession(subject, level);
      }, 100);
    }
  };

  const getMessageCountInfo = () => {
    const userMessages = messages.filter((m) => m.role === "user").length;
    const aiMessages = messages.filter((m) => m.role === "assistant").length;
    return `${userMessages} questions • ${aiMessages} réponses`;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {subject || "Sujet"}
          </Text>
          <Text style={styles.headerSubtitle}>
            Niveau : {level || "Non spécifié"}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleRestartSession}
          style={styles.restartButton}
        >
          <Ionicons name="refresh" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {messages.length === 0 ? (
        <View style={styles.initializingView}>
          <Ionicons name="school" size={60} color="#007AFF" />
          <Text style={styles.initializingTitle}>Préparation du tuteur...</Text>
          <Text style={styles.initializingText}>
            Le tuteur IA adapte ses explications pour{"\n"}
            <Text style={styles.highlight}>{subject}</Text> (niveau {level})
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionInfoText}>{getMessageCountInfo()}</Text>
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => `msg-${currentTopic}-${index}`}
            renderItem={({ item }) => (
              <MessageBubble
                message={item.content}
                isUser={item.role === "user"}
              />
            )}
            contentContainerStyle={styles.chatList}
          />
        </>
      )}

      {isLoading && (
        <View style={styles.typingIndicator}>
          <Ionicons name="time" size={18} color="#007AFF" />
          <Text style={styles.typingText}>Le tuteur prépare sa réponse...</Text>
        </View>
      )}

      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isLoading}
        placeholder={`Pose une question sur ${subject}...`}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#007AFF",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  backText: {
    color: "white",
    fontSize: 14,
    marginLeft: 4,
    fontWeight: "500",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 10,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 13,
    textAlign: "center",
    marginTop: 2,
  },
  restartButton: {
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 10,
  },
  sessionInfo: {
    backgroundColor: "#f0f7ff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e7ff",
  },
  sessionInfoText: {
    color: "#007AFF",
    fontSize: 12,
    fontWeight: "500",
  },
  initializingView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  initializingTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  initializingText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  highlight: {
    fontWeight: "bold",
    color: "#007AFF",
  },
  chatList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 10,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#f8f9fa",
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  typingText: {
    marginLeft: 10,
    color: "#666",
    fontSize: 14,
    fontStyle: "italic",
  },
});
