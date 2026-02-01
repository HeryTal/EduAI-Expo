import axios from "axios";
const GEMINI_API_KEY = "AIzaSyDrphj_u1yQtJaNmmxPmPtekPaBYUp-V5Y";
const MODEL_NAME = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

type Message = {
  role: "user" | "assistant";
  content: string;
};

// Cache simple pour éviter les appels répétés
const responseCache = new Map<string, string>();

export async function fetchAIResponse(messages: Message[]): Promise<string> {
  const lastMessage = messages[messages.length - 1]?.content || "";
  const messageCount = messages.length;

  // Crée une clé de cache basée sur les derniers messages
  const cacheKey = messages
    .slice(-3)
    .map((m) => m.content)
    .join("|");

  // Vérifie le cache
  if (responseCache.has(cacheKey)) {
    console.log("Utilisation du cache");
    return responseCache.get(cacheKey)!;
  }

  // Détecte le type de message
  const messageType = detectMessageType(lastMessage, messageCount);

  // Récupère le sujet de la conversation
  const subject = detectSubject(messages);

  // Prompt adapté au type de message et au sujet
  const prompt = getEnhancedPrompt(lastMessage, messages, messageType, subject);

  console.log(` Envoi (type: ${messageType}, sujet: ${subject})...`);

  try {
    const response = await axios.post(GEMINI_URL, prompt, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 20000,
    });

    let aiText =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      getEnhancedFallback(lastMessage, messageType, subject);

    // Nettoyage de la réponse
    aiText = cleanAIResponse(aiText);

    // Cache la réponse
    responseCache.set(cacheKey, aiText);

    // Limite la taille du cache
    if (responseCache.size > 50) {
      const firstKey = responseCache.keys().next().value;
      responseCache.delete(firstKey);
    }

    return aiText;
  } catch (error: any) {
    console.error("❌ Erreur Gemini:", {
      status: error.response?.status,
      message: error.message?.substring(0, 100),
    });

    const fallback = getEnhancedFallback(lastMessage, messageType, subject);
    responseCache.set(cacheKey, fallback);
    return fallback;
  }
}

