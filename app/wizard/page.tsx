"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PenTool, Share2, Megaphone, Layout, Loader2, ArrowRight, Check, ArrowLeft, Bot, Type, Sparkles } from "lucide-react";
import Link from "next/link";

const WORKFLOWS = [
  { id: "article", label: "Blog Post", icon: PenTool, desc: "SEO Articles" },
  { id: "social", label: "Social Media", icon: Share2, desc: "LinkedIn / X / IG" },
  { id: "ads", label: "Advertisement", icon: Megaphone, desc: "Ad Copy Variations" },
  { id: "copywriting", label: "Copywriting", icon: Layout, desc: "Sales Pages" },
];

export default function WizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0 = Selection, 1-4 = Generation
  const [type, setType] = useState("article");
  const [loading, setLoading] = useState(false);
  
  // Form Data
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [tone, setTone] = useState("Professional");
  
  // Generation Data
  const [titles, setTitles] = useState<string[]>([]);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [outline, setOutline] = useState<string[]>([]);

  // 1. Generate Titles
  const handleGenerateTitles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ type: "titles", topic, keywords, tone }),
      });
      const data = await res.json();
      setTitles(JSON.parse(data.result));
      setStep(2);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  // 2. Generate Outline
  const handleGenerateOutline = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ type: "outline", title: selectedTitle, keywords }),
      });
      const data = await res.json();
      setOutline(JSON.parse(data.result));
      setStep(3);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  // 3. Final Generation (The Fix: Create Doc -> Generate -> Redirect)
  const handleFinalGeneration = async () => {
    setLoading(true);
    try {
      // A. Create Document Entry
      const docRes = await fetch("/api/documents", {
        method: "POST",
        body: JSON.stringify({ title: selectedTitle }),
      });
      const doc = await docRes.json();

      // B. Generate Content & Save to DB (using documentId)
      await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({
          type: "article", // Use 'article' logic from your API
          title: selectedTitle,
          outline,
          keywords,
          tone,
          documentId: doc.id // This triggers the DB update in your API
        }),
      });

      // C. Redirect
      router.push(`/documents/${doc.id}`);

    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="h-16 bg-slate-900 flex items-center px-6">
         <Link href="/dashboard" className="text-slate-400 hover:text-white"><ArrowLeft className="h-5 w-5"/></Link>
      </div>

      <div className="max-w-3xl mx-auto py-12 px-4">
        {step === 0 ? (
           // Workflow Selection
           <div className="animate-in fade-in slide-in-from-bottom-4">
              <h1 className="text-4xl font-bold text-center mb-2 text-slate-900">Create Content</h1>
              <p className="text-center text-slate-500 mb-12">Select a workflow to get started.</p>
              <div className="grid md:grid-cols-2 gap-4">
                {WORKFLOWS.map((w) => (
                    <button key={w.id} onClick={() => { setType(w.id); setStep(1); }} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all flex flex-col items-center gap-4 group">
                        <div className="p-4 bg-blue-50 text-blue-500 rounded-full group-hover:bg-blue-500 group-hover:text-white transition-colors"><w.icon className="h-8 w-8"/></div>
                        <div className="text-center">
                            <h3 className="font-bold text-lg text-slate-900">{w.label}</h3>
                            <p className="text-sm text-slate-500">{w.desc}</p>
                        </div>
                    </button>
                ))}
              </div>
           </div>
        ) : (
           // Wizard Steps
           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 min-h-[500px] flex flex-col">
              {/* Stepper */}
              <div className="flex justify-between mb-10 relative px-4">
                 <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-0 -translate-y-1/2"></div>
                 {[1,2,3,4].map((s) => (
                    <div key={s} className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? "bg-slate-900 text-white" : "bg-white border-2 border-slate-200 text-slate-400"}`}>
                        {s}
                    </div>
                 ))}
              </div>

              {/* Step 1: Input */}
              {step === 1 && (
                  <div className="space-y-6 flex-1 animate-in fade-in slide-in-from-right-4">
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">Topic & Keywords</h2>
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-700">Topic</label>
                        <input value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full p-3 border rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-slate-900" placeholder="e.g. Benefits of Yoga"/>
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-700">Keywords</label>
                        <input value={keywords} onChange={(e) => setKeywords(e.target.value)} className="w-full p-3 border rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-slate-900" placeholder="e.g. health, mindfulness"/>
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-700">Tone</label>
                        <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full p-3 border rounded-lg mt-2 bg-white">
                            <option>Professional</option>
                            <option>Casual</option>
                            <option>Witty</option>
                        </select>
                      </div>
                      <button onClick={handleGenerateTitles} disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 flex justify-center">{loading ? <Loader2 className="animate-spin"/> : "Generate Titles"}</button>
                  </div>
              )}

              {/* Step 2: Titles */}
              {step === 2 && (
                  <div className="space-y-6 flex-1 animate-in fade-in slide-in-from-right-4">
                      <h2 className="text-2xl font-bold text-center">Select a Title</h2>
                      <div className="space-y-3">
                          {titles.map((t, i) => (
                              <div key={i} onClick={() => setSelectedTitle(t)} className={`p-4 border rounded-lg cursor-pointer flex justify-between items-center ${selectedTitle === t ? "border-blue-600 bg-blue-50" : "hover:bg-slate-50"}`}>
                                  {t}
                                  {selectedTitle === t && <Check className="h-5 w-5 text-blue-600"/>}
                              </div>
                          ))}
                      </div>
                      <button onClick={handleGenerateOutline} disabled={loading || !selectedTitle} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 flex justify-center">{loading ? <Loader2 className="animate-spin"/> : "Next"}</button>
                  </div>
              )}

              {/* Step 3: Outline */}
              {step === 3 && (
                  <div className="space-y-6 flex-1 animate-in fade-in slide-in-from-right-4">
                      <h2 className="text-2xl font-bold text-center">Review Outline</h2>
                      <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                          {outline.map((o, i) => <div key={i} className="flex gap-2 font-medium text-slate-700"><span className="text-slate-400">0{i+1}</span>{o}</div>)}
                      </div>
                      <button onClick={handleFinalGeneration} disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2">
                          {loading ? <><Loader2 className="animate-spin"/> Writing...</> : <><Sparkles className="h-5 w-5"/> Generate Article</>}
                      </button>
                  </div>
              )}
           </div>
        )}
      </div>
    </div>
  );
}