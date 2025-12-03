"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, PenTool, Layout, Type } from "lucide-react";

// Simplified steps for brevity - ensure your full logic is here
const STEPS = [
  { id: 1, name: "Topic", icon: PenTool },
  { id: 2, name: "Title", icon: Type },
  { id: 3, name: "Outline", icon: Layout },
  { id: 4, name: "Writing", icon: PenTool },
];

export default function WizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // State for data
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [selectedTitle, setSelectedTitle] = useState("");
  const [outline, setOutline] = useState<string[]>([]);
  const [titles, setTitles] = useState<string[]>([]);

  // *** CRITICAL: Store the created document ID ***
  const [docId, setDocId] = useState<string | null>(null);

  // Helper to create empty document in DB
  const createDocument = async () => {
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        body: JSON.stringify({ title: selectedTitle || topic }),
      });
      const doc = await res.json();
      return doc.id;
    } catch (e) {
      console.error("Failed to create doc", e);
      return null;
    }
  };

  const handleGenerate = async () => {
    setLoading(true);

    try {
      // 1. Generate Titles
      if (step === 1) {
        const res = await fetch("/api/generate", {
          method: "POST",
          body: JSON.stringify({ type: "titles", topic, keywords }),
        });
        const data = await res.json();
        setTitles(JSON.parse(data.result));
        setStep(2);
      }
      
      // 2. Generate Outline
      else if (step === 2) {
        const res = await fetch("/api/generate", {
          method: "POST",
          body: JSON.stringify({ type: "outline", title: selectedTitle, keywords }),
        });
        const data = await res.json();
        setOutline(JSON.parse(data.result));
        setStep(3);
      }

      // 3. Final Content Generation
      else if (step === 3) {
        // A. First, create the document in DB so we have an ID
        const newDocId = await createDocument();
        if (!newDocId) throw new Error("Could not create document");
        setDocId(newDocId);

        // B. Call AI generation with the documentId
        // The API will stream the text AND save it to the DB because we passed documentId
        const response = await fetch("/api/generate", {
          method: "POST",
          body: JSON.stringify({
            type: "article",
            title: selectedTitle,
            outline,
            documentId: newDocId, // Pass ID here!
            keywords // Pass context
          }),
        });

        if (!response.ok) throw new Error(response.statusText);

        // C. Read the stream (Optional: show preview)
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;
          // You could update a preview state here if you wanted to show typing
        }

        // D. Redirect to Editor
        router.push(`/documents/${newDocId}`);
      }

    } catch (error) {
      console.error(error);
      alert("Something went wrong generating content.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-2xl">
        {/* Render your existing Wizard UI here... */}
        
        {/* Example: Step 1 Input */}
        {step === 1 && (
          <div className="bg-white p-8 rounded-xl shadow-sm border space-y-4">
            <h2 className="text-2xl font-bold">What do you want to write about?</h2>
            <input 
              value={topic} 
              onChange={(e) => setTopic(e.target.value)}
              className="w-full border p-3 rounded-lg"
              placeholder="e.g. Benefits of Yoga"
            />
            <button onClick={handleGenerate} disabled={loading} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold w-full flex justify-center">
               {loading ? <Loader2 className="animate-spin" /> : "Next"}
            </button>
          </div>
        )}

        {/* ... (Implement Step 2 & 3 UI similarly) ... */}

        {/* Example: Step 3 (Outline Review) & Final Generation Button */}
        {step === 3 && (
            <div className="bg-white p-8 rounded-xl shadow-sm border space-y-4">
               <h2 className="text-2xl font-bold">Review Outline</h2>
               <div className="space-y-2">
                   {outline.map((item, i) => (
                       <div key={i} className="p-3 bg-slate-50 border rounded">{item}</div>
                   ))}
               </div>
               <button onClick={handleGenerate} disabled={loading} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold w-full flex justify-center gap-2">
                  {loading ? (
                    <>
                        <Loader2 className="animate-spin" /> Writing Article...
                    </>
                  ) : (
                    <>
                        Generate Full Article <ArrowRight />
                    </>
                  )}
               </button>
            </div>
        )}
      </div>
    </div>
  );
}