import { useEffect } from "react";
import { seedDatabase } from "./lib/seed";
import { Routes, Route, Link } from "react-router-dom";
import { JobsPage } from "./pages/JobsPage";
import { JobDetailPage } from "./pages/JobDetailPage";
import { CandidatesPage } from "./pages/CandidatesPage";
import { CandidateProfilePage } from "./pages/CandidateProfilePage";
import { AssessmentBuilderPage } from "./pages/AssessmentBuilderPage";

const DashboardPage = () => <h2>Dashboard</h2>;
const NotFoundPage = () => <h2>404 Not Found</h2>;

function App() {
  useEffect(() => {
    seedDatabase();
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <nav
        style={{
          borderRight: "1px solid #ccc",
          padding: "1rem",
          width: "250px",
        }}
      >
        <h1>TalentFlow</h1>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li>
            <Link to="/">Dashboard</Link>
          </li>
          <li>
            <Link to="/jobs">Jobs</Link>
          </li>
          <li>
            <Link to="/candidates">Candidates</Link>
          </li>
        </ul>
      </nav>
      <main style={{ padding: "1rem", flex: 1 }}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:jobId" element={<JobDetailPage />} />
          <Route path="/candidates" element={<CandidatesPage />} />
          <Route
            path="/candidates/:candidateId"
            element={<CandidateProfilePage />}
          />
          <Route
            path="/jobs/:jobId/assessment"
            element={<AssessmentBuilderPage />}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
