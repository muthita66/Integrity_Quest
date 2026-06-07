import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AuthPage from './components/pages/AuthPage'
import MirrorQuiz from './components/unit1/level1'
import UnitContentPage from './components/pages/UnitContentPage'
import ShoppingGame from './components/unit2/level1'
import CalculationGame from './components/unit2/level2'
import FinalMissionGame from './components/unit2/FinalMission'

function App() {
  return (
    <>

      <AuthPage />
      <MirrorQuiz />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<UnitContentPage />}
          />
          <Route
            path="/unit/:unitId"
            element={<UnitContentPage />}
          />
        </Routes>
      </BrowserRouter>
      <ShoppingGame />
      <CalculationGame />
      <FinalMissionGame />

    </>
  )
}

export default App
