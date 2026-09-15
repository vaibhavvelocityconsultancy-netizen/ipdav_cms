"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, FileText, Paperclip, Plus, Send, Trash2 } from "lucide-react";

type Message = { id?: string; role: "user" | "assistant"; content: string; metadata?: any };
type Conversation = { id: string; title: string };

const starters = ["Create a new page", "Find all draft posts", "Improve SEO for this page", "Create a post from a document"];

export function AIAssistant() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState<File>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  async function loadConversations() {
    const response = await fetch("/api/ai/conversations");
    const payload = await response.json();
    if (payload.success) setConversations(payload.data);
  }
  async function loadConversation(id: string) {
    const response = await fetch(`/api/ai/conversations/${id}`);
    const payload = await response.json();
    if (payload.success) { setConversationId(id); setMessages(payload.data.messages.filter((m: Message) => m.role === "user" || m.role === "assistant")); }
  }
  useEffect(() => { loadConversations(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function sendMessage(event?: React.FormEvent) {
    event?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setError(""); setInput(""); setMessages((current) => [...current, { role: "user", content: text }]); setLoading(true);
    try {
      const response = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ conversationId, message: text, attachments: attachment ? [{ name: attachment.name, type: attachment.type, size: attachment.size }] : [] }) });
      const payload = await response.json();
      if (!payload.success) throw new Error(payload.error || "The request failed");
      setConversationId(payload.data.conversationId); setMessages((current) => [...current, { role: "assistant", content: payload.data.response.content, metadata: payload.data.response }]); setAttachment(undefined); loadConversations();
    } catch (sendError: any) { setError(sendError.message); }
    finally { setLoading(false); }
  }
  async function newConversation() { setConversationId(undefined); setMessages([]); setError(""); }
  async function clearConversation() { if (conversationId) await fetch(`/api/ai/conversations/${conversationId}`, { method: "DELETE" }); newConversation(); loadConversations(); }

  return <div className="flex min-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-xl border bg-card shadow-sm lg:flex-row">
    <aside className="w-full border-b bg-muted/20 p-4 lg:w-64 lg:border-b-0 lg:border-r">
      <div className="mb-5 flex items-center justify-between"><h2 className="font-semibold">Conversations</h2><button onClick={newConversation} className="rounded-md p-2 hover:bg-muted" aria-label="New conversation"><Plus className="h-4 w-4" /></button></div>
      <div className="space-y-1">{conversations.map((conversation) => <button key={conversation.id} onClick={() => loadConversation(conversation.id)} className={`w-full truncate rounded-md px-3 py-2 text-left text-sm hover:bg-muted ${conversation.id === conversationId ? "bg-muted font-medium" : ""}`}>{conversation.title}</button>)}</div>
    </aside>
    <section className="flex min-h-[560px] min-w-0 flex-1 flex-col">
      <header className="flex items-center justify-between border-b px-5 py-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-primary/10 p-2 text-primary"><Bot className="h-5 w-5" /></div><div><h1 className="font-semibold">AI Assistant</h1><p className="text-xs text-muted-foreground">Your controlled CMS workspace</p></div></div><button onClick={clearConversation} disabled={!conversationId} className="rounded-md p-2 text-muted-foreground hover:bg-muted disabled:opacity-40" aria-label="Clear conversation"><Trash2 className="h-4 w-4" /></button></header>
      <div className="flex-1 space-y-5 overflow-y-auto p-5">{messages.length === 0 && <div className="mx-auto max-w-lg py-10 text-center"><Bot className="mx-auto mb-4 h-10 w-10 text-primary" /><h2 className="text-xl font-semibold">What would you like to do?</h2><p className="mt-2 text-sm text-muted-foreground">Ask about your pages, posts, media, galleries, or SEO. Actions will use the CMS permission system.</p><div className="mt-6 grid gap-2 sm:grid-cols-2">{starters.map((starter) => <button key={starter} onClick={() => setInput(starter)} className="rounded-lg border p-3 text-left text-sm hover:bg-muted">{starter}</button>)}</div></div>}{messages.map((message, index) => <div key={message.id || index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}><p className="whitespace-pre-wrap">{message.content}</p>{message.metadata?.pendingAction && <div className="mt-3 rounded-lg border bg-background/70 p-3 text-foreground"><p className="font-medium">Action preview</p><p className="mt-1 text-xs text-muted-foreground">{message.metadata.pendingAction.summary}</p><button className="mt-3 rounded-md border px-3 py-1.5 text-xs">Confirm later</button></div>}</div></div>)}{loading && <div className="text-sm text-muted-foreground">Assistant is preparing a response…</div>}<div ref={endRef} /></div>
      <div className="border-t p-4"><div className="mb-2 flex min-h-5 items-center gap-2 text-xs text-muted-foreground">{attachment && <span className="flex items-center gap-1 rounded bg-muted px-2 py-1"><FileText className="h-3 w-3" />{attachment.name}<button onClick={() => setAttachment(undefined)} aria-label="Remove attachment">×</button></span>}{error && <span className="text-destructive">{error}</span>}</div><form onSubmit={sendMessage} className="flex items-end gap-2"><label className="cursor-pointer rounded-md p-2 hover:bg-muted"><Paperclip className="h-5 w-5 text-muted-foreground" /><input type="file" className="sr-only" accept=".pdf,.txt,.doc,.docx,.jpg,.jpeg,.png,.webp" onChange={(event) => setAttachment(event.target.files?.[0])} /></label><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) { event.preventDefault(); sendMessage(); } }} placeholder="Ask anything about your CMS…" rows={1} className="max-h-32 min-h-10 flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" /><button type="submit" disabled={loading || !input.trim()} className="rounded-md bg-primary p-2 text-primary-foreground disabled:opacity-50" aria-label="Send message"><Send className="h-5 w-5" /></button></form></div>
    </section>
  </div>;
}