function detectMessageType(message: string, messageCount: number): string {
  const lowerMsg = message.toLowerCase().trim();

  if (messageCount <= 2) return "premier_contact";
  if (lowerMsg.endsWith("?")) return "question";
  if (lowerMsg.match(/^(oui|non|ok|d'accord|parfait|super|génial|merci)$/))
    return "court";
  if (lowerMsg.includes("merci")) return "remerciement";
  if (
    lowerMsg.includes("explique") ||
    lowerMsg.includes("comment") ||
    lowerMsg.includes("pourquoi")
  )
    return "explication";
  if (lowerMsg.includes("exemple") || lowerMsg.includes("exemples"))
    return "exemple";
  if (lowerMsg.length < 15) return "court";

  return "general";
}

function detectSubject(messages: Message[]): string {
  const allText = messages
    .map((m) => m.content)
    .join(" ")
    .toLowerCase();

  if (allText.includes("fraction") || allText.includes("math"))
    return "mathématiques";
  if (allText.includes("python") || allText.includes("programme"))
    return "programmation";
  if (allText.includes("histoire") || allText.includes("france"))
    return "histoire";
  if (allText.includes("anglais") || allText.includes("english"))
    return "langues";
  if (allText.includes("physique") || allText.includes("chimie"))
    return "sciences";

  return "général";
}

function getEnhancedPrompt(
  lastMessage: string,
  allMessages: Message[],
  type: string,
  subject: string,
): any {
  const history = allMessages
    .slice(0, -1)
    .map((m, i) => {
      const role = m.role === "user" ? "Élève" : "Tuteur";
      return `${role}: ${m.content}`;
    })
    .join("\n");

  const prompts: Record<string, string> = {
    premier_contact: `Tu es un tuteur pédagogique enthousiaste et bienveillant.

L'élève commence la conversation: "${lastMessage}"

Accueille l'élève chaleureusement, présente-toi brièvement comme son tuteur IA, et propose de commencer l'apprentissage d'une manière engageante.`,

    question: `Tu es un expert pédagogique. 

${history ? `Contexte de la conversation:\n${history}\n\n` : ""}
L'élève pose cette question: "${lastMessage}"

Donne une réponse:
1. CLARTÉ: Explique simplement et directement
2. EXEMPLE: Ajoute un exemple concret pertinent
3. ENGAGEMENT: Termine par une question pour vérifier la compréhension

Important: Formule ta réponse comme une conversation naturelle, sans listes ni points.`,

    court: `Conversation en cours:
${history}

Réponse courte de l'élève: "${lastMessage}"

Réponds de manière naturelle pour:
- Valider la réponse de l'élève
- Encourager à développer la pensée
- Poser une question pour continuer

Sois bref et chaleureux.`,

    explication: `L'élève demande une explication: "${lastMessage}"

${history ? `Contexte:\n${history}\n\n` : ""}
Fournis une explication pédagogique:
- Commence par l'essentiel
- Utilise une analogie ou métaphore simple
- Limite-toi à 3-4 phrases
- Termine par une question ouverte

Sujet: ${subject}`,

    exemple: `L'élève demande des exemples: "${lastMessage}"

Donne 1-2 exemples concrets et pertinents.
Relie les exemples au quotidien si possible.
Pose une question pour appliquer les exemples.`,

    remerciement: `L'élève dit: "${lastMessage}"

Réponds avec gratitude et encourage la poursuite de l'apprentissage.
Propose le prochain pas naturellement.`,

    general: `Élève: "${lastMessage}"

${history ? `Historique:\n${history}\n\n` : ""}
Réponds comme un tuteur patient et encourageant.
Inclus:
- Une réponse pertinente au message
- Un élément pédagogique (fait, astuce, perspective)
- Une invitation à continuer

Sujet: ${subject}`,
  };

  const basePrompt = prompts[type] || prompts.general;

  return {
    contents: [
      {
        role: "user" as const,
        parts: [
          {
            text: `${basePrompt}

INSTRUCTIONS FINALES:
- Réponds en français naturel et conversationnel
- Évite les formats structurés (pas de 1., 2., 3.)
- Limite ta réponse à 3-4 phrases maximum
- Sois bienveillant et encourageant
- Adapte-toi au niveau de l'élève
- Utilise des émojis pédagogiques si pertinent (🧮, 📝, 💡, ❓)

Réponse du tuteur:`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 2000,
      topP: 0.9,
      topK: 40,
    },
  };
}

function getEnhancedFallback(
  message: string,
  type: string,
  subject: string,
): string {
  const fallbacks: Record<string, Record<string, string>> = {
    mathématiques: {
      premier_contact:
        " Bonjour ! Je suis ton tuteur en mathématiques. Prêt(e) à explorer les nombres ensemble ? Par où souhaites-tu commencer ?",
      question:
        " Excellente question mathématique ! La réponse se trouve dans... Prenons un exemple concret : [exemple]. As-tu d'autres questions sur ce sujet ?",
      explication:
        " Je vais t'expliquer cela pas à pas. Imagine que... C'est comme... Maintenant, essaie de me l'expliquer avec tes propres mots !",
    },
    programmation: {
      premier_contact:
        " Salut futur développeur ! Je suis ton tuteur en programmation Python. Quel projet aimerais-tu réaliser ?",
      question:
        " Super question technique ! En Python, cela fonctionne ainsi : [explication]. Par exemple : `print('Hello')`. Veux-tu essayer toi-même ?",
      explication:
        " En programmation, ce concept permet de... Imagine que ton code est comme... Essaie de coder un petit exemple !",
    },
    histoire: {
      premier_contact:
        " Bonjour ! Je suis ton guide en histoire de France. Prêt(e) à voyager dans le temps ? Quelle période t'intéresse ?",
      question:
        " Question historique intéressante ! Pour comprendre, il faut savoir que... Par exemple, lors de la Révolution... Quel autre aspect veux-tu explorer ?",
      explication:
        " Historiquement, cela s'est passé ainsi... C'est comparable à... Que penses-tu de cette période maintenant ?",
    },
  };

  const subjectFallbacks = fallbacks[subject] || {};
  const typeFallbacks: Record<string, string> = {
    premier_contact:
      "🎓 Bonjour ! Je suis ton tuteur IA. Je vais t'aider à comprendre les concepts simplement. Sur quel sujet veux-tu travailler aujourd'hui ?",
    question:
      "💡 Excellente question ! Laisse-moi t'expliquer cela clairement. [Explication simple]. As-tu compris ou veux-tu plus de détails ?",
    court:
      "👍 Parfait ! Continuons notre exploration. Que souhaites-tu approfondir maintenant ?",
    remerciement:
      "🙏 Merci à toi ! C'est un plaisir de t'accompagner dans ton apprentissage. Veux-tu continuer avec un autre aspect ?",
    explication:
      "🔍 Je vais t'expliquer cela étape par étape. D'abord, [base]. Ensuite, [développement]. Maintenant, peux-tu me donner un exemple ?",
    general:
      "🤖 Je comprends ta question. Voici ce que je peux t'expliquer : [réponse]. As-tu d'autres interrogations sur ce sujet ?",
  };

  return subjectFallbacks[type] || typeFallbacks[type] || typeFallbacks.general;
}

function cleanAIResponse(text: string): string {
  if (!text) return text;

  // Supprime les préfixes indésirables
  let cleaned = text
    .replace(/^(Tuteur|Assistant|IA|Bot):\s*/i, "")
    .replace(/^["']|["']$/g, "")
    .trim();

  // Supprime les listes numérotées au début
  cleaned = cleaned.replace(/^(\d+[\.\)]\s*)/gm, "");

  // Remplace les retours à la ligne multiples par des espaces simples
  cleaned = cleaned.replace(/\n\s*\n/g, "\n").replace(/\n/g, " ");

  // Capitalise la première lettre
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  // S'assure que la réponse se termine par un point
  if (cleaned.length > 0 && !/[.!?]$/.test(cleaned)) {
    cleaned += ".";
  }

  return cleaned;
}
