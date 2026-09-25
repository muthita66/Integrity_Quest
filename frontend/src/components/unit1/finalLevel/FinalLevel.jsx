import Header from "./components/Header";
import TitleScreen from "./components/TitleScreen";
import CaseSelect from "./components/CaseSelect";
import BriefingPage from "./components/BriefingPage";
import ScenePage from "./components/ScenePage";
import EvidenceModal from "./components/EvidenceModal";
import EvidenceAnalysis from "./components/EvidenceAnalysis";
import QuestionPage from "./components/QuestionPage";
import VerdictPage from "./components/VerdictPage";
import EndSummary from "./components/EndSummary";
import useCaseGame from "./hooks/useCaseGame";
import NavBar from "./components/NavBar";
import { CASES } from "./data/cases";
import IntroScenes from "./scenes/IntroFinalLevel";
import BgGameLevel from "../../../assets/unit1/finalLevel/bgGameFinal.png";
import GameOverPopup from "./components/GameOverPopup";


const FONT_STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Thai:wght@500;600;700;900&family=Sarabun:wght@300;400;500;600;700&display=swap');

.cid-display {
  font-family: 'Noto Serif Thai', serif;
}

.cid-body {
  font-family: 'Sarabun', sans-serif;
}

.cid-root {
  background-color: #E8DCC0;
  background-image:
    radial-gradient(rgba(139, 94, 56, 0.06) 1px, transparent 1px);
  background-size: 14px 14px;
}

.cid-cork {
  background-color: #8B5E3C;
  background-image:
    radial-gradient(circle at 12% 22%, rgba(0, 0, 0, 0.16) 0, transparent 3%),
    radial-gradient(circle at 68% 62%, rgba(0, 0, 0, 0.14) 0, transparent 3%),
    radial-gradient(circle at 40% 85%, rgba(0, 0, 0, 0.12) 0, transparent 2.5%),
    radial-gradient(circle at 88% 15%, rgba(0, 0, 0, 0.14) 0, transparent 3%),
    repeating-linear-gradient(
      45deg,
      rgba(0, 0, 0, 0.035) 0px,
      rgba(0, 0, 0, 0.035) 2px,
      transparent 2px,
      transparent 7px
    );
}

.cid-paper {
  background-color: #F3E9D2;
  background-image:
    repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.02) 0px,
      rgba(0, 0, 0, 0.02) 1px,
      transparent 1px,
      transparent 26px
    );
}

.cid-pin {
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.35);
}

@keyframes cidStamp {
  0% {
    transform: scale(3) rotate(-10deg);
    opacity: 0;
  }

  55% {
    transform: scale(0.92) rotate(-3deg);
    opacity: 1;
  }

  100% {
    transform: scale(1) rotate(-3deg);
    opacity: 1;
  }
}

.cid-stamp-anim {
  animation: cidStamp 0.55s cubic-bezier(.34, 1.56, .64, 1) forwards;
}

