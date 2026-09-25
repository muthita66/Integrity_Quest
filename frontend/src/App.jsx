import { Routes, Route } from "react-router-dom";

import AuthPage from "./components/pages/AuthPage";
import MapPage from "./components/pages/MapPage";
import PreTestPage from "./components/pages/PreTestPage";
import SettingsPage from "./components/pages/SettingsPage";
import ProgressPage from "./components/pages/ProgressPage";
import TeacherPage from "./components/pages/TeacherPage";

import UnitContentPage from "./components/pages/UnitContentPage";

import Level1IntrpPage from "./components/unit1/level1/scenes/Level1IntroPage";
import AttendanceIntroAnimation from "./components/unit1/level1/AttendanceIntroAnimation";

import MirrorQuizPage from "./components/unit1/level1/components/MirrorQuizPage";
import MirrorResultPage from "./components/unit1/level1/components/MirrorResultPage";

import FinalLevel from "./components/unit1/finalLevel/FinalLevel";
import TitleFinal from "./components/unit1/finalLevel/components/TitleScreen"

import LevelTransition from "./components/common/LevelTransition";

import BubbleShooterPage from "./components/unit1/level2/bubbleShooterPage";
import Unit1Level2IntroPage from "./components/unit1/level2/scenes/Level2IntroPage";
import Unit1Level2ResultPage from "./components/unit1/level2/components/BubbleResultPage";

// unit 1: Final Level
import CaseSelect from "./components/unit1/finalLevel/components/CaseSelect";

import Unit2IntroPage from "./components/unit2/level1/introPage";
import ShoppingGame from "./components/unit2/level1/ShoppingGame";
import Unit2ResultPage from "./components/unit2/level1/resultPage";
import Unit2Level2IntroPage from "./components/unit2/level2/Level2IntroPage";
import CalculationGame from "./components/unit2/level2/CalculationGame";
import FinalLevelGame from "./components/unit2/finalLevel/FinalLevelGame";
import Unit2FinalLevelIntroPage from "./components/unit2/finalLevel/FinalLevelIntroPage";
import SceneMission from "./components/unit2/finalLevel/scenes/SceneMission";

import Level1IntroPage from "./components/unit3/level1/scenes/Level1IntroPage";
import ReceiptGamePage from "./components/unit3/level1/ReceiptGamePage";
import ResultPage from "./components/unit3/level1/ResultPage";


import Level2IntroPage from "./components/unit3/level2/scenes/Level2IntroPage";
import MoneyGamePage from "./components/unit3/level2/MoneyGamePage";
import MoneyResultPage from "./components/unit3/level2/ResultPage";

import Unit3FinalLevel from "./components/unit3/finalLevel/TreasurerGame";
import FinalLevelIntroPage from "./components/unit3/finalLevel/scenes/FinalLevelIntroPage";

import Intro from "./components/Unit4/Intro";
import Level1Fake from "./components/Unit4/level1Fake";
import TutorialSlip from "./components/Unit4/TutorialSlip";
import SlipMission from "./components/Unit4/SlipMission";
import Level2Slot from "./components/Unit4/level2Slot";
import FinalMission from "./components/Unit4/FinalMission";

import useActivityTracker from "./components/hooks/useActivityTracker";

function App() {
  useActivityTracker();
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/pretest" element={<PreTestPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/progress" element={<ProgressPage />} />

      <Route path="/teacher" element={<TeacherPage />} />

      <Route path="/unit/:unitId" element={<UnitContentPage />} />

      {/* Unit 1 */}
      <Route path="/unit1/Level1IntroPage" element={<Level1IntrpPage />} />
      <Route path="/unit1/MirrorIntroPage2" element={<AttendanceIntroAnimation />} />

      <Route path="/unit1/Quizlevel1" element={<MirrorQuizPage />} />
      <Route path="/unit1/resultlevel1" element={<MirrorResultPage />} />

      <Route path="/unit1/level2/intro" element={<Unit1Level2IntroPage />} />
      <Route path="/unit1/level2" element={<BubbleShooterPage />} />
      <Route path="/unit1/level2/result" element={<Unit1Level2ResultPage />} />

      <Route path="/unit1/final" element={<FinalLevel />} />
      <Route path="/unit1/final/start" element={<TitleFinal />} />
      <Route path="/unit1/final/caseSelect" element={<CaseSelect />} />

      <Route path="/unit1/level2/transition" element={<LevelTransition nextPath="/unit1/level2/intro" />} />

      {/* Unit 2 */}
      <Route path="/unit2/intro" element={<Unit2IntroPage />} />
      <Route path="/unit2/level1" element={<ShoppingGame />} />
      <Route path="/unit2/level2" element={<CalculationGame />} />

      {/* Unit 4 */}
      <Route path="/unit4/intro" element={<Intro />} />
      <Route path="/unit4/level1" element={<Level1Fake />} />
      <Route path="/unit4/tutorialSlip" element={<TutorialSlip />} />
      <Route path="/unit4/slipMission" element={<SlipMission />} />
      <Route path="/unit4/level2" element={<Level2Slot />} />
      <Route path="/unit4/final" element={<FinalMission />} />

      <Route path="/unit2/level1/result" element={<Unit2ResultPage />} />

      <Route path="/unit2/level2/intro" element={<Unit2Level2IntroPage />} />
      <Route path="/unit2/level2/start" element={<CalculationGame />} />

      <Route path="/unit2/final/intro" element={<Unit2FinalLevelIntroPage />} />
      <Route path="/unit2/final/introMission" element={<SceneMission />} />
      <Route path="/unit2/final" element={<FinalLevelGame skipStartPage={true} />} />

      {/* Unit 3 */}
      <Route path="/unit3/level1/intro" element={<Level1IntroPage />} />
      <Route path="/unit3/level1/game" element={<ReceiptGamePage />} />
      <Route path="/unit3/level1/result" element={<ResultPage />} />

      <Route path="/unit3/level2/intro" element={<Level2IntroPage />} />

      <Route path="/unit3/level2/game" element={<MoneyGamePage />} />
      <Route path="/unit3/level2/result" element={<MoneyResultPage />} />

      <Route path="/unit3/final/start" element={<FinalLevelIntroPage />} />
      <Route path="/unit3/final" element={<Unit3FinalLevel />} />
    </Routes>
  );
}

export default App;