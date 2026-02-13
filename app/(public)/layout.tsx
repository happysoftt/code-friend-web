import Navbar from "@/components/layout/Navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar /> {/* Navbar จะแสดงเฉพาะในหน้า Public เท่านั้น */}
      <main className="flex-grow pt-20 pb-10">
        {children}
      </main>
      <footer className="border-t border-slate-800 py-10 text-center bg-slate-950 mt-auto">
          <div className="container mx-auto px-4">
              <p className="text-slate-500">© 2024 Code Friend. All rights reserved.</p>
          </div>
      </footer>
    </div>
  );
}