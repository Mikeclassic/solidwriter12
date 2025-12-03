import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Plus, Zap, LogOut } from "lucide-react";
import { Progress } from "@/components/ui/progress"; // Assuming you have shadcn UI, or use standard div

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth");

  const user = await db.user.findUnique({
    where: { email: session.user.email! },
  });

  const documents = await db.document.findMany({
    where: { userId: user?.id },
    orderBy: { updatedAt: "desc" },
  });

  const usagePercent = user ? (user.apiUsage / user.usageLimit) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <div className="flex gap-2">
            <form action="/api/auth/signout" method="POST">
                <button className="p-2 text-slate-400 hover:text-slate-900"><LogOut className="w-5 h-5"/></button>
            </form>
        </div>
      </div>

      {/* Stats Card */}
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Zap className="h-4 w-4 text-yellow-500 fill-current" /> WORDS USED
            </div>
            <button className="text-xs font-bold text-blue-600 hover:underline">UPGRADE</button>
        </div>
        <div className="text-2xl font-bold text-slate-900 mb-3">
            {user?.apiUsage.toLocaleString()} <span className="text-slate-400 text-lg">/ {user?.usageLimit.toLocaleString()}</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(usagePercent, 100)}%` }}></div>
        </div>
      </div>

      {/* New Content Button */}
      <div className="max-w-4xl mx-auto mb-8">
        <Link href="/wizard">
            <button className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-lg shadow-md transition-all flex justify-center items-center gap-2">
                <Plus className="h-5 w-5" /> New Content
            </button>
        </Link>
      </div>

      {/* Documents List */}
      <div className="max-w-4xl mx-auto space-y-4">
        {documents.map((doc) => (
          <Link key={doc.id} href={`/documents/${doc.id}`}>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-400 transition-all flex items-center gap-4 group cursor-pointer">
                <div className="p-3 bg-blue-50 rounded-lg text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FileText className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 text-lg">{doc.title || "Untitled Document"}</h3>
                    <p className="text-sm text-slate-500">{new Date(doc.updatedAt).toLocaleDateString()}</p>
                </div>
            </div>
          </Link>
        ))}
        {documents.length === 0 && (
            <div className="text-center py-12 text-slate-400">No documents yet. Create one!</div>
        )}
      </div>
    </div>
  );
}