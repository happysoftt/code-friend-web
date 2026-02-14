import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DebugPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="p-10 bg-black text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Debug Session Data</h1>
      <div className="bg-gray-800 p-4 rounded-lg overflow-auto">
        <pre>{JSON.stringify(session, null, 2)}</pre>
      </div>
      
      <div className="mt-4">
        <p><strong>Email:</strong> {session?.user?.email}</p>
        <p><strong>Role (ใน Session):</strong> {JSON.stringify((session?.user as any)?.role)}</p>
      </div>
    </div>
  );
}