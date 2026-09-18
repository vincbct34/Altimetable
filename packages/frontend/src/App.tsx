import { PlanningCalendar } from "./components/PlanningCalendar";
import "./App.css";

function App() {
  return (
    <>
      <header className="app-header">
        <h1>Altimetable</h1>
        <p>Apprenticeship planning</p>
      </header>

      <PlanningCalendar />
    </>
  );
}

export default App;
