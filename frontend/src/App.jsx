import { Navigate, Routes, Route, useNavigate } from "react-router-dom";

import AuthPage from "./components/pages/AuthPage";
import MapPage from "./components/pages/MapPage";
import PreTestPage from "./components/pages/PreTestPage";
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


import Unit2IntroPage from "./components/unit2/level1/introPage";
import ShoppingGame from "./components/unit2/level1/ShoppingGame";
import Unit2ResultPage from "./components/unit2/level1/resultPage";
import Unit2Level2IntroPage from "./components/unit2/level2/Level2IntroPage";
import Unit2SceneMission from "./components/unit2/level1/scenes/SceneMission";
import CalculationGame from "./components/unit2/level2/CalculationGame";
import FinalLevelGame from "./components/unit2/finalLevel/FinalLevelGame";

import SceneMission from "./components/unit2/finalLevel/scenes/SceneThreeIntro";

import Level1IntroPage from "./components/unit3/level1/scenes/Level1IntroPage";
import ReceiptGamePage from "./components/unit3/level1/ReceiptGamePage";
import ResultPage from "./components/unit3/level1/ResultPage";


import Level2IntroPage from "./components/unit3/level2/scenes/Level2IntroPage";
import MoneyGamePage from "./components/unit3/level2/MoneyGamePage";
import MoneyResultPage from "./components/unit3/level2/ResultPage";

import Unit3FinalLevel from "./components/unit3/finalLevel/TreasurerGame";
import FinalLevelIntroPage from "./components/unit3/finalLevel/scenes/FinalLevelIntroPage";

import Unit4Book from "./components/Unit4/Unit4Book";
import PreBookIntro from "./components/Unit4/PreBookIntro";
import Unit4Completion from "./components/Unit4/Completion";

// Unit4 Level1
import Unit4Level1Intro from "./components/Unit4/Level1/IntroScene";
import Unit4Level1Game from "./components/Unit4/Level1/Game";
import Unit4Level1Result from "./components/Unit4/Level1/Result";

// Unit4 Level2
import Unit4Level2Intro from "./components/Unit4/Level2/IntroScene";
import Unit4Level2Game from "./components/Unit4/Level2/Game";
import Unit4Level2Result from "./components/Unit4/Level2/Result";

// Unit4 Level3
import Unit4Level3Intro from "./components/Unit4/Level3/IntroScene";
import Unit4Level3Game from "./components/Unit4/Level3/Game";
import Unit4Level3Result from "./components/Unit4/Level3/Result";

// Unit 5
import Unit5Intro from "./components/Unit5/Level1/IntroLevel1";
import Unit5Tutorial from "./components/Unit5/Level1/Level1Tutorial";
import Unit5Level1Game from "./components/Unit5/Level1/GameLevel1";
import Unit5Level2Intro from "./components/Unit5/Level2/Level2Intro";
import Unit5Level2Game from "./components/Unit5/Level2/GameLevel2";
import Unit5Result from "./components/Unit5/Level2/ResultPopup";
import Unit5Level3Game from "./components/Unit5/Level3/GameLevel3";

// Unit 6
import Unit6Intro from "./components/Unit6/Intro1";
import Unit6Level1Game from "./components/Unit6/Game1";
import Unit6Level2Game from "./components/Unit6/Game2";
import Unit6FinalGame from "./components/Unit6/Game3";

