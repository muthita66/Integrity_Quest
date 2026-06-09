import { Routes, Route } from "react-router-dom";

import AuthPage from "./components/pages/AuthPage";
import MapPage from "./components/pages/MapPage";
import PreTestPage from "./components/pages/PreTestPage";
import UnitContentPage from "./components/pages/UnitContentPage";

import MirrorIntroPage from "./components/unit1/MirrorIntroPage";
import MirrorQuizPage from "./components/unit1/MirrorQuizPage";

import ShoppingGame from "./components/unit2/level1";
import CalculationGame from "./components/unit2/level2";
import FinalMissionGame from "./components/unit2/FinalMission";

import Intro from "./components/Unit4/Intro";
import Level1Fake from "./components/Unit4/level1Fake";
import TutorialSlip from "./components/Unit4/TutorialSlip";
import SlipMission from "./components/Unit4/SlipMission";
import Level2Slot from "./components/Unit4/level2Slot";
import FinalMission from "./components/Unit4/FinalMission";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/pretest" element={<PreTestPage />} />

      <Route path="/unit/:unitId" element={<UnitContentPage />} />

      {/* Unit 1 */}
      <Route path="/unit1/Introlevel1" element={<MirrorIntroPage />} />
      <Route path="/unit1/Quizlevel1" element={<MirrorQuizPage />} />

      {/* Unit 2 */}
      <Route path="/unit2/level1" element={<ShoppingGame />} />
      <Route path="/unit2/level2" element={<CalculationGame />} />
      <Route path="/unit2/final" element={<FinalMissionGame />} />

      {/* Unit 4 */}
      <Route path="/unit4/intro" element={<Intro />} />
      <Route path="/unit4/level1" element={<Level1Fake />} />
      <Route path="/unit4/tutorialSlip" element={<TutorialSlip />} />
      <Route path="/unit4/slipMission" element={<SlipMission />} />
      <Route path="/unit4/level2" element={<Level2Slot />} />
      <Route path="/unit4/final" element={<FinalMission />} />
    </Routes>
  );
}

export default App;