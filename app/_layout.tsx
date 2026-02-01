import { Stack } from "expo-router";
import React from "react";
import { ChatProvider } from "../context/ChatContext";

export default function Layout() {
  return (
    <ChatProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: "Choisis ton sujet",
            headerStyle: { backgroundColor: "#007AFF" },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="chat"
          options={{
            title: "Tuteur IA",
            headerStyle: { backgroundColor: "#007AFF" },
            headerTintColor: "#fff",
          }}
        />
      </Stack>
    </ChatProvider>
  );
}
