import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useState,
} from "react";
import { fetchAIResponse } from "../services/gemini";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatContextType = {
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  clearMessages: () => void; // Nom corrigé
  startNewSession: (subject: string, level: string) => void; // Nouvelle fonction
};

export const ChatContext = createContext<ChatContextType>({
  messages: [],
  sendMessage: async () => {},
  isLoading: false,
  clearMessages: () => {},
  startNewSession: () => {},
});

export const useChat = () => useContext(ChatContext);

type ChatProviderProps = {
  children: ReactNode;
};

export function ChatProvider({ children }: ChatProviderProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<{
    subject: string;
    level: string;
  } | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      const newMessage: Message = { role: "user", content };
      setMessages((prev) => [...prev, newMessage]);
      setIsLoading(true);

      try {
        const aiResponse = await fetchAIResponse([...messages, newMessage]);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: aiResponse },
        ]);
      } catch (error: any) {
        console.error("Erreur IA:", error.message);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: error.message.includes("quota")
              ? " Limite d'utilisation atteinte. Réessaie plus tard ou utilise le mode démo."
              : " Problème de connexion. Réessaie dans un instant.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages],
  );

  const clearMessages = useCallback(() => {
    console.log("🧹 Nettoyage des messages");
    setMessages([]);
    setCurrentSession(null);
  }, []);

  const startNewSession = useCallback(
    (subject: string, level: string) => {
      console.log(`🚀 Nouvelle session: ${subject} (${level})`);
      setMessages([]); // Vide les messages
      setCurrentSession({ subject, level });

      // Envoie automatiquement le message de bienvenue
      setTimeout(() => {
        sendMessage(
          `Bonjour ! Je veux apprendre "${subject}" au niveau "${level}". Commence par m'expliquer les bases.`,
        );
      }, 300);
    },
    [sendMessage],
  );

  return (
    <ChatContext.Provider
      value={{
        messages,
        sendMessage,
        isLoading,
        clearMessages,
        startNewSession,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
