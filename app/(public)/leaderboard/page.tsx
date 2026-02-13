import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { Trophy, Medal, Crown } from "lucide-react";

export const revalidate = 60;

async function getTopRankers() {
  return await prisma.user.findMany({
    take: 20,
    orderBy: { xp: 'desc' },
    where: {
      isActive: true,
      role: {
        name: "USER"
      }
    },
    select: {
      id: true,
      name: true,
      image: true,
      xp: true,
      level: true,
      _count: {
        select: { snippets: true, showcases: true }
      }
    }
  });
}

export default async function LeaderboardPage() {
  const topUsers = await getTopRankers();
  const top3 = topUsers.slice(0, 3);
  const others = topUsers.slice(3);

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-yellow-500/30 font-sans pb-24">
      
      {/* --- HERO HEADER --- */}
      <div className="relative pt-32 pb-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-[#020617] pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="container mx-auto px-4 text-center relative z-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-yellow-300 text-xs font-bold mb-6 backdrop-blur-md shadow-lg shadow-yellow-900/10">
                 <Trophy size={14} /> Leaderboard
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                 Hall of <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 animate-pulse">Fame</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                 ทำความรู้จักกับสุดยอดนักพัฒนาที่มีส่วนร่วมสูงสุดในชุมชน <br className="hidden md:block"/> แบ่งปันความรู้ สร้างสรรค์ผลงาน และเติบโตไปด้วยกัน
            </p>
          </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* --- TOP 3 PODIUM --- */}
        {top3.length > 0 && (
            <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8 mb-16 px-4">
                
                {/* Rank 2 */}
                {top3[1] && (
                    <div className="order-2 md:order-1 flex flex-col items-center w-full md:w-1/3 group">
                        <div className="relative w-20 h-20 md:w-24 md:h-24 mb-4 rounded-full border-4 border-slate-700 overflow-hidden shadow-2xl group-hover:scale-105 transition-transform">
                            <Image 
                                src={top3[1].image || "/default-avatar.png"} 
                                alt={top3[1].name || "User"} 
                                fill 
                                sizes="(max-width: 768px) 100vw, 33vw"
                                className="object-cover" 
                            />
                            <div className="absolute -bottom-2 -right-2 bg-slate-700 text-white w-8 h-8 flex items-center justify-center rounded-full font-bold border-2 border-[#020617]">2</div>
                        </div>
                        <div className="text-center mb-4">
                            <h3 className="font-bold text-white truncate max-w-[150px]">{top3[1].name}</h3>
                            <p className="text-xs text-slate-500 font-mono">{top3[1].xp.toLocaleString()} XP</p>
                        </div>
                        <div className="w-full h-32 bg-gradient-to-t from-slate-800 to-slate-900 rounded-t-2xl border-t border-x border-slate-700 relative overflow-hidden flex items-end justify-center pb-4">
                            <Medal size={48} className="text-slate-400 opacity-20" />
                        </div>
                    </div>
                )}

                {/* Rank 1 (Center) */}
                {top3[0] && (
                    <div className="order-1 md:order-2 flex flex-col items-center w-full md:w-1/3 z-10 -mt-8 md:-mt-0 group">
                        <div className="relative">
                            <Crown size={32} className="text-yellow-400 absolute -top-10 left-1/2 -translate-x-1/2 animate-bounce" />
                            <div className="relative w-24 h-24 md:w-32 md:h-32 mb-4 rounded-full border-4 border-yellow-500 overflow-hidden shadow-[0_0_30px_rgba(234,179,8,0.3)] group-hover:scale-105 transition-transform">
                                <Image 
                                    src={top3[0].image || "/default-avatar.png"} 
                                    alt={top3[0].name || "User"} 
                                    fill 
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                    className="object-cover" 
                                />
                                <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black w-10 h-10 flex items-center justify-center rounded-full font-bold border-4 border-[#020617]">1</div>
                            </div>
                        </div>
                        <div className="text-center mb-4">
                            <h3 className="font-bold text-xl text-yellow-400 truncate max-w-[180px]">{top3[0].name}</h3>
                            <p className="text-sm text-slate-400 font-mono">{top3[0].xp.toLocaleString()} XP</p>
                        </div>
                        <div className="w-full h-40 bg-gradient-to-t from-yellow-900/20 to-yellow-600/20 rounded-t-2xl border-t border-x border-yellow-500/30 relative overflow-hidden flex items-end justify-center pb-4 backdrop-blur-sm">
                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
                            <Trophy size={64} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                        </div>
                    </div>
                )}

                {/* Rank 3 */}
                {top3[2] && (
                    <div className="order-3 flex flex-col items-center w-full md:w-1/3 group">
                        <div className="relative w-20 h-20 md:w-24 md:h-24 mb-4 rounded-full border-4 border-amber-700 overflow-hidden shadow-2xl group-hover:scale-105 transition-transform">
                            <Image 
                                src={top3[2].image || "/default-avatar.png"} 
                                alt={top3[2].name || "User"} 
                                fill 
                                sizes="(max-width: 768px) 100vw, 33vw"
                                className="object-cover" 
                            />
                            <div className="absolute -bottom-2 -right-2 bg-amber-700 text-white w-8 h-8 flex items-center justify-center rounded-full font-bold border-2 border-[#020617]">3</div>
                        </div>
                        <div className="text-center mb-4">
                            <h3 className="font-bold text-white truncate max-w-[150px]">{top3[2].name}</h3>
                            <p className="text-xs text-slate-500 font-mono">{top3[2].xp.toLocaleString()} XP</p>
                        </div>
                        <div className="w-full h-24 bg-gradient-to-t from-amber-900/20 to-amber-800/20 rounded-t-2xl border-t border-x border-amber-700/30 relative overflow-hidden flex items-end justify-center pb-4">
                            <Medal size={48} className="text-amber-700 opacity-40" />
                        </div>
                    </div>
                )}

            </div>
        )}

        {/* --- LIST (Rank 4+) --- */}
        <div className="space-y-3 bg-slate-900/50 p-4 rounded-3xl border border-slate-800 backdrop-blur-sm">
          {others.map((user, index) => {
            const rank = index + 4;
            return (
              <div 
                key={user.id}
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/50 border border-slate-800/50 hover:bg-slate-800 transition-colors group"
              >
                {/* Rank Number */}
                <div className="w-8 text-center font-bold text-slate-500 text-lg font-mono">
                  {rank}
                </div>

                {/* Avatar */}
                <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-slate-700 group-hover:border-slate-500 transition-colors">
                  <Image 
                    src={user.image || "/default-avatar.png"} 
                    alt={user.name || "User"} 
                    fill 
                    sizes="48px"
                    className="object-cover" 
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-white truncate group-hover:text-purple-400 transition-colors">{user.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">Lvl. {user.level}</span>
                    <span className="hidden sm:inline">• {user._count.snippets} Snippets</span>
                    <span className="hidden sm:inline">• {user._count.showcases} Projects</span>
                  </div>
                </div>

                {/* XP */}
                <div className="text-right">
                  <div className="text-sm font-bold text-white font-mono">{user.xp.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-600 uppercase font-bold">XP</div>
                </div>
              </div>
            );
          })}
          
          {others.length === 0 && <p className="text-center text-slate-500 py-4">ยังไม่มีผู้ใช้อื่นๆ</p>}
        </div>

      </div>
    </div>
  );
}