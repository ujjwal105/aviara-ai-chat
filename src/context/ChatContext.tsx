import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { GoogleGenAI } from "@google/genai";
import {
  type Message,
  type Chat,
  getChats,
  saveChat,
  deleteChat as deleteChatFromStorage,
  renameChat as renameChatInStorage,
  getChat,
  createNewChat as createChatInStorage,
} from "../lib/chat-storage";

interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  isLoading: boolean;
  handleNewChat: () => void;
  handleSelectChat: (id: string) => void;
  handleDeleteChat: (id: string) => void;
  handleRenameChat: (id: string, newTitle: string) => void;
  handleExportChat: (id: string) => void;
  handlePromptSubmit: (prompt: string) => Promise<void>;
  handleResubmit: (
    editedPrompt: string,
    messagesHistory: Message[]
  ) => Promise<void>;
  handleRetry: (failedMessageIndex: number) => Promise<void>;
}

// Create Context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Create Provider component
export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load chats from local storage on initial render
  useEffect(() => {
    const allChats = getChats();
    setChats(allChats);
    const activeId = localStorage.getItem("aviara-active-chat-id");
    if (activeId) {
      const chat = getChat(activeId);
      setActiveChat(chat);
    }
  }, []);

  const notifySidebar = () => {
    setChats(getChats());
  };

  const handleNewChat = () => {
    setActiveChat(null);
    localStorage.removeItem("aviara-active-chat-id");
  };

  const handleSelectChat = (id: string) => {
    const chat = getChat(id);
    setActiveChat(chat);
    localStorage.setItem("aviara-active-chat-id", id);
  };

  const handleDeleteChat = (id: string) => {
    deleteChatFromStorage(id);
    if (activeChat?.id === id) {
      handleNewChat();
    }
    notifySidebar();
  };

  const handleRenameChat = (id: string, newTitle: string) => {
    renameChatInStorage(id, newTitle);
    if (activeChat?.id === id) {
      setActiveChat((prev) => (prev ? { ...prev, title: newTitle } : null));
    }
    notifySidebar();
  };

  const handleExportChat = (id: string) => {
    const chat = getChat(id);
    if (!chat) return;
    const json = JSON.stringify(chat, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${chat.title.replace(/[^a-z0-9]/gi, "_")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- Message & API Handling ---

  const runApiCall = async (prompt: string, messagesHistory: Message[]) => {
    let chatToSave = activeChat;

    // If this is the first message, create the chat
    if (!chatToSave) {
      const firstUserMessage = messagesHistory.find((m) => m.role === "user");
      if (!firstUserMessage) throw new Error("No user message found");

      chatToSave = createChatInStorage(firstUserMessage);
      setActiveChat(chatToSave);
      localStorage.setItem("aviara-active-chat-id", chatToSave.id);
      notifySidebar();
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });
      const aiText =
        typeof (response as any).text === "function"
          ? (response as any).text()
          : (response as any).text ?? "";

      const aiMessage: Message = {
        role: "assistant",
        text: aiText,
        timestamp: Date.now(),
      };
      const finalMessages = [...messagesHistory, aiMessage];

      setActiveChat((prev) =>
        prev ? { ...prev, messages: finalMessages } : null
      );
      saveChat({ ...chatToSave, messages: finalMessages });
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        role: "assistant",
        text: "Sorry, something went wrong. Please try again.",
        timestamp: Date.now(),
        isError: true, // Mark as error for retry
      };
      const finalMessages = [...messagesHistory, errorMessage];

      setActiveChat((prev) =>
        prev ? { ...prev, messages: finalMessages } : null
      );
      saveChat({ ...chatToSave, messages: finalMessages });
    }
  };

  const handlePromptSubmit = async (prompt: string) => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage: Message = {
      role: "user",
      text: prompt,
      timestamp: Date.now(),
    };
    const newMessages = [...(activeChat?.messages || []), userMessage];

    // Optimistically update UI
    setActiveChat((prev) => ({
      ...(prev || { id: "temp", title: "New Chat", createdAt: Date.now() }),
      messages: newMessages,
    }));

    await runApiCall(prompt, newMessages);
    setIsLoading(false);
  };

  const handleResubmit = async (
    editedPrompt: string,
    messagesHistory: Message[]
  ) => {
    if (!editedPrompt.trim() || isLoading || !activeChat) return;

    setIsLoading(true);
    setActiveChat({ ...activeChat, messages: messagesHistory });

    const newTitle = messagesHistory[0].text.substring(0, 40) + "...";
    saveChat({ ...activeChat, messages: messagesHistory, title: newTitle });
    notifySidebar();

    await runApiCall(editedPrompt, messagesHistory);
    setIsLoading(false);
  };

  const handleRetry = async (failedMessageIndex: number) => {
    if (isLoading || !activeChat) return;

    // Get all messages *before* the failed one
    const messagesHistory = activeChat.messages.slice(0, failedMessageIndex);
    // Find the last user prompt in that history
    const lastUserPrompt = [...messagesHistory]
      .reverse()
      .find((m) => m.role === "user");

    if (!lastUserPrompt) {
      console.error("Could not find a user prompt to retry.");
      return;
    }

    setIsLoading(true);
    // Set UI to the history before the error, ready for a new response
    setActiveChat({ ...activeChat, messages: messagesHistory });

    await runApiCall(lastUserPrompt.text, messagesHistory);
    setIsLoading(false);
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        isLoading,
        handleNewChat,
        handleSelectChat,
        handleDeleteChat,
        handleRenameChat,
        handleExportChat,
        handlePromptSubmit,
        handleResubmit,
        handleRetry,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

// Create the custom hook
export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
