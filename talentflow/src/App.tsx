import { useEffect } from "react";
import { seedDatabase } from "./lib/seed";
import { Routes, Route, NavLink } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
import { JobsPage } from "./pages/JobsPage";
import { JobDetailPage } from "./pages/JobDetailPage";
import { CandidatesPage } from "./pages/CandidatesPage";
import { CandidateProfilePage } from "./pages/CandidateProfilePage";
import { AssessmentBuilderPage } from "./pages/AssessmentBuilderPage";
import { AssessmentTakerPage } from "./pages/AssessmentTakerPage";

const NotFoundPage = () => (
  <h2 className="text-xl text-red-400">404 Not Found</h2>
);

function App() {
  useEffect(() => {
    seedDatabase();
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0f0f1a] via-[#151527] to-[#1e1e2f] text-gray-100">
      <nav className="w-64 p-6 backdrop-blur-xl bg-white/5 border-r border-white/10 shadow-xl flex flex-col">
        <h1 className="text-3xl font-bold mb-10 tracking-tight bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          TalentFlow
        </h1>
        <ul className="space-y-3">
          {[
            { name: "Dashboard", path: "/" },
            { name: "Jobs", path: "/jobs" },
            { name: "Candidates", path: "/candidates" },
          ].map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-xl transition-all duration-300 
                  ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-cyan-300 shadow-lg shadow-cyan-500/20"
                      : "hover:bg-white/5 hover:text-cyan-300"
                  }`
                }
              >
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <main className="flex-1 p-10 overflow-y-auto">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:jobId" element={<JobDetailPage />} />
          <Route path="/candidates" element={<CandidatesPage />} />
          <Route path="/candidates/:candidateId" element={<CandidateProfilePage />} />
          <Route path="/jobs/:jobId/assessment" element={<AssessmentBuilderPage />} />
          <Route path="/jobs/:jobId/apply" element={<AssessmentTakerPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;