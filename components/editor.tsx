"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Save, ArrowLeft, Eye, Edit3, Wand2, Loader2 } from "lucide-react";
import Link from "next/link";

interface EditorProps {
  document: any;
}

export default function Editor({ document }: EditorProps) {
  const [content, setContent] = useState(document.content || "");
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/documents/${document.id}`, {
        method: "PATCH",
        body: JSON.stringify({ title: document.title, content }),
      });
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Toolbar */}
      <div className="border-b px-6 py-4 flex justify-between items-center sticky top-0 bg-white z-50">
         <div className="flex items-center gap-4">
            <Link href="/dashboard"><ArrowLeft className="h-5 w-5 text-slate-500 hover:text-slate-900"/></Link>
            <h1 className="font-bold truncate max-w-[200px]">{document.title}</h1>
         </div>
         <div className="flex gap-2">
             <button onClick={() => setMode("edit")} className={`p-2 rounded ${mode === "edit" ? "bg-slate-100" : ""}`}><Edit3 className="h-4 w-4"/></button>
             <button onClick={() => setMode("preview")} className={`p-2 rounded ${mode === "preview" ? "bg-slate-100" : ""}`}><Eye className="h-4 w-4"/></button>
             <button onClick={handleSave} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold flex items-center gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4"/>} Save
             </button>
         </div>
      </div>

      {/* Editor/Preview */}
      <div className="max-w-4xl mx-auto py-8 px-4 h-[calc(100vh-80px)]">
         {mode === "edit" ? (
            <textarea 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                className="w-full h-full resize-none outline-none text-lg leading-relaxed placeholder:text-slate-300"
                placeholder="Start writing..."
            />
         ) : (
            <div className="prose prose-lg max-w-none">
                <ReactMarkdown>{content}</ReactMarkdown>
            </div>
         )}
      </div>

      {/* AI Button */}
      <button className="fixed bottom-8 right-8 bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg font-bold flex items-center gap-2 hover:scale-105 transition-transform">
         <Wand2 className="h-5 w-5"/> AI Assistant
      </button>
    </div>
  );
}