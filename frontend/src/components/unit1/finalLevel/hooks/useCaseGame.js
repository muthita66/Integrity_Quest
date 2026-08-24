import { useMemo, useState } from "react";
import { CASES } from "../data/cases";

export default function useCaseGame() {
    const [stage, setStage] = useState("intro");
    const [caseIdx, setCaseIdx] = useState(0);
    const [collected, setCollected] = useState({});
    const [activeEvidence, setActiveEvidence] = useState(null);
    const [selected, setSelected] = useState(null);
    const [results, setResults] = useState({});
    const [analysisPicks, setAnalysisPicks] = useState({});
    const [analysisChecked, setAnalysisChecked] = useState({});
    const [evidenceResults, setEvidenceResults] = useState({});

    /*
     * ติดตามว่า attempt แรกของแต่ละ case:
     *   firstAttemptPerfect[caseId] = true  → เลือกถูกครบ และไม่เลือกเกิน
     *   firstAttemptOverpick[caseId] = true → เลือกเกิน (มีหลักฐาน irrelevant ติดมา) ใน attempt แรก
     *   analysisRetryCount[caseId] = n      → จำนวนครั้งที่ retry (กด "เลือกหลักฐานใหม่")
     */
    const [firstAttemptPerfect, setFirstAttemptPerfect] = useState({});
    const [firstAttemptOverpick, setFirstAttemptOverpick] = useState({});
    const [analysisRetryCount, setAnalysisRetryCount] = useState({});
    const [hasRestartedAnyCase, setHasRestartedAnyCase] = useState(false);

    /*
     * popup สำหรับ: evidence retry เกินกำหนด หรือ verdict ผิด
     * shape: { type: "evidence_limit" | "wrong_verdict", caseTitle: string } | null
     */
    const [gameOverPopup, setGameOverPopup] = useState(null);

    const currentCase = CASES[caseIdx];

    const collectedList = collected[currentCase.id] || [];
    const analysisPickList = analysisPicks[currentCase.id] || [];
    const isAnalysisChecked =
        analysisChecked[currentCase.id] || false;

    const relevantIds = useMemo(() => {
        return currentCase.evidence
            .filter((evidence) => evidence.relevant)
            .map((evidence) => evidence.id);
    }, [currentCase]);

    const allCollected =
        collectedList.length === currentCase.evidence.length;

    const unlockedCaseCount = Object.keys(results).length;

    const collectEvidence = (evidence = activeEvidence) => {
        if (!evidence) return;

        setCollected((previous) => {
            const currentList = previous[currentCase.id] || [];

            if (currentList.includes(evidence.id)) {
                return previous;
            }

            return {
                ...previous,
                [currentCase.id]: [
                    ...currentList,
                    evidence.id,
                ],
            };
        });
    };

    const toggleAnalysisPick = (evidenceId) => {
        if (isAnalysisChecked) return;

        setAnalysisPicks((previous) => {
            const currentPicks =
                previous[currentCase.id] || [];

            const nextPicks = currentPicks.includes(evidenceId)
                ? currentPicks.filter(
                    (id) => id !== evidenceId
                )
                : [...currentPicks, evidenceId];

            return {
                ...previous,
                [currentCase.id]: nextPicks,
            };
        });
    };

    const submitAnalysis = () => {
        if (analysisPickList.length === 0) return;

        /*
         * ถูกครบ: เลือก relevant ครบทุกชิ้น
         * ไม่เกิน: ไม่มี irrelevant ติดมา
         */
        const hasAllRelevantEvidence = relevantIds.every(
            (relevantId) =>
                analysisPickList.includes(relevantId)
        );

        const hasOverpick = analysisPickList.some((pickedId) => {
            const ev = currentCase.evidence.find((e) => e.id === pickedId);
            return ev && !ev.relevant;
        });

        const isPerfect = hasAllRelevantEvidence && !hasOverpick;

        const currentRetry = analysisRetryCount[currentCase.id] || 0;
        const isFirstAttempt = currentRetry === 0;

        /*
         * บันทึกผล attempt แรก
         */
        if (isFirstAttempt) {
            setFirstAttemptPerfect((prev) => ({
                ...prev,
                [currentCase.id]: isPerfect,
            }));
            setFirstAttemptOverpick((prev) => ({
                ...prev,
                [currentCase.id]: hasOverpick,
            }));
        }

        setEvidenceResults((previous) => ({
            ...previous,
            [currentCase.id]: hasAllRelevantEvidence,
        }));

        setAnalysisChecked((previous) => ({
            ...previous,
            [currentCase.id]: true,
        }));

        /*
         * ถ้าล้มเหลวและ retry ถึง 3 ครั้งแล้ว → game over popup
         * (ครั้งที่ 3 หมายถึง currentRetry === 2 แล้วกด submit ครั้งนี้เป็นครั้งที่ 3)
         */
        if (!hasAllRelevantEvidence && currentRetry >= 2) {
            setGameOverPopup({
                type: "evidence_limit",
                caseTitle: currentCase.title,
            });
        }
    };

    const retryAnalysis = () => {
        setAnalysisRetryCount((prev) => ({
            ...prev,
            [currentCase.id]: (prev[currentCase.id] || 0) + 1,
        }));

        setAnalysisPicks((previous) => ({
            ...previous,
            [currentCase.id]: [],
        }));

        setAnalysisChecked((previous) => ({
            ...previous,
            [currentCase.id]: false,
        }));

        setEvidenceResults((previous) => {
            const nextResults = { ...previous };

            delete nextResults[currentCase.id];

            return nextResults;
        });
    };

    const submitAnswer = () => {
        if (selected === null) return;

        const isCorrect = selected === currentCase.correct;

        setResults((previous) => ({
            ...previous,
            [currentCase.id]: isCorrect,
        }));

        if (!isCorrect) {
            /*
             * ตอบผิด → แสดง popup แจ้งให้เริ่มใหม่
             */
            setGameOverPopup({
                type: "wrong_verdict",
                caseTitle: currentCase.title,
            });
        }

        setStage("verdict");
    };

    const dismissGameOverPopup = () => setGameOverPopup(null);

    const goNextCase = () => {
        if (caseIdx < CASES.length - 1) {
            setCaseIdx((previous) => previous + 1);
            setSelected(null);
            setActiveEvidence(null);
            setStage("brief");
            return;
        }

        setStage("end");
    };

    const openCase = (index) => {
        setCaseIdx(index);
        setSelected(null);
        setActiveEvidence(null);
        setStage("brief");
    };

    const restart = () => {
        setStage("intro");
        setCaseIdx(0);
        setCollected({});
        setActiveEvidence(null);
        setSelected(null);
        setResults({});
        setAnalysisPicks({});
        setAnalysisChecked({});
        setEvidenceResults({});
        setFirstAttemptPerfect({});
        setFirstAttemptOverpick({});
        setAnalysisRetryCount({});
        setHasRestartedAnyCase(false);
        setGameOverPopup(null);
    };

    const restartFailedCase = () => {
        const id = currentCase.id;
        
        setCollected((prev) => { const next = { ...prev }; delete next[id]; return next; });
        setActiveEvidence(null);
        setSelected(null);
        setResults((prev) => { const next = { ...prev }; delete next[id]; return next; });
        setAnalysisPicks((prev) => { const next = { ...prev }; delete next[id]; return next; });
        setAnalysisChecked((prev) => { const next = { ...prev }; delete next[id]; return next; });
        setEvidenceResults((prev) => { const next = { ...prev }; delete next[id]; return next; });
        setFirstAttemptPerfect((prev) => { const next = { ...prev }; delete next[id]; return next; });
        setFirstAttemptOverpick((prev) => { const next = { ...prev }; delete next[id]; return next; });
        setAnalysisRetryCount((prev) => { const next = { ...prev }; delete next[id]; return next; });
        
        setHasRestartedAnyCase(true);
        setGameOverPopup(null);
        setStage("brief");
    };

    const passCount =
        Object.values(results).filter(Boolean).length;

    const evidencePassCount =
        Object.values(evidenceResults).filter(Boolean).length;

    const totalScore =
        passCount + evidencePassCount;

    /*
     * คำนวณ rank จากจำนวน case ที่เคย retry การวิเคราะห์หลักฐาน:
     *
     * ปรมาจารย์   : ไม่มี case ไหน retry เลย (เลือกถูกทุก case ในครั้งแรก)
     * มือฉมัง     : retry ≤ 2 case (เลือกผิดได้ไม่เกิน 2 เคส)
     * นักสืบเริ่มต้น : retry > 2 case (เลือกผิดมากกว่า 2 เคส)
     *
     * หมายเหตุ: ทุก rank ต้องตอบคำถามถูกทุก case
     * (ตอบผิดจะ game-over และ restart ก่อนถึง end screen)
     */
    const allCaseIds = CASES.map((c) => c.id);
    const casesWithRetry = allCaseIds.filter(
        (id) => (analysisRetryCount[id] || 0) > 0
    ).length;

    const rank = hasRestartedAnyCase
        ? "นักสืบเริ่มต้น"
        : casesWithRetry === 0
            ? "นักสืบการเงินระดับปรมาจารย์"
            : casesWithRetry <= 2
                ? "นักสืบการเงินมือฉมัง"
                : "นักสืบเริ่มต้น";

    return {
        stage,
        setStage,
        caseIdx,
        currentCase,
        collectedList,
        allCollected,
        activeEvidence,
        setActiveEvidence,
        selected,
        setSelected,
        results,
        analysisPickList,
        isAnalysisChecked,
        evidenceResults,
        unlockedCaseCount,
        passCount,
        evidencePassCount,
        totalScore,
        analysisRetryCount,
        gameOverPopup,
        rank,
        collectEvidence,
        toggleAnalysisPick,
        submitAnalysis,
        retryAnalysis,
        submitAnswer,
        goNextCase,
        openCase,
        restart,
        restartFailedCase,
        dismissGameOverPopup,
    };
}