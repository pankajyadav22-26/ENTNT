import { useEffect } from "react";
import { seedDatabase } from "./lib/seed";

function App() {
  useEffect(() => {
    seedDatabase();
  }, []);

  return (
    <div>
      <h1>TALENTFLOW</h1>
      <p>Welcome to TalentFlow!</p>
    </div>
  );
}

export default App;
