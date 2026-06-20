import { auth } from "@/auth";
import { Activity, ShieldCheck, Zap, Users } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-8 fade-in">
      
      {/* HEADER */}
      <header>
        <h1 className="text-3xl font-semibold text-white tracking-tight">System Overview</h1>
        <p className="text-gray-400 mt-1">Welcome to the IERT-OS Command Center, {session?.user?.name?.split(' ')[0]}.</p>
      </header>

      {/* METRICS GRID (Static for now, dynamic later) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Active Members" 
          value="1,248" 
          trend="+12 this week" 
          icon={<Users className="text-blue-400" size={20} />} 
        />
        <MetricCard 
          title="Treasury Balance" 
          value="₹45,200" 
          trend="Pending Approval: ₹2k" 
          icon={<Activity className="text-emerald-400" size={20} />} 
        />
        <MetricCard 
          title="Hardware Checked Out" 
          value="14 Assets" 
          trend="3 Overdue" 
          icon={<Zap className="text-amber-400" size={20} />} 
        />
        <MetricCard 
          title="System Status" 
          value="Optimal" 
          trend="0 Pending Audits" 
          icon={<ShieldCheck className="text-indigo-400" size={20} />} 
        />
      </div>

      {/* TWO COLUMN LAYOUT FOR CHARTS/LOGS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MAIN DATA AREA */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <h2 className="text-lg font-medium text-white mb-4">Recent Treasury Activity</h2>
          <div className="flex items-center justify-center h-64 border border-dashed border-white/10 rounded-lg bg-black/20">
            <p className="text-gray-500 text-sm font-mono">D3.js / Tremor.so Chart Hook will mount here</p>
          </div>
        </div>

        {/* AUDIT LOG */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <h2 className="text-lg font-medium text-white mb-4">Live Audit Log</h2>
          <div className="space-y-4">
            {/* Mock Logs */}
            <LogEntry time="10:42 AM" action="User Authentication" user={session?.user?.name || "System"} />
            <LogEntry time="09:15 AM" action="Budget Approved: Hackathon" user="Treasurer" />
            <LogEntry time="Yesterday" action="Arduino Uno Checked Out" user="Student_ID_402" />
            <LogEntry time="Yesterday" action="Role updated: Tech Lead" user="Admin" />
          </div>
        </div>

      </div>
    </div>
  );
}

function MetricCard({ title, value, trend, icon }: { title: string, value: string, trend: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 p-5 rounded-xl flex flex-col relative overflow-hidden group hover:border-white/10 transition-colors">
      <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
        {icon}
      </div>
      <span className="text-sm text-gray-400 font-medium">{title}</span>
      <span className="text-3xl font-bold text-white mt-2 mb-1">{value}</span>
      <span className="text-xs text-gray-500 font-mono">{trend}</span>
    </div>
  );
}

function LogEntry({ time, action, user }: { time: string, action: string, user: string }) {
  return (
    <div className="flex items-start gap-3 border-l-2 border-white/10 pl-3">
      <div className="w-1.5 h-1.5 rounded-full bg-white/40 mt-1.5 -ml-[19px]" />
      <div>
        <p className="text-sm text-gray-300">{action}</p>
        <p className="text-xs font-mono text-gray-500 mt-0.5">{user} • {time}</p>
      </div>
    </div>
  );
}