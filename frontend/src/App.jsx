import { Routes, Route } from "react-router-dom";

import AuthPage from "./components/pages/AuthPage";
import MapPage from "./components/pages/MapPage";
import PreTestPage from "./components/pages/PreTestPage";
import UnitContentPage from "./components/pages/UnitContentPage";

import MirrorIntroPage from "./components/unit1/MirrorIntroPage";
import StartPage from "./components/unit1/startPage";
import MirrorQuizPage from "./components/unit1/MirrorQuizPage";
import MirrorResultPage from "./components/unit1/MirrorResultPage";

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
      <Route path="/unit1/Introlevel1" element={<MirrorIntroPage />} />
      <Route path="/unit1/start" element={<StartPage />} />
      <Route path="/unit1/Quizlevel1" element={<MirrorQuizPage />} />
      <Route path="/unit1/resultlevel1" element={<MirrorResultPage />} />

      {/* Unit 2 */}
      <Route path="/unit2/level1" element={<ShoppingGame />} />
      <Route path="/unit2/level2" element={<CalculationGame />} />
      <Route path="/unit2/final" element={<FinalMissionGame />} />
    </Routes>
  );
}

export default App;