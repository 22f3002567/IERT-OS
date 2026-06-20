
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Wallet, 
  Calendar, 
  Cpu, 
  BookOpen, 
  Shield, 
  LogOut 
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Kick out unauthenticated users immediately
  if (!session?.user) {
    redirect("/"); 
  }

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 flex flex-col md:flex-row font-sans selection:bg-white/30">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-[#0a0a0a] border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between sticky top-0 md:h-screen z-50">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
              <h1 className="font-bold tracking-widest text-white">IERT<span className="text-gray-500">-OS</span></h1>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            <div className="text-xs font-mono text-gray-500 mb-4 px-2 uppercase tracking-wider">Core Modules</div>
            
            <SidebarLink href="/dashboard" icon={<LayoutDashboard size={18} />} label="Overview" active />
            <SidebarLink href="/dashboard/treasury" icon={<Wallet size={18} />} label="Treasury Ledger" />
            <SidebarLink href="/dashboard/events" icon={<Calendar size={18} />} label="Chronosphere" />
            <SidebarLink href="/dashboard/hardware" icon={<Cpu size={18} />} label="Hardware Telemetry" />
            <SidebarLink href="/dashboard/vault" icon={<BookOpen size={18} />} label="Neural Vault" />
            
            <div className="text-xs font-mono text-gray-500 mt-8 mb-4 px-2 uppercase tracking-wider">Admin Matrix</div>
            <SidebarLink href="/dashboard/governance" icon={<Shield size={18} />} label="Governance & RBAC" />
          </nav>
        </div>

        {/* BOTTOM USER PROFILE */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3 mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={session.user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.name}`} 
              alt="Profile" 
              className="w-8 h-8 rounded-full border border-white/20"
              referrerPolicy="no-referrer"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{session.user.name}</p>
              <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
            </div>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-white/5 hover:bg-red-500/10 hover:text-red-400 border border-white/5 hover:border-red-500/20 transition-all text-sm font-medium text-gray-400">
              <LogOut size={16} />
              Terminate
            </button>
          </form>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 md:p-10">
          {children}
        </div>
      </main>
      
    </div>
  );
}

function SidebarLink({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link 
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
        active 
          ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" 
          : "text-gray-400 hover:text-white hover:bg-white/5"
      }`}
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </Link>
  );
}