@keyframes cidPop {
  0% {
    transform: scale(0.85);
    opacity: 0;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.cid-pop {
  animation: cidPop 0.2s ease-out forwards;
}
`;

export default function FinalLevel() {
  const game = useCaseGame();

  return (
    <div className="min-h-screen w-full cid-body overflow-y-auto flex flex-col items-center relative sarabun-bold">
      <img src={BgGameLevel} alt="" className="fixed inset-0 w-full h-full object-cover z-0" />
      <style>{FONT_STYLE}</style>

      <div className="absolute inset-0 bg-black/50" />

      {/* Game-over popup (evidence limit or timeout) */}
      <GameOverPopup
        popup={game.gameOverPopup}
        onRestart={game.restartFailedCase}
        onDismiss={game.dismissGameOverPopup}
      />

      {/*
        แจ้ง error ที่เกิดจากการเรียก backend (เช่น completeGame
        ล้มเหลวเพราะ Case ยังไม่ผ่านครบ) — เดิม game.error ไม่เคยถูก
        render ที่ไหนเลย ทำให้กดปุ่มแล้ว "เงียบ" ไม่มีอะไรขึ้นเวลา
        fetch ไม่สำเร็จ
      */}
      {game.error && game.stage !== "intro" && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[10001] max-w-lg w-[90%] rounded-xl border-4 border-black px-4 py-3 text-center shadow-lg"
          style={{ backgroundColor: "#F5E2E2", color: "#A32638" }}
        >
          <p className="text-sm sarabun-bold">{game.error}</p>
        </div>
      )}

      {/* Intro — เต็มหน้าจอ ไม่จำกัดความกว้าง */}
      {game.stage === "intro" && (
        <div className="w-full">
          <IntroScenes onComplete={() => game.setStage("title")} />
        </div>
      )}

      {/* เกม — จำกัดความกว้างและอยู่กึ่งกลาง */}
      {game.stage !== "intro" && (
        <div className="w-full max-w-6xl h-[650px] mx-auto mt-10 relative z-10">
          <NavBar onRestart={game.restart} stage={game.stage} />
          {game.stage === "title" && (
            <TitleScreen onStart={game.startFinalLevel} />
          )}

          {game.stage === "select" && (
            <CaseSelect
              cases={game.cases}
              caseIdx={game.caseIdx}
              results={game.results}
              unlockedCaseCount={game.unlockedCaseCount}
              onOpenCase={game.openCase}
              onRestart={game.restart}
            />
          )}

          {game.stage === "brief" && (
            <BriefingPage
              currentCase={game.currentCase}
              caseIdx={game.caseIdx}
              results={game.results}
              onEnterScene={() => game.setStage("scene")}
              onBack={() => game.setStage("select")}
            />
          )}

          {game.stage === "scene" && (
            <ScenePage
              currentCase={game.currentCase}
              collectedList={game.collectedList}
              allCollected={game.allCollected}
              onOpenEvidence={game.setActiveEvidence}
              onBack={() => game.setStage("brief")}
              onAnalyze={() => game.setStage("file")}
            />
          )}

          <EvidenceModal
            currentCase={game.currentCase}
            evidence={game.activeEvidence}
            isCollected={
              game.activeEvidence
                ? game.collectedList.includes(game.activeEvidence.id)
                : false
            }
            onCollect={game.collectEvidence}
            onClose={() => game.setActiveEvidence(null)}
          />

          {game.stage === "file" && (
            <EvidenceAnalysis
              currentCase={game.currentCase}
              picks={game.analysisPickList}
              checked={game.isAnalysisChecked}
              evidenceResult={
                game.evidenceResults[game.currentCase.id]
              }
              failReason={
                game.evidenceFailReasons[game.currentCase.id]
              }
              retryCount={game.analysisRetryCount[game.currentCase.id] || 0}
              onTogglePick={game.toggleAnalysisPick}
              onSubmitAnalysis={game.submitAnalysis}
              onContinue={() => game.setStage("question")}
              onRetryAnalysis={game.retryAnalysis}
              onTimerExpired={game.timerExpired}
            />

          )}

          {game.stage === "question" && (
            <QuestionPage
              currentCase={game.currentCase}
              selected={game.selected}
              onSelect={game.setSelected}
              onSubmit={game.submitAnswer}
            />
          )}

          {game.stage === "verdict" && (
            <VerdictPage
              currentCase={game.currentCase}
              isCorrect={game.results[game.currentCase.id]}
              evidenceResult={game.evidenceResults[game.currentCase.id]}
              isLastCase={game.caseIdx === CASES.length - 1}
              onNext={game.goNextCase}
              onRestart={game.restartFailedCase}
            />
          )}

          {game.stage === "end" && (
            <EndSummary
              finalLevelResult={game.finalLevelResult}
              cases={game.cases}
              onRestart={game.restart}
            />
          )}
        </div>
      )}
    </div>
  );
}