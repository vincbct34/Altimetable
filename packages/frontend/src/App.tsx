import { PlanningCalendar } from './components/PlanningCalendar'
import './App.css'

function App() {
  return (
    <>
      <header className="app-header">
        <h1 className="app-wordmark">
          <span className="app-ring" aria-hidden="true" />
          Altimetable
        </h1>
        <p className="app-tagline">Apprenticeship planning</p>
      </header>

      <PlanningCalendar />
    </>
  )
}

export default App
