"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useState } from "react";
import { Bot, Save, ArrowLeft, Loader2, Wand2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface EditorProps {
  initialContent?: string;
  documentId: string;
  title: string;
}

export default function Editor({ initialContent, documentId, title }: EditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing your masterpiece...",
      }),
    ],
    content: initialContent || "", // Load the AI generated content here
    editorProps: {
      attributes: {
        class: "prose prose-lg max-w-none focus:outline-none min-h-[500px] p-8",
      },
    },
    onUpdate: async ({ editor }) => {
      // Auto-save logic can go here (debounce recommended)
      const html = editor.getHTML();
      // Optional: Call save API here
    },
  });

  const saveDocument = async () => {
    if (!editor) return;
    setIsSaving(true);
    try {
      await fetch(`/api/documents/${documentId}`, {
        method: "PATCH",
        body: JSON.stringify({
          content: editor.getHTML(), // Saves rich text as HTML for storage
        }),
      });
      // Show success toast here
    } catch (error) {
      console.error("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  if (!editor) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-bold text-slate-900 truncate max-w-[200px] md:max-w-md">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline-block">
                {editor.storage.characterCount?.characters()} words
            </span>
            <button 
                onClick={saveDocument}
                disabled={isSaving}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors"
            >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4"/>}
                Save
            </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[80vh] relative group">
           {/* Tiptap Editor Content */}
           <EditorContent editor={editor} />

           {/* Floating AI Assistant Button */}
           <button 
             className="absolute bottom-8 right-8 z-20 flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all font-bold animate-in fade-in slide-in-from-bottom-4"
             onClick={() => {
                // Logic to open AI sidebar or modal
                alert("AI Assistant Opening..."); 
             }}
           >
             <Wand2 className="h-5 w-5" />
             AI Assistant
           </button>
        </div>
      </div>
    </div>
  );
}