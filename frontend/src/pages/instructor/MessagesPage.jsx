import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MessageSquare, Search, Send } from "lucide-react";

const INITIAL_CONVERSATIONS = [
  {
    id: 1,
    student: "Amina Hassan",
    course: "Data Analysis for Evidence-Based Decision Making",
    unread: true,
    messages: [
      { from: "student", text: "Could you clarify whether the regression task should include a chart?", time: "09:14" },
      { from: "instructor", text: "Yes. Include one clearly labelled chart and explain what it shows in your discussion.", time: "09:32" },
    ],
  },
  {
    id: 2,
    student: "Baraka Mollel",
    course: "Data Analysis for Evidence-Based Decision Making",
    unread: true,
    messages: [{ from: "student", text: "I have submitted Assignment 1. Please let me know if anything is missing.", time: "Yesterday" }],
  },
  {
    id: 3,
    student: "Neema Joseph",
    course: "Research Methods in Public Administration",
    unread: false,
    messages: [{ from: "instructor", text: "Your research proposal outline is ready for the next review.", time: "18 Aug" }],
  },
];

export default function MessagesPage() {
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [selectedId, setSelectedId] = useState(1);
  const [search, setSearch] = useState("");
  const [reply, setReply] = useState("");

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return conversations.filter((conversation) => `${conversation.student} ${conversation.course}`.toLowerCase().includes(query));
  }, [conversations, search]);

  const selectedConversation = conversations.find((conversation) => conversation.id === selectedId) || filteredConversations[0];

  function selectConversation(id) {
    setSelectedId(id);
    setConversations((current) => current.map((conversation) => conversation.id === id ? { ...conversation, unread: false } : conversation));
  }

  function sendReply(event) {
    event.preventDefault();
    const message = reply.trim();
    if (!message || !selectedConversation) return;
    setConversations((current) => current.map((conversation) => conversation.id === selectedConversation.id
      ? { ...conversation, messages: [...conversation.messages, { from: "instructor", text: message, time: "Now" }] }
      : conversation));
    setReply("");
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <Link to="/instructor" className="inline-flex items-center gap-2 text-sm font-semibold text-udom-primary hover:underline"><ArrowLeft className="h-4 w-4" /> Back to dashboard</Link>
      <div className="mt-6"><p className="text-sm font-semibold uppercase tracking-wide text-udom-primary">Instructor communication</p><h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Messages</h1><p className="mt-2 text-sm text-slate-600">Communicate with students from your assigned courses.</p></div>

      <div className="mt-8 grid min-h-[560px] overflow-hidden rounded-2xl border border-slate-200 bg-white lg:grid-cols-[320px_1fr]">
        <aside className="border-b border-slate-200 lg:border-b-0 lg:border-r"><div className="border-b border-slate-100 p-4"><label className="relative block"><span className="sr-only">Search messages</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search conversations" className="w-full rounded-md border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-udom-primary focus:ring-2 focus:ring-udom-primary/20" /></label></div><div className="divide-y divide-slate-100">{filteredConversations.map((conversation) => <button key={conversation.id} onClick={() => selectConversation(conversation.id)} className={`block w-full px-4 py-4 text-left hover:bg-slate-50 ${selectedConversation?.id === conversation.id ? "bg-blue-50" : ""}`}><div className="flex items-start justify-between gap-2"><p className="text-sm font-semibold text-slate-900">{conversation.student}</p>{conversation.unread && <span className="mt-1 h-2 w-2 rounded-full bg-orange-500" aria-label="Unread" />}</div><p className="mt-1 truncate text-xs text-slate-500">{conversation.course}</p><p className="mt-2 truncate text-xs text-slate-400">{conversation.messages[conversation.messages.length - 1].text}</p></button>)}{filteredConversations.length === 0 && <p className="p-6 text-center text-sm text-slate-500">No conversations found.</p>}</div></aside>

        <section className="flex min-h-[560px] flex-col"><div className="border-b border-slate-100 px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-udom-primary"><MessageSquare className="h-5 w-5" /></span><div><h2 className="font-semibold text-slate-900">{selectedConversation?.student || "Select a conversation"}</h2><p className="mt-1 text-xs text-slate-500">{selectedConversation?.course || ""}</p></div></div></div>{selectedConversation ? <><div className="flex-1 space-y-4 overflow-y-auto p-5">{selectedConversation.messages.map((message, index) => <div key={`${message.time}-${index}`} className={`flex ${message.from === "instructor" ? "justify-end" : "justify-start"}`}><div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${message.from === "instructor" ? "bg-udom-primary text-white" : "bg-slate-100 text-slate-800"}`}><p>{message.text}</p><p className={`mt-1 text-[11px] ${message.from === "instructor" ? "text-blue-100" : "text-slate-400"}`}>{message.time}</p></div></div>)}</div><form onSubmit={sendReply} className="border-t border-slate-100 p-4"><label className="sr-only" htmlFor="message-reply">Reply to student</label><div className="flex gap-2"><input id="message-reply" value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Write a reply" className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-udom-primary focus:ring-2 focus:ring-udom-primary/20" /><button type="submit" disabled={!reply.trim()} aria-label="Send reply" className="inline-flex items-center gap-2 rounded-md bg-udom-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-udom-primary-dark disabled:cursor-not-allowed disabled:opacity-50"><Send className="h-4 w-4" /> Send</button></div></form></> : <div className="flex flex-1 items-center justify-center p-10 text-sm text-slate-500">Select a conversation to view messages.</div>}</section>
      </div>
    </div>
  );
}
