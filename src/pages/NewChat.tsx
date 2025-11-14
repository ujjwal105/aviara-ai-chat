import { GoogleGenAI } from "@google/genai";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Bot, User, Pencil, Copy, Check } from "lucide-react";
import AI_Prompt from "@/components/kokonutui/ai-prompt";

function NewChat() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const [messages, setMessages] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const hasConversationStarted = messages.length > 0;

  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(
    null
  );
  const [editingMessageText, setEditingMessageText] = useState<string>("");
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(
    null
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handlePromptSubmit(userPrompt: any) {
    if (!userPrompt.trim() || isLoading) return;

    setIsLoading(true);
    setMessages((prev: any) => [...prev, { role: "user", text: userPrompt }]);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: userPrompt,
      });
      const aiText =
        typeof (response as any).text === "function"
          ? (response as any).text()
          : (response as any).text ?? "";
      setMessages((prev: any) => [
        ...prev,
        { role: "assistant", text: aiText },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev: any) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResubmit(editedPrompt: string, messagesHistory: any[]) {
    if (!editedPrompt.trim() || isLoading) return;

    setIsLoading(true);
    setMessages(messagesHistory);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: editedPrompt,
      });
      const aiText =
        typeof (response as any).text === "function"
          ? (response as any).text()
          : (response as any).text ?? "";

      setMessages((prev: any) => [
        ...prev,
        { role: "assistant", text: aiText },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev: any) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleEditSubmit(index: number, newText: string) {
    const newMessages = messages.slice(0, index + 1);
    newMessages[index] = { ...newMessages[index], text: newText };

    setEditingMessageIndex(null);
    setEditingMessageText("");

    handleResubmit(newText, newMessages);
  }

  function handleCopy(text: string, index: number) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedMessageIndex(index);
        setTimeout(() => {
          setCopiedMessageIndex(null);
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  }

  return (
    <div className={cn("flex flex-col h-screen", "relative overflow-hidden")}>
      {!hasConversationStarted ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
          <div className="w-full max-w-2xl">
            <div className="mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-green-100/60 dark:bg-green-500/20 border border-green-200/50 dark:border-green-400/30 mb-6">
                <Bot className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-xs sm:text-sm font-medium text-green-900 dark:text-green-100">
                  Powered by Advanced AI
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-white mb-3 leading-tight">
                Welcome to
                <span className="bg-linear-to-r from-green-600 to-green-400 dark:from-green-400 dark:to-green-300 bg-clip-text text-transparent">
                  Aviara
                </span>
              </h1>
              <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Your intelligent AI assistant. Ask me anything and let's explore
                possibilities together.
              </p>
            </div>
          </div>
          <div className="w-full max-w-4xl mx-auto sm:py-5 shrink-0 relative z-10">
            <AI_Prompt
              onSendPrompt={handlePromptSubmit}
              isLoading={isLoading}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto" ref={messagesContainerRef}>
          <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-8">
            <div className="space-y-4 sm:space-y-6">
              {messages.map((msg: any, i: any) => (
                <div
                  key={i}
                  className={cn(
                    "group relative flex items-start gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-600 dark:bg-green-500 flex items-center justify-center shrink-0">
                        <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div
                        className={cn(
                          "relative max-w-xs sm:max-w-md lg:max-w-2xl px-4 sm:px-5 py-3 sm:py-4 rounded-lg",
                          "bg-white lg:max-w-3xl dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200/50 dark:border-neutral-700/50 shadow-md shadow-neutral-500/5"
                        )}
                      >
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => (
                              <p className="mb-3 leading-relaxed last:mb-0">
                                {children}
                              </p>
                            ),
                            h1: ({ children }) => (
                              <h1 className="text-2xl font-bold mt-4 mb-2">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-xl font-bold mt-4 mb-2">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-lg font-semibold mt-3 mb-2">
                                {children}
                              </h3>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc list-inside space-y-1 mb-3">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal list-inside space-y-1 mb-3">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="mb-1">{children}</li>
                            ),
                            a: ({ href, children }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline hover:text-blue-800"
                              >
                                {children}
                              </a>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-4 border-gray-400 pl-3 italic my-3">
                                {children}
                              </blockquote>
                            ),
                            code({ inline, className, children }: any) {
                              const language = className?.replace(
                                "language-",
                                ""
                              );
                              return inline ? (
                                <code className="bg-gray-200 px-1 py-0.5 rounded text-sm font-mono">
                                  {children}
                                </code>
                              ) : (
                                <SyntaxHighlighter
                                  language={language}
                                  style={oneDark}
                                  showLineNumbers
                                  customStyle={{
                                    borderRadius: "8px",
                                    padding: "14px",
                                    marginTop: "10px",
                                    marginBottom: "16px",
                                  }}
                                >
                                  {String(children)}
                                </SyntaxHighlighter>
                              );
                            },
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                      <button
                        onClick={() => handleCopy(msg.text, i)}
                        className="p-2 rounded-md shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        aria-label="Copy response"
                      >
                        {copiedMessageIndex === i ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-neutral-500" />
                        )}
                      </button>
                    </>
                  )}
                  {msg.role === "user" && (
                    <>
                      {editingMessageIndex !== i && (
                        <button
                          onClick={() => {
                            setEditingMessageIndex(i);
                            setEditingMessageText(msg.text);
                          }}
                          className="p-2 rounded-md shrink-0 opacity-0 cursor-pointer group-hover:opacity-100 transition-opacity hover:bg-neutral-100 dark:hover:bg-neutral-700"
                          aria-label="Edit prompt"
                        >
                          <Pencil className="w-4 h-4 text-neutral-500 " />
                        </button>
                      )}

                      {editingMessageIndex === i ? (
                        <div className="w-full max-w-xs sm:max-w-md lg:max-w-2xl">
                          <textarea
                            value={editingMessageText}
                            onChange={(e) =>
                              setEditingMessageText(e.target.value)
                            }
                            className="w-full p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                            rows={3}
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              onClick={() => setEditingMessageIndex(null)}
                              className="px-4 py-2 rounded-full cursor-pointer text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() =>
                                handleEditSubmit(i, editingMessageText)
                              }
                              className="px-4 py-2 rounded-full cursor-pointer text-sm font-medium bg-green-600 text-white hover:bg-green-700"
                            >
                              Update
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "max-w-xs sm:max-w-md lg:max-w-2xl px-4 sm:px-5 py-3 sm:py-4 rounded-lg",
                            "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200/50 dark:border-neutral-700/50 shadow-md shadow-neutral-500/5"
                          )}
                        >
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      )}

                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border bg-white dark:bg-neutral-700 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                    </>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 sm:gap-4 justify-start animate-in fade-in duration-300">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg shadow-sm bg-green-600 dark:bg-green-500 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" />
                  </div>
                  <div className="px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200/50 dark:border-neutral-700/50">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 150}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      )}
      {hasConversationStarted && (
        <div className="w-full max-w-4xl mx-auto sm:py-5 shrink-0 relative z-10">
          <AI_Prompt onSendPrompt={handlePromptSubmit} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}

export default NewChat;
