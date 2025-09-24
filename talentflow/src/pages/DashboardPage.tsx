import { BarChart3, Users, Briefcase, Settings } from "lucide-react";

export function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950 text-white p-8">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-cyan-400 drop-shadow-lg">
          Dashboard
        </h1>
        <button className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md hover:bg-white/20 transition text-sm text-gray-300">
          Settings
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: "Total Candidates", value: "1,248", icon: Users },
          { label: "Active Jobs", value: "36", icon: Briefcase },
          { label: "Interviews Scheduled", value: "87", icon: BarChart3 },
          { label: "System Health", value: "Stable", icon: Settings },
        ].map((item, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl hover:bg-white/10 transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">{item.label}</span>
              <item.icon className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition" />
            </div>
            <p className="mt-4 text-2xl font-bold text-white">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
          <h2 className="text-xl font-semibold text-cyan-300 mb-4">
            Recent Activity
          </h2>
          <ul className="space-y-3 text-gray-300 text-sm">
            <li className="hover:text-white transition">
              • John Doe moved to Tech Stage
            </li>
            <li className="hover:text-white transition">
              • New job posted: Frontend Engineer
            </li>
            <li className="hover:text-white transition">
              • Maria scheduled interview with HR
            </li>
            <li className="hover:text-white transition">
              • Candidate Jane was hired 🎉
            </li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
          <h2 className="text-xl font-semibold text-cyan-300 mb-4">
            Performance Overview
          </h2>
          <div className="h-56 flex items-center justify-center text-gray-400">
            [Insert Chart Here]
          </div>
        </div>
      </div>
    </div>
  );
}
