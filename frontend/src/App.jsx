import { Routes, Route } from "react-router-dom";

import AuthPage from "./components/pages/AuthPage";
import MapPage from "./components/pages/MapPage";
import PreTestPage from "./components/pages/PreTestPage";
import UnitContentPage from "./components/pages/UnitContentPage";

import MirrorQuiz from "./components/unit1/level1";

import ShoppingGame from "./components/unit2/level1";
import CalculationGame from "./components/unit2/level2";
import FinalMissionGame from "./components/unit2/FinalMission";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/pretest" element={<PreTestPage />} />

      <Route path="/unit/:unitId" element={<UnitContentPage />} />

      {/* Unit 1 */}
      <Route path="/unit1/level1" element={<MirrorQuiz />} />

      {/* Unit 2 */}
      <Route path="/unit2/level1" element={<ShoppingGame />} />
      <Route path="/unit2/level2" element={<CalculationGame />} />
      <Route path="/unit2/final" element={<FinalMissionGame />} />
    </Routes>
  );
}

export default App;