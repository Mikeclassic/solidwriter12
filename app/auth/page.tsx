"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, User, AlertCircle, Bot } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const [data, setData] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const res = await signIn("credentials", {
          ...data,
          redirect: false,
        });

        if (res?.error) {
          setError("Invalid email or password");
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      } else {
        const res = await fetch("/api/register", {
          method: "POST",
          body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Email already in use");

        await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });
        
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border">
        <div className="flex justify-center mb-6 text-primary">
          <Bot className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>

        {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 flex items-center gap-2 text-sm border border-red-200">
                <AlertCircle className="h-4 w-4"/> {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-sm font-medium">Name</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  required
                  className="w-full pl-10 pr-3 py-2 border rounded-md"
                  value={data.name}
                  onChange={(e) => setData({...data, name: e.target.value})}
                />
              </div>
            </div>
          )}
          <div>
            <label className="text-sm font-medium">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="email"
                required
                className="w-full pl-10 pr-3 py-2 border rounded-md"
                value={data.email}
                onChange={(e) => setData({...data, email: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="password"
                required
                className="w-full pl-10 pr-3 py-2 border rounded-md"
                value={data.password}
                onChange={(e) => setData({...data, password: e.target.value})}
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded-md font-medium hover:bg-blue-700 flex justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLogin ? "Sign In" : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline">
            {isLogin ? "Need an account? Sign up" : "Have an account? Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}