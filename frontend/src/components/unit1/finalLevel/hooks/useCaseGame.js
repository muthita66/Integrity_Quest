import { BASE_URL } from "../../../../config";
import { useEffect, useMemo, useState } from "react";
import { CASES } from "../data/cases";
import { EVIDENCES } from "../data/evidences";

const API_URL = `${BASE_URL}/api/final-level/3`;

export default function useCaseGame() {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [playId, setPlayId] = useState(null);
    const [attemptId, setAttemptId] = useState(null);

    const [stage, setStage] = useState("intro");
    const [caseIdx, setCaseIdx] = useState(0);
    const [collected, setCollected] = useState({});
    const [activeEvidence, setActiveEvidence] = useState(null);
    const [selected, setSelected] = useState(null);
    const [results, setResults] = useState({});
    const [analysisPicks, setAnalysisPicks] = useState({});
    const [analysisChecked, setAnalysisChecked] = useState({});
    const [evidenceResults, setEvidenceResults] = useState({});

    const [evidenceFailReasons, setEvidenceFailReasons] = useState({});

    const [firstAttemptPerfect, setFirstAttemptPerfect] = useState({});
    const [firstAttemptOverpick, setFirstAttemptOverpick] = useState({});
    const [analysisRetryCount, setAnalysisRetryCount] = useState({});
    const [hasRestartedAnyCase, setHasRestartedAnyCase] = useState(false);
    const [hasEverTimedOut, setHasEverTimedOut] = useState(false);

    const [gameOverPopup, setGameOverPopup] = useState(null);

    const [finalLevelResult, setFinalLevelResult] = useState(null);
    useEffect(() => {
        const fetchFinalLevel = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(API_URL);

                if (!response.ok) {
                    throw new Error(
                        `โหลดข้อมูล Final Level ไม่สำเร็จ (${response.status})`
                    );
                }

                const data = await response.json();

                const formattedCases = data.map((caseData) => {
                    const uiConfig =
                        CASES.find(
                            (item) => item.id === caseData.case_number
                        ) || {};

                    const evidence = (caseData.final_case_items || [])
                        .sort((a, b) => a.item_order - b.item_order)
                        .map((row) => {
                            const item = row.items;
                            const ui = EVIDENCES.find(
                                (e) => e.itemId === item.items_id
                            );

                            return {
                                id: item.items_id,
                                name: item.name,
                                detail: item.description || "",
                                image: item.image,
                                imageClass: ui?.imageClass || "",
                                icon: ui?.icon,
                                relevant: row.is_key_evidence,
                            };
                        });

                    const questionData = [...caseData.question].sort(
                        (a, b) => a.question_order - b.question_order
                    )[0];

                    const options = questionData?.choice
                        ?.sort((a, b) => a.choice_id - b.choice_id) || [];

                    const correctIndex =
                        options.findIndex(
                            (choice) => choice.is_correct
                        );

                    return {
                        id: caseData.case_id,
                        case_id: caseData.case_id,
                        code: `CASE-${String(
                            caseData.case_number
                        ).padStart(2, "0")}`,
                        case_number: caseData.case_number,
                        title: caseData.title,
                        location: caseData.location,
                        briefing: caseData.description || "",
                        background: uiConfig.background || null,
                        lessonTitle: caseData.lesson_title || "",
                        lessonDescription:
                            caseData.lesson_description || "",

                        evidence,

                        question_id:
                            questionData?.question_id || null,

                        question:
                            questionData?.question_text || "",

                        options: options.map(
                            (choice) =>
                                choice.choice_text
                        ),

                        choiceIds: options.map(
                            (choice) =>
                                choice.choice_id
                        ),

                        correct: correctIndex,
                        correctExplain: questionData?.correct_explain || "",
                        wrongExplain: questionData?.wrong_explain || "",
                    };
                });

                setCases(formattedCases);
            } catch (err) {
                console.error(
                    "Final Level Fetch Error:",
                    err
                );

                setError(
                    err.message ||
                    "ไม่สามารถโหลดข้อมูล Final Level ได้"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchFinalLevel();
    }, []);

    const currentCase = cases[caseIdx] || null;

    const collectedList = currentCase
        ? collected[currentCase.id] || []
        : [];

    const analysisPickList = currentCase
        ? analysisPicks[currentCase.id] || []
        : [];

    const isAnalysisChecked = currentCase
        ? analysisChecked[currentCase.id] || false
        : false;

    const relevantIds = useMemo(() => {
        if (!currentCase) return [];

        return currentCase.evidence
            .filter((evidence) => evidence.relevant)
            .map((evidence) => evidence.id);
    }, [currentCase]);

    const allCollected =
        currentCase &&
        collectedList.length === currentCase.evidence.length;

    const unlockedCaseCount = Object.keys(results).length;

    const collectEvidence = (
        evidence = activeEvidence
    ) => {
        if (!evidence || !currentCase) return;

        setCollected((previous) => {
            const currentList =
                previous[currentCase.id] || [];

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
        if (!currentCase || isAnalysisChecked) return;

        setAnalysisPicks((previous) => {
            const currentPicks =
                previous[currentCase.id] || [];

            const nextPicks =
                currentPicks.includes(evidenceId)
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

    const submitAnalysis = async () => {
        if (!currentCase || analysisPickList.length === 0) {
            return;
        }

        const hasAllRelevantEvidence =
            relevantIds.every((relevantId) =>
                analysisPickList.includes(relevantId)
            );


        const hasOverpick =
            analysisPickList.some((pickedId) => {
                const evidence =
                    currentCase.evidence.find(
                        (item) => item.id === pickedId
                    );

                return evidence && !evidence.relevant;
            });

        const isPerfect =
            hasAllRelevantEvidence && !hasOverpick;

        if (!attemptId) {
            console.error("ไม่พบ attemptId");
            return;
        }

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error(
                    "ไม่พบ Token กรุณาเข้าสู่ระบบก่อน"
                );
            }

            const response = await fetch(
                `${BASE_URL}/api/game-play/case/items`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        attempt_id: attemptId,
                        item_ids: analysisPickList,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "ไม่สามารถบันทึกหลักฐานได้"
                );
            }

            console.log(
                "Case Items Saved:",
                data.data
            );

        } catch (error) {
            console.error(
                "Save Case Items Error:",
                error
            );

            setError(
                error.message ||
                "ไม่สามารถบันทึกหลักฐานได้"
            );

            return;
        }

        const currentRetry =
            analysisRetryCount[currentCase.id] || 0;

        const isFirstAttempt = currentRetry === 0;

        if (isFirstAttempt) {
            setFirstAttemptPerfect((previous) => ({
                ...previous,
                [currentCase.id]: isPerfect,
            }));

            setFirstAttemptOverpick((previous) => ({
                ...previous,
                [currentCase.id]: hasOverpick,
            }));
        }

        setEvidenceResults((previous) => ({
            ...previous,
            [currentCase.id]: isPerfect,
        }));

        setEvidenceFailReasons((previous) => ({
            ...previous,
            [currentCase.id]: isPerfect
                ? null
                : !hasAllRelevantEvidence
                    ? "incomplete"
                    : "overpick",
        }));

        setAnalysisChecked((previous) => ({
            ...previous,
            [currentCase.id]: true,
        }));

        if (!isPerfect && currentRetry >= 2) {
            setGameOverPopup({
                type: "evidence_limit",
                caseTitle: currentCase.title,
            });
        }
    };

    const retryAnalysis = async () => {
        if (!currentCase) {
            return;
        }

        if (!playId || !attemptId) {
            console.error(
                "ไม่พบ playId หรือ attemptId"
            );
            return;
        }

        try {
            const token =
                localStorage.getItem("token");

            const response = await fetch(
                `${BASE_URL}/api/game-play/case/retry`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        play_id: playId,
                        case_id: currentCase.id,
                        is_timeout: false,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "ไม่สามารถ Retry ได้"
                );
            }

            const newAttemptId =
                data.data.new_attempt.attempt_id;

            setAnalysisRetryCount((previous) => ({
                ...previous,
                [currentCase.id]:
                    (previous[currentCase.id] || 0) + 1,
            }));

            setAttemptId(newAttemptId);

            setAnalysisPicks(
                (previous) => ({
                    ...previous,
                    [currentCase.id]: [],
                })
            );

            setAnalysisChecked(
                (previous) => ({
                    ...previous,
                    [currentCase.id]: false,
                })
            );

            setEvidenceResults(
                (previous) => ({
                    ...previous,
                    [currentCase.id]: null,
                })
            );

            setEvidenceFailReasons(
                (previous) => ({
                    ...previous,
                    [currentCase.id]: null,
                })
            );

            setStage("file");

            console.log(
                "New Attempt:",
                data.data.new_attempt
            );

        } catch (error) {
            console.error(
                "Retry Analysis Error:",
                error
            );

            setError(
                error.message ||
                "ไม่สามารถ Retry ได้"
            );
        }
    };

    const submitAnswer = async () => {
        if (!currentCase || selected === null) {
            return;
        }

        if (!playId) {
            console.error("ไม่พบ playId");
            return;
        }

        const questionId =
            currentCase.question_id;

        const choiceId =
            currentCase.choiceIds?.[selected];

        if (!questionId || !choiceId) {
            console.error(
                "ไม่พบ question_id หรือ choice_id",
                {
                    questionId,
                    choiceId,
                }
            );
            return;
        }

        try {
            const token =
                localStorage.getItem("token");

            if (!token) {
                throw new Error(
                    "ไม่พบ Token กรุณาเข้าสู่ระบบก่อน"
                );
            }

            const response = await fetch(
                `${BASE_URL}/api/game-play/answer`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        play_id: playId,
                        question_id: questionId,
                        choice_id: choiceId,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "ไม่สามารถบันทึกคำตอบได้"
                );
            }

            console.log(
                "Answer saved:",
                data
            );

            const isCorrect =
                data.data.is_correct;

            setResults((previous) => ({
                ...previous,
                [currentCase.id]: isCorrect,
            }));

            setStage("verdict");

        } catch (error) {
            console.error(
                "Submit Answer Error:",
                error
            );

            setError(
                error.message ||
                "ไม่สามารถบันทึกคำตอบได้"
            );
        }
    };
    const dismissGameOverPopup = () => {
        setGameOverPopup(null);
    };

    const timerExpired = async () => {
        if (!currentCase) {
            return;
        }

        if (!playId || !attemptId) {
            console.error(
                "ไม่พบ playId หรือ attemptId"
            );
            return;
        }

        setHasEverTimedOut(true);

        try {
            const token =
                localStorage.getItem("token");

            const response = await fetch(
                `${BASE_URL}/api/game-play/case/retry`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        play_id: playId,
                        case_id: currentCase.id,
                        is_timeout: true,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "ไม่สามารถเริ่ม Attempt ใหม่ได้"
                );
            }

            const newAttemptId =
                data.data.new_attempt.attempt_id;

            setAnalysisRetryCount((previous) => ({
                ...previous,
                [currentCase.id]:
                    (previous[currentCase.id] || 0) + 1,
            }));

            setAttemptId(newAttemptId);

            setAnalysisPicks(
                (previous) => ({
                    ...previous,
                    [currentCase.id]: [],
                })
            );

            setAnalysisChecked(
                (previous) => ({
                    ...previous,
                    [currentCase.id]: false,
                })
            );

            setEvidenceResults(
                (previous) => ({
                    ...previous,
                    [currentCase.id]: null,
                })
            );

            setEvidenceFailReasons(
                (previous) => ({
                    ...previous,
                    [currentCase.id]: null,
                })
            );

            setStage("file");

            setGameOverPopup({
                type: "timer_expired",
                caseTitle: currentCase.title,
            });

            console.log(
                "Timeout → New Attempt:",
                data.data.new_attempt
            );

        } catch (error) {
            console.error(
                "Timer Expired Error:",
                error
            );

            setError(
                error.message ||
                "ไม่สามารถเริ่ม Attempt ใหม่ได้"
            );
        }
    };

    const completeCaseAttempt = async (caseId) => {
        if (!playId) {
            console.error("ไม่พบ playId");
            return false;
        }

        if (!attemptId) {
            console.error("ไม่พบ attemptId");
            return false;
        }

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error(
                    "ไม่พบ Token กรุณาเข้าสู่ระบบก่อน"
                );
            }

            const response = await fetch(
                `${BASE_URL}/api/game-play/case/complete`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        play_id: playId,
                        case_id: caseId,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "ไม่สามารถบันทึกการจบ Case ได้"
                );
            }

            console.log(
                "Case Attempt Completed:",
                data.data
            );

            setAttemptId(null);

            return true;

        } catch (error) {
            console.error(
                "Complete Case Attempt Error:",
                error
            );

            setError(
                error.message ||
                "ไม่สามารถบันทึกการจบ Case ได้"
            );

            return false;
        }
    };

    const completeGame = async () => {
        if (!playId) {
            console.error("ไม่พบ playId");
            return false;
        }

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error(
                    "ไม่พบ Token กรุณาเข้าสู่ระบบก่อน"
                );
            }

            const response = await fetch(
                `${BASE_URL}/api/game-play/complete`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        play_id: playId,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "ไม่สามารถบันทึกผลการเล่นได้"
                );
            }

            console.log("Game Completed:", data);

            setFinalLevelResult(data.data);

            return true;
        } catch (error) {
            console.error(
                "Complete Game Error:",
                error
            );

            setError(
                error.message ||
                "ไม่สามารถบันทึกผลการเล่นได้"
            );

            return false;
        }
    };

    const goNextCase = async () => {
        if (!currentCase) {
            return;
        }

        const completed =
            await completeCaseAttempt(
                currentCase.id
            );

        if (!completed) {
            return;
        }

        if (caseIdx < cases.length - 1) {
            const nextIndex =
                caseIdx + 1;

            setCaseIdx(nextIndex);

            setSelected(null);
            setActiveEvidence(null);

            await startCaseAttempt(
                cases[nextIndex].id
            );

            setStage("brief");

            return;
        }
        const completedGame = await completeGame();

        if (!completedGame) {
            return;
        }

        setStage("end");
    };


    const restart = () => {
        setStage("intro");
        setCaseIdx(0);
        setPlayId(null);
        setAttemptId(null);
        setCollected({});
        setActiveEvidence(null);
        setSelected(null);
        setResults({});
        setAnalysisPicks({});
        setAnalysisChecked({});
        setEvidenceResults({});
        setEvidenceFailReasons({});
        setFirstAttemptPerfect({});
        setFirstAttemptOverpick({});
        setAnalysisRetryCount({});
        setHasRestartedAnyCase(false);
        setHasEverTimedOut(false);
        setGameOverPopup(null);
        setFinalLevelResult(null);
    };

    const restartFailedCase = async () => {
        if (!currentCase) return;

        if (!playId) {
            console.error("ไม่พบ playId");
            return;
        }

        const id = currentCase.id;
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${BASE_URL}/api/game-play/case/retry`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        play_id: playId,
                        case_id: id,
                        is_timeout: false,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "ไม่สามารถ Restart Case ได้");
            }

            setAttemptId(data.data.new_attempt.attempt_id);
        } catch (error) {
            console.error("Restart Failed Case Error:", error);
            setError(error.message || "ไม่สามารถ Restart Case ได้");
            return;
        }

        setCollected((previous) => {
            const next = { ...previous };
            delete next[id];
            return next;
        });

        setActiveEvidence(null);
        setSelected(null);

        setResults((previous) => {
            const next = { ...previous };
            delete next[id];
            return next;
        });

        setAnalysisPicks((previous) => {
            const next = { ...previous };
            delete next[id];
            return next;
        });

        setAnalysisChecked((previous) => {
            const next = { ...previous };
            delete next[id];
            return next;
        });

        setEvidenceResults((previous) => {
            const next = { ...previous };
            delete next[id];
            return next;
        });

        setEvidenceFailReasons((previous) => {
            const next = { ...previous };
            delete next[id];
            return next;
        });

        setFirstAttemptPerfect((previous) => {
            const next = { ...previous };
            delete next[id];
            return next;
        });

        setFirstAttemptOverpick((previous) => {
            const next = { ...previous };
            delete next[id];
            return next;
        });

        setAnalysisRetryCount((previous) => {
            const next = { ...previous };
            delete next[id];
            return next;
        });

        setHasRestartedAnyCase(true);
        setGameOverPopup(null);
        setStage("brief");
    };

    const passCount =
        Object.values(results).filter(Boolean).length;

    const evidencePassCount =
        Object.values(evidenceResults).filter(Boolean)
            .length;

    const totalScore =
        passCount + evidencePassCount;

    const allCaseIds = cases.map(
        (caseData) => caseData.id
    );

    const casesWithRetry =
        allCaseIds.filter(
            (id) =>
                (analysisRetryCount[id] || 0) > 0
        ).length;

    const startFinalLevel = async () => {
        try {
            const response = await fetch(
                `${BASE_URL}/api/game-play/start`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({
                        level_id: 3,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "ไม่สามารถเริ่มการเล่นได้"
                );
            }

            const newPlayId = data.data.play_id;

            setPlayId(newPlayId);

            console.log("Final Level Play ID:", newPlayId);

            setStage("select");
        } catch (error) {
            console.error("Start Final Level Error:", error);

            setError(
                error.message || "ไม่สามารถเริ่มเกมได้"
            );
        }
    };

    const startCaseAttempt = async (caseId) => {
        if (!playId) {
            console.error("ไม่พบ playId");
            return null;
        }

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error(
                    "ไม่พบ Token กรุณาเข้าสู่ระบบก่อน"
                );
            }

            const response = await fetch(
                `${BASE_URL}/api/game-play/case/start`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        play_id: playId,
                        case_id: caseId,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "ไม่สามารถเริ่ม Case ได้"
                );
            }

            const newAttemptId =
                data.data.attempt_id;

            setAttemptId(newAttemptId);

            console.log(
                "Case Attempt Started:",
                data.data
            );

            return newAttemptId;

        } catch (error) {
            console.error(
                "Start Case Attempt Error:",
                error
            );

            setError(
                error.message ||
                "ไม่สามารถเริ่ม Case ได้"
            );

            return null;
        }
    };

    const openCase = async (index) => {
        if (
            index < 0 ||
            index >= cases.length
        ) {
            return;
        }

        const selectedCase = cases[index];

        if (!selectedCase) {
            return;
        }

        setCaseIdx(index);
        setSelected(null);
        setActiveEvidence(null);

        const hasCompletedCase =
            Object.prototype.hasOwnProperty.call(
                results,
                selectedCase.id
            );

        if (!hasCompletedCase) {
            await startCaseAttempt(
                selectedCase.id
            );
        }

        setStage("brief");
    };

    return {
        cases,
        loading,
        error,
        playId,
        attemptId,
        startFinalLevel,
        startCaseAttempt,
        completeCaseAttempt,
        completeGame,
        finalLevelResult,

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
        evidenceFailReasons,
        unlockedCaseCount,

        passCount,
        evidencePassCount,
        totalScore,
        analysisRetryCount,

        gameOverPopup,
        hasEverTimedOut,
        hasRestartedAnyCase,

        collectEvidence,
        toggleAnalysisPick,
        submitAnalysis,
        retryAnalysis,
        timerExpired,
        submitAnswer,
        goNextCase,
        openCase,
        restart,
        restartFailedCase,
        dismissGameOverPopup,
    };
}