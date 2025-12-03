import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Editor from "@/components/editor";

export default async function DocumentPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth");

  const doc = await db.document.findUnique({ where: { id: params.id } });
  if (!doc) notFound();

  return <Editor document={doc} />;
}