function Unit6IntroRoute() {
  const navigate = useNavigate();
  return <Unit6Intro onStart={() => navigate("/unit6/game1")} />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/pretest" element={<PreTestPage />} />

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

      <Route
        path="/unit1/level2/transition"
        element={
          <LevelTransition
            nextPath="/unit1/level2/intro"
          />
        }
      />


      {/* Unit 2 */}
      <Route path="/unit2/intro" element={<Unit2IntroPage />} />
      <Route path="/unit2/level1" element={<ShoppingGame />} />

      <Route path="/unit2/level2" element={<CalculationGame />} />
      <Route path="/unit2/final" element={<FinalLevelGame />} />

      {/* Unit 3 */}
      <Route path="/unit3/level1/intro" element={<Level1IntroPage />} />
      <Route path="/unit3/level1/game" element={<ReceiptGamePage />} />
      <Route path="/unit3/level1/result" element={<ResultPage />} />

      <Route
        path="/unit3/level2/intro"
        element={<Level2IntroPage />}
      />

      <Route
        path="/unit3/level2/game"
        element={<MoneyGamePage />}
      />
      <Route path="/unit3/level2/result" element={<MoneyResultPage />} />
      <Route path="/unit3/final/start" element={<FinalLevelIntroPage />} />
      <Route path="/unit3/final" element={<Unit3FinalLevel />} />

      {/* Unit 4 */}
      {/* Friendly story setup comes before the original book cover. */}
      <Route path="/unit4/intro" element={<PreBookIntro />} />
      <Route path="/unit4/book" element={<Unit4Book />} />
      <Route path="/unit4/complete" element={<Unit4Completion />} />
      <Route path="/unit4/cover" element={<PreBookIntro />} />
      <Route path="/unit4/book-cover" element={<Navigate to="/unit4/book" replace />} />

      {/* Unit4 Level1 - Fake Slip */}
      <Route path="/unit4/level1/intro" element={<Unit4Level1Intro />} />
      <Route path="/unit4/level1" element={<Unit4Level1Intro />} />
      <Route path="/unit4/level1/game" element={<Unit4Level1Game />} />
      <Route path="/unit4/level1/result" element={<Unit4Level1Result />} />

      {/* Unit4 Level2 - Slot Machine Scam */}
      <Route path="/unit4/level2/intro" element={<Unit4Level2Intro />} />
      <Route path="/unit4/level2/game" element={<Unit4Level2Game />} />
      <Route path="/unit4/level2/result" element={<Unit4Level2Result />} />

      {/* Unit4 Level3 - Final Mission */}
      <Route path="/unit4/level3/intro" element={<Unit4Level3Intro />} />
      <Route path="/unit4/level3/game" element={<Unit4Level3Game />} />
      <Route path="/unit4/level3/result" element={<Unit4Level3Result />} />

      {/* Unit 5 - Zero Corruption */}
      <Route path="/unit5/intro" element={<Unit5Intro />} />
      <Route path="/unit5/tutorial" element={<Unit5Tutorial />} />
      <Route path="/unit5/game" element={<Unit5Level1Game />} />
      <Route path="/unit5/level1/intro" element={<Unit5Tutorial />} />
      <Route path="/unit5/level1/game" element={<Unit5Level1Game />} />
      <Route path="/unit5/2Intro" element={<Unit5Level2Intro />} />
      <Route path="/unit5/game2" element={<Unit5Level2Game />} />
      <Route path="/unit5/level2/intro" element={<Unit5Level2Intro />} />
      <Route path="/unit5/level2/game" element={<Unit5Level2Game />} />
      <Route path="/unit5/result" element={<Unit5Result />} />
      <Route path="/unit5/game3" element={<Unit5Level3Game />} />
      <Route path="/unit5/level3/game" element={<Unit5Level3Game nextRoute="/unit6/intro" />} />

      {/* Unit 6 - The Ambassador */}
      <Route path="/unit6/intro" element={<Unit6IntroRoute />} />
      <Route path="/unit6/game1" element={<Unit6Level1Game nextRoute="/unit6/game2" />} />
      <Route path="/unit6/level1" element={<Unit6Level1Game nextRoute="/unit6/game2" />} />
      <Route path="/unit6/game2" element={<Unit6Level2Game />} />
      <Route path="/unit6/level2" element={<Unit6Level2Game />} />
      <Route path="/unit6/game3" element={<Unit6FinalGame />} />
      <Route path="/unit6/level3" element={<Unit6FinalGame />} />

      <Route path="/unit2/level1/result" element={<Unit2ResultPage />} />
      <Route path="/sceneMission" element={<Unit2SceneMission />} />

      <Route path="/unit2/level2/intro" element={<Unit2Level2IntroPage />} />
      <Route path="/unit2/level2/start" element={<CalculationGame />} />

      <Route path="/unit2/final/introMission" element={<SceneMission />} />
      <Route path="/unit2/final" element={<FinalLevelGame />} />

    </Routes>
  );
}

export default App;
