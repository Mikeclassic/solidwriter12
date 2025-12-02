"use client";
import { useState } from "react";
import { Loader2, Mail, Bot, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSuccess(true);
    } catch (e) {
      // silent fail for security
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans">
      <div className="max-w-md w-full bg-card rounded-2xl shadow-lg p-8 border">
        <Link href="/auth" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4"/> Back to Login
        </Link>
        <div className="flex justify-center mb-6 text-primary">
          <Bot className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-2">Reset Password</h2>
        <p className="text-center text-muted-foreground mb-6">Enter your email to receive a reset link.</p>

        {success ? (
            <div className="bg-primary/10 text-primary p-4 rounded-lg text-center text-sm">
                Check your email for a link to reset your password.
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-sm font-medium">Email</label>
                <div className="relative mt-1">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input type="email" required className="w-full pl-10 pr-3 py-2 border rounded-lg bg-background" value={email} onChange={(e) => setEmail(e.target.value)}/>
                </div>
            </div>
            <button disabled={loading} className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:opacity-90 flex justify-center gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />} Send Reset Link
            </button>
            </form>
        )}
      </div>
    </div>
  );
}