import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AnnouncementBar from "@/components/shared/AnnouncementBar";
import { 
  ArrowRight, Code2, BookOpen, ShoppingBag, 
  Users, Zap, Terminal, Sparkles, Star, Rocket, LayoutDashboard, PenTool 
} from "lucide-react";

// Components
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import SpotlightCard from "@/components/ui/SpotlightCard";
import ParticleBackground from "@/components/ui/ParticleBackground";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // 1. ดึงข้อมูลทั้งหมดแบบ Parallel (เพื่อให้โหลดไวที่สุด)
  const [
    userCount,
    courseCount,
    snippetCount,
    products,
    courses,
    snippets,
    showcases,
    topUsers,
    articles
  ] = await Promise.all([
    prisma.user.count(),
    prisma.learningPath.count({ where: { published: true } }),
    prisma.snippet.count({ where: { isPublic: true, approved: true } }),
    // สินค้าแนะนำ (3 ชิ้น)
    prisma.product.findMany({ where: { isActive: true }, take: 3, orderBy: { createdAt: "desc" } }),
    // คอร์สล่าสุด (3 คอร์ส)
    prisma.learningPath.findMany({ where: { published: true }, take: 3, orderBy: { createdAt: "desc" }, include: { _count: { select: { lessons: true } } } }),
    // โค้ดล่าสุด (4 รายการ)
    prisma.snippet.findMany({ where: { isPublic: true, approved: true }, take: 4, orderBy: { createdAt: "desc" }, include: { author: true } }),
    // ผลงานล่าสุด (2 รายการ)
    prisma.showcase.findMany({ where: { approved: true }, take: 2, orderBy: { createdAt: "desc" }, include: { user: true } }),
    // Leaderboard (5 อันดับแรก)
    prisma.user.findMany({ take: 5, orderBy: { xp: 'desc' }, select: { id: true, name: true, image: true, xp: true, level: true } }),
    // Articles (3 บทความ)
    prisma.article.findMany({ where: { published: true }, take: 3, orderBy: { createdAt: "desc" }, include: { author: true }, include: { category: true } }) // *แก้ include category ให้ถูกต้องตาม schema ถ้ามี
  ]);

  return (
    
    <div className="min-h-screen bg-[#020617] text-white selection:bg-purple-500/30 font-sans">
      <AnnouncementBar />
      {/* =========================================
          HERO SECTION: พื้นที่ต้อนรับสุดอลังการ
         ========================================= */}
      <section className="relative pt-32 pb-20 overflow-hidden min-h-[90vh] flex flex-col justify-center items-center">
         <AnimatedBackground />
         <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
            <ParticleBackground />
         </div>

         <div className="container mx-auto px-4 text-center relative z-10">
             {/* Animated Badge */}
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-300 text-xs font-bold mb-8 backdrop-blur-md animate-fade-in-up hover:border-purple-500/50 transition-colors cursor-default select-none shadow-lg shadow-purple-900/10">
                 <span className="relative flex h-2 w-2">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                 </span>
                 Community for Modern Developers
             </div>

             <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tighter leading-[1.1]">
                 <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-500 drop-shadow-sm">
                    Level Up Your
                 </span>
                 <br/>
                 <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-500 animate-gradient-x">
                    Coding Journey
                 </span>
             </h1>

             <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-light">
                 แหล่งรวม Source Code คุณภาพ, คอร์สเรียนระดับโปร, และพื้นที่ปล่อยของสำหรับนักพัฒนา 
                 <br className="hidden md:block"/>
                 ยกระดับทักษะของคุณสู่อนาคต ได้แล้ววันนี้
             </p>

             <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                 <Link href="/store" className="group relative px-8 py-4 bg-white text-slate-950 rounded-full font-bold text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                     <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-slate-200 to-transparent -translate-x-full group-hover:animate-shimmer" />
                     <span className="relative flex items-center gap-2">
                        <ShoppingBag size={20} /> ช้อปเลย
                     </span>
                 </Link>
                 <Link href="/learn" className="px-8 py-4 bg-slate-900/50 text-white border border-slate-700 rounded-full font-bold text-lg hover:bg-slate-800/80 hover:border-slate-500 backdrop-blur-sm transition-all flex items-center gap-2 shadow-lg">
                     <BookOpen size={20} /> คอร์สเรียนฟรี
                 </Link>
             </div>

             {/* Stats Strip */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-24 pt-8 border-t border-slate-800/50">
                 {[
                    { label: "Developers", value: userCount, icon: Users },
                    { label: "Courses", value: courseCount, icon: BookOpen },
                    { label: "Snippets", value: snippetCount, icon: Code2 },
                    { label: "Trust Score", value: "100%", icon: Star },
                 ].map((stat, idx) => (
                    <div key={idx} className="flex flex-col items-center group cursor-default">
                        <stat.icon className="text-slate-500 mb-2 group-hover:text-purple-400 transition-colors" size={20} />
                        <span className="text-2xl font-bold text-white font-mono">{typeof stat.value === 'number' ? `${stat.value}+` : stat.value}</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">{stat.label}</span>
                    </div>
                 ))}
             </div>
         </div>
      </section>

      {/* =========================================
          TECH STACK MARQUEE: โลโก้วิ่งวน
         ========================================= */}
      <div className="py-10 bg-[#020617] border-y border-slate-800/50 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-transparent to-[#020617] z-10 pointer-events-none" />
          <div className="flex gap-16 animate-marquee whitespace-nowrap items-center opacity-40 hover:opacity-100 transition-opacity duration-500 select-none">
              {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex gap-16 items-center text-slate-400 font-bold text-xl uppercase tracking-widest">
                      <span>React</span><span>Next.js</span><span>TypeScript</span><span>Tailwind</span>
                      <span>Prisma</span><span>Node.js</span><span>Supabase</span><span>Python</span>
                      <span>Golang</span><span>Docker</span>
                  </div>
              ))}
          </div>
      </div>

      {/* =========================================
          STORE SECTION: สินค้าแนะนำ (Premium)
         ========================================= */}
      <section className="py-24 bg-slate-950 relative border-t border-slate-900">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/10 via-slate-950 to-slate-950 pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                  <div>
                      <h2 className="text-3xl font-bold flex items-center gap-3 text-white">
                        <span className="p-2 bg-green-500/10 rounded-lg text-green-400 border border-green-500/20"><ShoppingBag size={24} /></span>
                        ร้านค้าแนะนำ
                      </h2>
                      <p className="text-slate-400 mt-2">Source Code คุณภาพสูง พร้อมใช้งานจริง ลดเวลาการพัฒนา</p>
                  </div>
                  <Link href="/store" className="group text-green-400 hover:text-green-300 flex items-center gap-2 font-bold transition-all bg-green-900/10 px-4 py-2 rounded-full border border-green-900/20 hover:border-green-500/50">
                    ดูสินค้าทั้งหมด <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                  </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {products.map(product => (
                      <Link key={product.id} href={`/store/${product.slug}`} className="group relative block bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-green-500/50 hover:shadow-2xl hover:shadow-green-900/20 transition-all duration-500">
                          <div className="h-56 relative bg-slate-800 overflow-hidden">
                              {product.image ? (
                                <Image src={product.image} alt={product.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-700"><ShoppingBag size={48} opacity={0.2} /></div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
                              <div className="absolute top-3 right-3 flex gap-2">
                                {product.isFree && <span className="bg-green-500 text-slate-950 text-xs font-black px-2 py-1 rounded shadow-lg uppercase tracking-wider">Free</span>}
                              </div>
                          </div>
                          <div className="p-6">
                              <h3 className="font-bold text-xl text-white mb-2 truncate group-hover:text-green-400 transition-colors">{product.title}</h3>
                              <p className="text-slate-400 text-sm line-clamp-2 mb-4 h-10">{product.description || "ไม่มีรายละเอียด"}</p>
                              <div className="flex justify-between items-center pt-4 border-t border-slate-800/50">
                                  <div>
                                      <p className="text-xs text-slate-500 font-bold mb-0.5">ราคา</p>
                                      <span className={`font-mono text-lg font-bold ${product.isFree ? 'text-green-400' : 'text-white'}`}>
                                        {product.isFree ? "แจกฟรี" : `฿${Number(product.price).toLocaleString()}`}
                                      </span>
                                  </div>
                                  <span className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-green-600 group-hover:text-white transition-all">
                                    <ShoppingBag size={18} />
                                  </span>
                              </div>
                          </div>
                      </Link>
                  ))}
                  {products.length === 0 && <div className="col-span-3 py-20 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30 text-slate-500">เร็วๆ นี้</div>}
              </div>
          </div>
      </section>

      {/* =========================================
          LEARN SECTION: คอร์สเรียน (Knowledge)
         ========================================= */}
      <section className="py-24 bg-[#020617] relative">
          <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                  <div>
                      <h2 className="text-3xl font-bold flex items-center gap-3 text-white">
                        <span className="p-2 bg-purple-500/10 rounded-lg text-purple-400 border border-purple-500/20"><BookOpen size={24} /></span>
                        คอร์สเรียนล่าสุด
                      </h2>
                      <p className="text-slate-400 mt-2">เรียนรู้เทคโนโลยีใหม่ๆ ผ่านบทเรียนที่เข้าใจง่าย</p>
                  </div>
                  <Link href="/learn" className="group text-purple-400 hover:text-purple-300 flex items-center gap-2 font-bold transition-all">
                    ดูคอร์สทั้งหมด <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                  </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {courses.map(course => (
                      <SpotlightCard key={course.id} className="h-full bg-slate-900/40 border-slate-800 rounded-2xl">
                          <Link href={`/learn/${course.slug}`} className="block h-full group">
                              <div className="h-48 bg-slate-800 relative rounded-t-2xl overflow-hidden">
                                  {course.thumbnail ? (
                                    <Image src={course.thumbnail} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900"><BookOpen className="text-slate-700" size={48} /></div>
                                  )}
                              </div>
                              <div className="p-6">
                                  <div className="flex items-center gap-2 mb-3">
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wider">Course</span>
                                      <span className="text-slate-500 text-xs">• {new Date(course.updatedAt).toLocaleDateString()}</span>
                                  </div>
                                  <h3 className="font-bold text-xl mb-2 text-white group-hover:text-purple-400 transition-colors">{course.title}</h3>
                                  <p className="text-slate-400 text-sm line-clamp-2 mb-4">{course.description}</p>
                                  <div className="flex items-center text-xs text-slate-500 font-bold border-t border-slate-800 pt-4">
                                      <BookOpen size={14} className="mr-1" />
                                      <span>{course._count.lessons} บทเรียน</span>
                                  </div>
                              </div>
                          </Link>
                      </SpotlightCard>
                  ))}
                  {courses.length === 0 && <p className="text-slate-500 col-span-3 text-center py-10">ยังไม่มีคอร์สเรียน</p>}
              </div>
          </div>
      </section>

      {/* =========================================
          COMMUNITY & KNOWLEDGE
         ========================================= */}
      <section className="py-24 bg-gradient-to-b from-slate-900 to-[#020617] border-t border-slate-800">
          <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Left Column: Bento Grid for Community */}
                  <div className="lg:col-span-2 space-y-8">
                      <div className="flex justify-between items-end">
                         <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Zap className="text-yellow-400" /> คอมมูนิตี้</h2>
                         <Link href="/showcase" className="text-sm text-yellow-400 hover:underline">ดูผลงานทั้งหมด</Link>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {/* Large Snippet Box */}
                         <div className="md:col-span-2 bg-slate-900/50 rounded-3xl p-6 border border-slate-800 relative overflow-hidden group">
                             <div className="absolute top-0 right-0 p-24 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                             <div className="relative z-10 flex justify-between items-start">
                                 <div>
                                     <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Code2 size={20} className="text-blue-400"/> Snippets ล่าสุด</h3>
                                     <p className="text-slate-400 text-sm mb-4">โค้ดสั้นๆ หยิบไปใช้ได้ทันที</p>
                                 </div>
                                 <Link href="/snippets" className="text-xs bg-slate-800 hover:bg-blue-600 text-white px-3 py-1.5 rounded-full transition-colors">ดูทั้งหมด</Link>
                             </div>
                             <div className="grid gap-3 mt-4">
                                {snippets.map(snippet => (
                                    <Link key={snippet.id} href={`/snippets/${snippet.slug}`} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-blue-500/50 transition-all">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <span className="text-blue-400 text-[10px] font-mono border border-blue-900/30 bg-blue-900/10 px-1.5 py-0.5 rounded flex-shrink-0">{snippet.language}</span>
                                            <span className="text-slate-300 text-sm font-bold truncate">{snippet.title}</span>
                                        </div>
                                        <span className="text-slate-600 text-[10px] flex-shrink-0">by {snippet.author.name}</span>
                                    </Link>
                                ))}
                             </div>
                         </div>

                         {/* Showcase Items */}
                         {showcases.map((showcase) => (
                              <Link key={showcase.id} href="/showcase" className="relative h-48 rounded-3xl overflow-hidden border border-slate-800 group cursor-pointer">
                                  <Image src={showcase.image} alt="" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-5">
                                      <h4 className="text-white font-bold truncate text-sm">{showcase.title}</h4>
                                      <p className="text-xs text-slate-400">by {showcase.user.name}</p>
                                  </div>
                              </Link>
                          ))}
                      </div>
                  </div>

                  {/* Right Column: Articles & Leaderboard */}
                  <div className="space-y-8">
                       {/* Leaderboard Widget */}
                       <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
                          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                              <span className="text-yellow-400"><Sparkles size={18} /></span> Top Developers
                          </h3>
                          <div className="space-y-3">
                              {topUsers.map((user, index) => (
                                  <div key={user.id} className="flex items-center gap-3 p-2.5 bg-slate-800/50 rounded-xl border border-slate-700/30">
                                      <div className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold ${
                                          index === 0 ? 'bg-yellow-500 text-black' : 
                                          index === 1 ? 'bg-slate-300 text-black' : 
                                          index === 2 ? 'bg-orange-700 text-white' : 'bg-slate-700 text-slate-400'
                                      }`}>
                                          {index + 1}
                                      </div>
                                      <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden relative border border-slate-600">
                                          {user.image && <Image src={user.image} alt="" fill className="object-cover" />}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                          <p className="text-white text-xs font-bold truncate">{user.name}</p>
                                          <p className="text-[10px] text-slate-500">Lvl {user.level}</p>
                                      </div>
                                      <div className="text-right">
                                          <p className="text-yellow-400 text-xs font-bold">{user.xp}</p>
                                      </div>
                                  </div>
                              ))}
                              {topUsers.length === 0 && <p className="text-center text-slate-500 text-sm">รอการจัดอันดับ</p>}
                          </div>
                          <Link href="/leaderboard" className="block w-full text-center py-2.5 mt-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-white transition-colors">
                              ดูอันดับทั้งหมด
                          </Link>
                       </div>

                       {/* Articles Widget */}
                       <div>
                          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                              <span className="text-blue-400"><PenTool size={18} /></span> อ่านล่าสุด
                          </h3>
                          <div className="space-y-4">
                              {articles.map(article => (
                                  <Link key={article.id} href={`/articles/${article.slug}`} className="block group">
                                      <h4 className="text-sm font-bold text-slate-300 group-hover:text-blue-400 transition-colors line-clamp-1">{article.title}</h4>
                                      <p className="text-xs text-slate-500 mt-1">{new Date(article.createdAt).toLocaleDateString()}</p>
                                  </Link>
                              ))}
                              {articles.length === 0 && <p className="text-slate-500 text-sm">ยังไม่มีบทความ</p>}
                          </div>
                       </div>
                  </div>
              </div>
          </div>
      </section>

      {/* =========================================
          CTA SECTION: ปิดท้าย (เปลี่ยนตามสถานะล็อกอิน)
         ========================================= */}
      <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-[#020617] pointer-events-none" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="container mx-auto px-4 text-center relative z-10">
              {session ? (
                // --- กรณีล็อกอินแล้ว ---
                <div className="animate-fade-in-up">
                    <span className="inline-block p-4 rounded-full bg-green-500/10 mb-6 text-green-400 backdrop-blur-sm border border-green-500/20 shadow-[0_0_30px_-10px_rgba(74,222,128,0.3)]">
                        <Sparkles size={32} />
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                        ยินดีต้อนรับกลับมา, <span className="text-green-400">{session.user.name}</span>!
                    </h2>
                    <p className="text-slate-400 mb-10 max-w-xl mx-auto text-lg">
                        วันนี้คุณอยากสร้างสรรค์อะไร? ชุมชนแห่งนี้รอชมผลงานของคุณอยู่ 
                        <br/>ไปที่ Dashboard เพื่อเช็คสถิติ หรือเริ่มโปรเจกต์ใหม่ได้เลย
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/dashboard" className="px-10 py-4 bg-green-600 text-white rounded-full font-bold text-lg hover:bg-green-500 transition-all shadow-lg shadow-green-900/20 active:scale-95 flex items-center gap-2">
                            <LayoutDashboard size={20} /> ไปที่ Dashboard
                        </Link>
                        <Link href="/showcase" className="px-10 py-4 bg-slate-800 text-white rounded-full font-bold text-lg hover:bg-slate-700 transition-all border border-slate-700 flex items-center gap-2">
                            <Zap size={20} /> ส่งผลงานใหม่
                        </Link>
                    </div>
                </div>
              ) : (
                // --- กรณี "ยังไม่ล็อกอิน" ---
                <div className="animate-fade-in-up">
                    <span className="inline-block p-4 rounded-full bg-slate-800/50 mb-6 text-purple-300 backdrop-blur-sm border border-white/5">
                        <Rocket size={32} />
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                        พร้อมจะเริ่มต้นหรือยัง?
                    </h2>
                    <p className="text-slate-400 mb-10 max-w-xl mx-auto text-lg">
                        สมัครสมาชิกวันนี้เพื่อเข้าถึงเนื้อหาพิเศษ สั่งซื้อ Source Code ระดับพรีเมียม 
                        และเป็นส่วนหนึ่งของชุมชนนักพัฒนาที่เติบโตไวที่สุด
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/register" className="px-10 py-4 bg-white text-slate-950 rounded-full font-bold text-lg hover:bg-slate-200 transition-all shadow-lg shadow-white/10 active:scale-95">
                            สมัครสมาชิกฟรี
                        </Link>
                        <Link href="/store" className="px-10 py-4 bg-slate-800 text-white rounded-full font-bold text-lg hover:bg-slate-700 transition-all border border-slate-700">
                            ดูสินค้าทั้งหมด
                        </Link>
                    </div>
                </div>
              )}
          </div>
      </section>

    </div>
  );
}