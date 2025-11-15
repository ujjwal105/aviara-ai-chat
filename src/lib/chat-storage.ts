export interface Message {
  role: "user" | "assistant";
  text: string;
  timestamp: number; // ADDED for timestamps
  isError?: boolean; // ADDED for retry
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

const CHAT_STORAGE_KEY = "aviara-chats";

/**
 * Gets all chats from Local Storage, sorted newest first.
 */
export function getChats(): Chat[] {
  try {
    const chats = localStorage.getItem(CHAT_STORAGE_KEY);
    if (chats) {
      return (JSON.parse(chats) as Chat[]).sort(
        (a, b) => b.createdAt - a.createdAt
      );
    }
  } catch (e) {
    console.error("Failed to parse chats from local storage", e);
  }
  return [];
}

/**
 * Gets a single chat by its ID.
 */
export function getChat(id: string): Chat | null {
  const chats = getChats();
  return chats.find((chat) => chat.id === id) || null;
}

/**
 * Saves all chats to Local Storage.
 */
function saveAllChats(chats: Chat[]): void {
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chats));
}

/**
 * Saves a single chat. If it's new, it adds it. If it exists, it updates it.
 */
export function saveChat(chatToSave: Chat): void {
  const chats = getChats();
  const existingIndex = chats.findIndex((chat) => chat.id === chatToSave.id);

  if (existingIndex > -1) {
    // Update existing chat
    chats[existingIndex] = chatToSave;
  } else {
    // Add new chat
    chats.push(chatToSave);
  }
  saveAllChats(chats);
}

/**
 * Creates a new chat with the first message and saves it.
 * Returns the newly created chat.
 */
export function createNewChat(firstUserMessage: Message): Chat {
  const newChat: Chat = {
    id: Date.now().toString(),
    title: firstUserMessage.text.substring(0, 40) + "...",
    messages: [firstUserMessage],
    createdAt: Date.now(),
  };
  saveChat(newChat); // saveChat adds it to the list
  return newChat;
}

/**
 * Deletes a chat by its ID.
 */
export function deleteChat(id: string): void {
  let chats = getChats();
  chats = chats.filter((chat) => chat.id !== id);
  saveAllChats(chats);
}

/**
 * Renames a chat by its ID.
 */
export function renameChat(id: string, newTitle: string): void {
  const chats = getChats();
  const chatToRename = chats.find((chat) => chat.id === id);
  if (chatToRename) {
    chatToRename.title = newTitle;
    saveAllChats(chats);
  }
}

/**
 * Gets the ID of the currently active chat.
 */
export function getActiveChatId(): string | null {
  return localStorage.getItem("aviara-active-chat-id");
}

/**
 * Sets the ID of the currently active chat.
 */
export function setActiveChatId(id: string | null): void {
  if (id) {
    localStorage.setItem("aviara-active-chat-id", id);
  } else {
    localStorage.removeItem("aviara-active-chat-id");
  }
}
