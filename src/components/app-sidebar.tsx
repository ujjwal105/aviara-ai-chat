"use client";

import * as React from "react";
import {
  MessageSquare,
  Plus,
  Pencil,
  Trash2,
  Download,
  Check,
  X,
} from "lucide-react";
import logo from "../assets/logo.svg";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

// --- IMPORT THE NEW HOOK ---
import { useChat } from "../context/ChatContext"; // Adjust path as needed
import { cn } from "@/lib/utils";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();

  // --- GET EVERYTHING FROM CONTEXT ---
  const {
    chats,
    activeChat,
    handleNewChat,
    handleSelectChat,
    handleDeleteChat,
    handleRenameChat,
    handleExportChat,
  } = useChat();
  // --- END CONTEXT ---

  const [renamingId, setRenamingId] = React.useState<string | null>(null);
  const [newTitle, setNewTitle] = React.useState("");

  const handleStartRename = (id: string, title: string) => {
    setRenamingId(id);
    setNewTitle(title);
  };

  const handleCancelRename = () => {
    setRenamingId(null);
    setNewTitle("");
  };

  const handleConfirmRename = () => {
    if (renamingId && newTitle.trim()) {
      handleRenameChat(renamingId, newTitle.trim());
      handleCancelRename();
    }
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleConfirmRename();
    } else if (e.key === "Escape") {
      handleCancelRename();
    }
  };

  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader className="relative">
        <SidebarTrigger className="absolute top-16 -right-4 z-10 h-6 w-6 rounded-full border bg-sidebar shadow-md hover:bg-background" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a
                href="/dashboard"
                className={`flex items-center ${
                  state === "collapsed" ? "justify-center" : ""
                }`}
              >
                <div className=" text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <img src={logo} alt="Aviara AI Logo" />
                </div>
                {state !== "collapsed" && (
                  <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                    <span className="truncate font-bold text-2xl tracking-tight font-sans">
                      Aviara
                      <span className="text-[#01DD85]"> AI</span>
                    </span>
                  </div>
                )}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* --- NEW CHAT BUTTON --- */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleNewChat}
              isActive={!activeChat} // Active if no chat is selected
              className="font-medium py-6"
            >
              <Plus className="w-4 h-4" />
              {state !== "collapsed" && "New Chat"}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* --- RECENT CHATS --- */}
        {chats.length > 0 && state !== "collapsed" && (
          <span className="text-xs text-muted-foreground uppercase font-medium px-2 mt-2 block">
            Recent
          </span>
        )}
        <SidebarMenu className="flex-1">
          {chats.map((chat) => (
            <SidebarMenuItem
              key={chat.id}
              className={cn(
                "group relative",
                renamingId === chat.id && "bg-black/10 dark:bg-white/10"
              )}
            >
              {renamingId === chat.id && state !== "collapsed" ? (
                // --- RENAME VIEW ---
                <div className="flex items-center gap-1 w-full px-3 py-6">
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={handleRenameKeyDown}
                    onBlur={handleCancelRename}
                    autoFocus
                    className="flex-1 bg-transparent border border-neutral-500 rounded-md px-2 py-0.5 text-sm"
                  />
                  <button
                    onClick={handleConfirmRename}
                    className="p-1 hover:text-green-500"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelRename}
                    className="p-1 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                // --- DEFAULT VIEW ---
                <>
                  <SidebarMenuButton
                    onClick={() => handleSelectChat(chat.id)}
                    isActive={chat.id === activeChat?.id}
                    className="justify-between py-6 w-full"
                    title={chat.title}
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-4 h-4" />
                      {state !== "collapsed" && (
                        <span className="truncate flex-1">{chat.title}</span>
                      )}
                    </div>
                  </SidebarMenuButton>
                  {state !== "collapsed" && (
                    <div className="absolute right-2 top-0 bottom-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleStartRename(chat.id, chat.title)}
                        className="p-1 hover:text-blue-500"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteChat(chat.id)}
                        className="p-1 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        {/* --- EXPORT BUTTON --- */}
        {activeChat && state !== "collapsed" && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => handleExportChat(activeChat.id)}
              >
                <Download className="w-4 h-4" />
                Export Chat
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
