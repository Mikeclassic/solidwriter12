import Link from "next/link";
import { ArrowRight, Check, Bot, Zap, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      <header className="px-6 h-16 flex items-center justify-between border-b bg-card">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <Bot className="h-6 w-6" />
          Solidwriter
        </div>
        <nav className="flex gap-4">
          <Link href="/auth">
             <button className="px-3 py-2 text-sm font-medium text-primary hover:underline">Log in</button>
          </Link>
          <Link href="/pricing">
             <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Start Free Trial</button>
          </Link>
        </nav>
      </header>

      <section className="flex-1 py-16 px-6 text-center max-w-5xl mx-auto space-y-8">
        <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight leading-tight">
          Write Better Content With <span className="text-primary">AI</span> That Understands You.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Solidwriter combines powerful Moonshot AI reasoning with intuitive tools to help you create engaging content faster than ever before.
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4 w-full md:w-auto">
          <Link href="/wizard" className="w-full md:w-auto">
             <button className="w-full md:w-auto bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                Start Writing Now <ArrowRight className="h-5 w-5"/>
             </button>
          </Link>
        </div>
      </section>

      <section className="bg-secondary/20 py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-2xl shadow-sm border space-y-4">
                <Zap className="h-10 w-10 text-primary"/>
                <h3 className="text-xl font-bold">Moonshot K2 Reasoning</h3>
                <p className="text-muted-foreground">Powered by advanced reasoning models that think before they write.</p>
            </div>
            <div className="bg-card p-8 rounded-2xl shadow-sm border space-y-4">
                <Bot className="h-10 w-10 text-primary"/>
                <h3 className="text-xl font-bold">Usage Controls</h3>
                <p className="text-muted-foreground">Smart credit system to manage your generation limits efficiently.</p>
            </div>
            <div className="bg-card p-8 rounded-2xl shadow-sm border space-y-4">
                <Shield className="h-10 w-10 text-primary"/>
                <h3 className="text-xl font-bold">Enterprise Secure</h3>
                <p className="text-muted-foreground">Your data is encrypted and safe. Built for production workloads.</p>
            </div>
        </div>
      </section>

      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Flexible Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[
                 {name: 'Starter', price: '$12', words: '25,000'},
                 {name: 'Standard', price: '$24', words: '100,000'},
                 {name: 'Unlimited', price: '$72', words: 'Unlimited'}
             ].map((plan) => (
                 <div key={plan.name} className="border p-8 rounded-2xl space-y-6 bg-card hover:border-primary transition-colors">
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <div className="text-4xl font-bold">{plan.price}<span className="text-base font-normal text-muted-foreground">/mo</span></div>
                    <ul className="space-y-3">
                        <li className="flex gap-2 text-sm"><Check className="text-green-500 h-5 w-5"/> {plan.words} Words</li>
                        <li className="flex gap-2 text-sm"><Check className="text-green-500 h-5 w-5"/> 7-Day Free Trial</li>
                        <li className="flex gap-2 text-sm"><Check className="text-green-500 h-5 w-5"/> Export to PDF/Word</li>
                    </ul>
                    <Link href="/pricing" className="block">
                        <button className="w-full py-3 rounded-lg border-2 border-primary text-primary font-bold hover:bg-primary hover:text-primary-foreground transition-all mt-6">
                            Choose {plan.name}
                        </button>
                    </Link>
                 </div>
             ))}
        </div>
      </section>

      <footer className="border-t py-12 text-center text-muted-foreground bg-secondary/10">
        © 2024 Solidwriter. All rights reserved.
      </footer>
    </div>
  );
}