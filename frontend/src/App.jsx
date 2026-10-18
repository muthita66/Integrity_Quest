import { lazy, Suspense } from "react";
import {
  Navigate,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import useUnit4ClickSound from './hooks/useUnit4ClickSound';
import useUnit5ClickSound from './hooks/useUnit5ClickSound';
import useUnit6ClickSound from './hooks/useUnit6ClickSound';
import useUnit6HoverSound from './hooks/useUnit6HoverSound';
import useUnit5HoverSound from './hooks/useUnit5HoverSound';
import Unit5Navigation from './components/Unit5/Unit5Navigation';
import Unit6Navigation from './components/Unit6/Unit6Navigation';
import Level2Music from './components/Unit5/Level2/Level2Music';
import Level3Music from './components/Unit5/Level3/Level3Music';

// ============================================================
// Common / Pages
// ============================================================

import AuthPage from "./components/pages/AuthPage";
const MapPage = lazy(() => import("./components/pages/MapPage"));
const PreTestPage = lazy(() => import("./components/pages/PreTestPage"));
const PostTestPage = lazy(() => import("./components/pages/PostTestPage"));
const SettingsPage = lazy(() => import("./components/pages/SettingsPage"));
const ProgressPage = lazy(() => import("./components/pages/ProgressPage"));
const TeacherPage = lazy(() => import("./components/pages/TeacherPage"));
const UnitContentPage = lazy(() => import("./components/pages/UnitContentPage"));

// ============================================================
// Unit 1 - Level 1
// ============================================================

const Level1IntrpPage = lazy(() => import("./components/unit1/level1/scenes/Level1IntroPage"));
const AttendanceIntroAnimation = lazy(() => import("./components/unit1/level1/AttendanceIntroAnimation"));

const MirrorQuizPage = lazy(() => import("./components/unit1/level1/components/MirrorQuizPage"));
const MirrorResultPage = lazy(() => import("./components/unit1/level1/components/MirrorResultPage"));

// ============================================================
// Unit 1 - Final
// ============================================================

const FinalLevel = lazy(() => import("./components/unit1/finalLevel/FinalLevel"));
const TitleFinal = lazy(() => import("./components/unit1/finalLevel/components/TitleScreen"));
const CaseSelect = lazy(() => import("./components/unit1/finalLevel/components/CaseSelect"));

// ============================================================
// Unit 1 - Level 2
// ============================================================

const LevelTransition = lazy(() => import("./components/common/LevelTransition"));

const BubbleShooterPage = lazy(() => import("./components/unit1/level2/bubbleShooterPage"));
const Unit1Level2IntroPage = lazy(() => import("./components/unit1/level2/scenes/Level2IntroPage"));
const Unit1Level2ResultPage = lazy(() => import("./components/unit1/level2/components/BubbleResultPage"));

// ============================================================
// Unit 2
// ============================================================

const Unit2IntroPage = lazy(() => import("./components/unit2/level1/introPage"));
const ShoppingGame = lazy(() => import("./components/unit2/level1/ShoppingGame"));
const Unit2ResultPage = lazy(() => import("./components/unit2/level1/resultPage"));

const Unit2Level2IntroPage = lazy(() => import("./components/unit2/level2/Level2IntroPage"));
const CalculationGame = lazy(() => import("./components/unit2/level2/CalculationGame"));

const FinalLevelGame = lazy(() => import("./components/unit2/finalLevel/FinalLevelGame"));
const Unit2FinalLevelIntroPage = lazy(() => import("./components/unit2/finalLevel/FinalLevelIntroPage"));
const SceneMission = lazy(() => import("./components/unit2/finalLevel/scenes/SceneMission"));

// ============================================================
// Unit 3
// ============================================================

const Level1IntroPage = lazy(() => import("./components/unit3/level1/scenes/Level1IntroPage"));
const ReceiptGamePage = lazy(() => import("./components/unit3/level1/ReceiptGamePage"));
const ResultPage = lazy(() => import("./components/unit3/level1/ResultPage"));

const Level2IntroPage = lazy(() => import("./components/unit3/level2/scenes/Level2IntroPage"));
const MoneyGamePage = lazy(() => import("./components/unit3/level2/MoneyGamePage"));
const MoneyResultPage = lazy(() => import("./components/unit3/level2/ResultPage"));

const Unit3FinalLevel = lazy(() => import("./components/unit3/finalLevel/TreasurerGame"));
const FinalLevelIntroPage = lazy(() => import("./components/unit3/finalLevel/scenes/FinalLevelIntroPage"));

// ============================================================
// Unit 4
// ============================================================

// Book / Intro
const Unit4Book = lazy(() => import("./components/Unit4/Unit4Book"));
const PreBookIntro = lazy(() => import("./components/Unit4/PreBookIntro"));
const Unit4Completion = lazy(() => import("./components/Unit4/Completion"));

// Unit 4 Level 1
const Unit4Level1Intro = lazy(() => import("./components/Unit4/Level1/IntroScene"));
const Unit4Level1Game = lazy(() => import("./components/Unit4/Level1/Game"));
const Unit4Level1Result = lazy(() => import("./components/Unit4/Level1/Result"));

// Unit 4 Level 2
const Unit4Level2Intro = lazy(() => import("./components/Unit4/Level2/IntroScene"));
const Unit4Level2Game = lazy(() => import("./components/Unit4/Level2/Game"));
const Unit4Level2Result = lazy(() => import("./components/Unit4/Level2/Result"));

// Unit 4 Level 3
const Unit4Level3Intro = lazy(() => import("./components/Unit4/Level3/IntroScene"));
const Unit4Level3Game = lazy(() => import("./components/Unit4/Level3/Game"));
const Unit4Level3Result = lazy(() => import("./components/Unit4/Level3/Result"));

// ============================================================
// Unit 5
// ============================================================

const Unit5Intro = lazy(() => import("./components/Unit5/Level1/IntroLevel1"));
const Unit5Tutorial = lazy(() => import("./components/Unit5/Level1/Level1Tutorial"));
const Unit5Level1Game = lazy(() => import("./components/Unit5/Level1/GameLevel1"));

const Unit5Level2Intro = lazy(() => import("./components/Unit5/Level2/Level2Intro"));
const Unit5Level2Game = lazy(() => import("./components/Unit5/Level2/GameLevel2"));
const Unit5Result = lazy(() => import("./components/Unit5/Level2/ResultPopup"));

const Unit5Level3Game = lazy(() => import("./components/Unit5/Level3/GameLevel3"));
const Unit5Level3Intro = lazy(() => import("./components/Unit5/Level3/Level3Intro"));

// ============================================================
// Unit 6
// ============================================================

const Unit6Level1Game = lazy(() => import("./components/Unit6/Level1/Game1"));
const Unit6Level2Game = lazy(() => import("./components/Unit6/Level2/Game2"));
const Unit6FinalGame = lazy(() => import("./components/Unit6/Level3/Game3"));

// ============================================================
// Activity Tracker
// ============================================================

import useActivityTracker from "./components/hooks/useActivityTracker";

// ============================================================
// Responsive: แจ้งเตือนอุปกรณ์/การหมุนจอ (เฉพาะหน้าเกม)
// ============================================================

import DeviceGuard from "./components/common/DeviceGuard";
import RequireAuth from "./components/common/RequireAuth";

// ============================================================
// App
// ============================================================

function App() {
  useActivityTracker();
  const location = useLocation();
  useUnit4ClickSound(location.pathname);
  useUnit5ClickSound(location.pathname);
  useUnit6ClickSound(location.pathname);
  useUnit6HoverSound(location.pathname);
  useUnit5HoverSound(location.pathname);

  return (
    <>
      <DeviceGuard />
      <Level2Music />
      <Level3Music />
      {(location.pathname.startsWith('/unit6/') || location.pathname === '/unit/unit6') && <Unit6Navigation key={location.pathname} />}
      {location.pathname.startsWith('/unit5/') && location.pathname.replace(/\/$/, '') !== '/unit5/result' && <Unit5Navigation key={location.pathname} />}
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">กำลังโหลด...</div>}>
      <Routes>

        {/* ====================================================== */}
        {/* Common */}
        {/* ====================================================== */}

        <Route path="/" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />

        {/* ทุกหน้าด้านล่างต้อง login ก่อน — เข้าตรงผ่าน URL จะถูกส่งกลับหน้า login */}

        <Route element={<RequireAuth roles={["teacher"]} />}>
          <Route
            path="/teacher"
            element={<TeacherPage />}
          />
        </Route>

        {/* หน้าตั้งค่าใช้ได้ทั้งนิสิตและอาจารย์ */}
        <Route element={<RequireAuth />}>
          <Route
            path="/settings"
            element={<SettingsPage />}
          />
        </Route>

        {/* หน้าแผนที่ แบบทดสอบ และเกมทั้งหมด — เฉพาะนิสิต (อาจารย์จะถูกส่งกลับ /teacher) */}
        <Route element={<RequireAuth roles={["student"]} />}>

        <Route path="/map" element={<MapPage />} />
        <Route path="/pretest" element={<PreTestPage />} />
        <Route path="/posttest" element={<PostTestPage />} />

        <Route
          path="/progress"
          element={<ProgressPage />}
        />

        <Route
          path="/unit/:unitId"
          element={<UnitContentPage />}
        />

        {/* ====================================================== */}
        {/* Unit 1 */}
        {/* ====================================================== */}

        <Route
          path="/unit1/Level1IntroPage"
          element={<Level1IntrpPage />}
        />

        <Route
          path="/unit1/MirrorIntroPage2"
          element={<AttendanceIntroAnimation />}
        />

        <Route
          path="/unit1/Quizlevel1"
          element={<MirrorQuizPage />}
        />

        <Route
          path="/unit1/resultlevel1"
          element={<MirrorResultPage />}
        />

        {/* Unit 1 Level 2 */}

        <Route
          path="/unit1/level2/intro"
          element={<Unit1Level2IntroPage />}
        />

        <Route
          path="/unit1/level2"
          element={<BubbleShooterPage />}
        />

        <Route
          path="/unit1/level2/result"
          element={<Unit1Level2ResultPage />}
        />

        {/* Unit 1 Final */}

        <Route
          path="/unit1/final"
          element={<FinalLevel />}
        />

        <Route
          path="/unit1/final/start"
          element={<TitleFinal />}
        />

        <Route
          path="/unit1/final/caseSelect"
          element={<CaseSelect />}
        />

        <Route
          path="/unit1/level2/transition"
          element={
            <LevelTransition
              nextPath="/unit1/level2/intro"
            />
          }
        />

        {/* ====================================================== */}
        {/* Unit 2 */}
        {/* ====================================================== */}

        <Route
          path="/unit2/intro"
          element={<Unit2IntroPage />}
        />

        <Route
          path="/unit2/level1"
          element={<ShoppingGame />}
        />

        <Route
          path="/unit2/level2"
          element={<CalculationGame />}
        />

        <Route
          path="/unit2/level1/result"
          element={<Unit2ResultPage />}
        />

        <Route
          path="/sceneMission"
          element={<SceneMission />}
        />

        <Route
          path="/unit2/level2/intro"
          element={<Unit2Level2IntroPage />}
        />

        <Route
          path="/unit2/level2/start"
          element={<CalculationGame />}
        />

        <Route
          path="/unit2/final/intro"
          element={<Unit2FinalLevelIntroPage />}
        />

        <Route
          path="/unit2/final/introMission"
          element={<SceneMission />}
        />

        <Route
          path="/unit2/final"
          element={
            <FinalLevelGame skipStartPage={true} />
          }
        />

        {/* ====================================================== */}
        {/* Unit 3 */}
        {/* ====================================================== */}

        <Route
          path="/unit3/level1/intro"
          element={<Level1IntroPage />}
        />

        <Route
          path="/unit3/level1/game"
          element={<ReceiptGamePage />}
        />

        <Route
          path="/unit3/level1/result"
          element={<ResultPage />}
        />

        <Route
          path="/unit3/level2/intro"
          element={<Level2IntroPage />}
        />

        <Route
          path="/unit3/level2/game"
          element={<MoneyGamePage />}
        />

        <Route
          path="/unit3/level2/result"
          element={<MoneyResultPage />}
        />

        <Route
          path="/unit3/final/start"
          element={<FinalLevelIntroPage />}
        />

        <Route
          path="/unit3/final"
          element={<Unit3FinalLevel />}
        />

        {/* ====================================================== */}
        {/* Unit 4 */}
        {/* ====================================================== */}

        <Route
          path="/unit4/intro"
          element={<PreBookIntro />}
        />

        <Route
          path="/unit4/book"
          element={<Unit4Book />}
        />

        <Route
          path="/unit4/complete"
          element={<Unit4Completion />}
        />

        <Route
          path="/unit4/cover"
          element={<PreBookIntro />}
        />

        <Route
          path="/unit4/book-cover"
          element={
            <Navigate
              to="/unit4/book"
              replace
            />
          }
        />

        {/* Unit 4 Level 1 */}

        <Route
          path="/unit4/level1/intro"
          element={<Unit4Level1Intro />}
        />

        <Route
          path="/unit4/level1"
          element={<Unit4Level1Intro />}
        />

        <Route
          path="/unit4/level1/game"
          element={<Unit4Level1Game key={location.pathname + location.search} />}
        />

        <Route
          path="/unit4/level1/result"
          element={<Unit4Level1Result />}
        />

        {/* Unit 4 Level 2 */}

        <Route
          path="/unit4/level2/intro"
          element={<Unit4Level2Intro />}
        />

        <Route
          path="/unit4/level2/game"
          element={<Unit4Level2Game key={location.pathname + location.search} />}
        />

        <Route
          path="/unit4/level2/result"
          element={<Unit4Level2Result />}
        />

        {/* Unit 4 Level 3 */}

        <Route
          path="/unit4/level3/intro"
          element={<Unit4Level3Intro />}
        />

        <Route
          path="/unit4/level3/game"
          element={<Unit4Level3Game key={location.pathname + location.search} />}
        />

        <Route
          path="/unit4/level3/result"
          element={<Unit4Level3Result />}
        />

        {/* ====================================================== */}
        {/* Unit 5 - Zero Corruption */}
        {/* ====================================================== */}

        <Route
          path="/unit5/intro"
          element={<Unit5Intro />}
        />

        <Route
          path="/unit5/tutorial"
          element={<Unit5Tutorial />}
        />

        <Route
          path="/unit5/game"
          element={<Unit5Level1Game />}
        />

        <Route
          path="/unit5/level1/intro"
          element={<Unit5Tutorial />}
        />

        <Route
          path="/unit5/level1/game"
          element={<Unit5Level1Game />}
        />

        <Route
          path="/unit5/2Intro"
          element={<Unit5Level2Intro />}
        />

        <Route
          path="/unit5/game2"
          element={<Unit5Level2Game />}
        />

        <Route
          path="/unit5/level2/intro"
          element={<Unit5Level2Intro />}
        />

        <Route
          path="/unit5/level2/game"
          element={<Unit5Level2Game />}
        />

        <Route
          path="/unit5/result"
          element={<Unit5Result />}
        />

        <Route
          path="/unit5/game3"
          element={<Unit5Level3Intro />}
        />

        <Route
          path="/unit5/game3/intro"
          element={<Unit5Level3Intro />}
        />

        <Route
          path="/unit5/level3/game"
          element={
            <Unit5Level3Game
              nextRoute="/unit/unit6"
            />
          }
        />

        {/* ====================================================== */}
        {/* Unit 6 - The Ambassador */}
        {/* ====================================================== */}

        <Route
          path="/unit6/intro"
          element={<Navigate to="/unit6/game1" replace />}
        />

        <Route
          path="/unit6/game1"
          element={
            <Unit6Level1Game
              nextRoute="/unit6/game2"
            />
          }
        />

        <Route
          path="/unit6/level1"
          element={
            <Unit6Level1Game
              nextRoute="/unit6/game2"
            />
          }
        />

        <Route
          path="/unit6/game2"
          element={<Unit6Level2Game />}
        />

        <Route
          path="/unit6/level2"
          element={<Unit6Level2Game />}
        />

        <Route
          path="/unit6/game3"
          element={<Unit6FinalGame />}
        />

        <Route
          path="/unit6/level3"
          element={<Unit6FinalGame />}
        />

        </Route>

        {/* URL ที่ไม่มีอยู่จริง → กลับหน้าแรก */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
      </Suspense>
    </>
  );
}

export default App;