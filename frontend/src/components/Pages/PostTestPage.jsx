import { useEffect, useState } from "react";
import bg_game from "../../assets/bg_game.png";
import { useNavigate } from "react-router-dom";
import { getTestStatus } from "../services/profileService";

// TODO: ถ้ามี env ของ backend URL อยู่แล้ว (เช่น VITE_API_URL) ให้ใช้ตัวนั้นแทน
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const QUIZ_TYPE = "post_test";

// ============================================================
// Post-Test (หน้าตาเหมือน Pre-Test)
// ------------------------------------------------------------
// ทำได้เมื่อ: ทำ Pre-Test แล้ว + เล่นผ่านครบทั้ง 6 บท + ยังไม่เคยทำ
// เช็กจาก GET /api/profile/test-status ก่อนแสดงคำถาม
// ============================================================

function PostTest() {
    const [questions, setQuestions] = useState([]); // [{ quiz_id, question_text, ... }]
    const [answers, setAnswers] = useState({}); // { [quiz_id]: score }
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [status, setStatus] = useState(null); // ผลจาก /profile/test-status

    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);

                // 1) เช็กสิทธิ์ก่อน
                const testStatus = await getTestStatus();
                setStatus(testStatus);

                if (!testStatus.post_test_unlocked) return;

                // 2) ผ่านเงื่อนไข → โหลดคำถาม
                const res = await fetch(`${API_BASE}/quizzes?type=${QUIZ_TYPE}`);

                if (!res.ok) {
                    throw new Error("โหลดคำถามไม่สำเร็จ");
                }

                const data = await res.json();
                setQuestions(data.quizzes || []);
            } catch (err) {
                console.error(err);

                if (err.status === 401 || err.status === 403) {
                    navigate("/", { replace: true });
                    return;
                }

                setError("ไม่สามารถโหลดคำถามได้ กรุณาลองใหม่อีกครั้ง");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [navigate]);

    const locked = !loading && status && !status.post_test_unlocked;

    const handleSelect = (quizId, score) => {
        setAnswers((prev) => ({
            ...prev,
            [quizId]: score,
        }));
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length !== questions.length) {
            alert("กรุณาตอบคำถามให้ครบทุกข้อ");
            return;
        }

        const payload = {
            quiz_type: QUIZ_TYPE,
            answers: questions.map((q) => ({
                quiz_id: q.quiz_id,
                score: answers[q.quiz_id],
            })),
        };

        try {
            setSubmitting(true);
            const token = localStorage.getItem("token");

            const res = await fetch(`${API_BASE}/quiz-answers`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => ({}));

            if (res.status === 409) {
                // ทำ post-test ไปแล้ว
                alert(data.message || "คุณทำแบบทดสอบนี้ไปแล้ว");
                navigate("/map");
                return;
            }

            if (res.status === 403) {
                // ยังเล่นไม่ครบทุกบท (backend เช็กซ้ำอีกชั้น)
                alert(data.message || "ต้องเล่นให้ครบทุกบทก่อนทำ Post-Test");
                navigate("/map");
                return;
            }

            if (!res.ok) {
                throw new Error(data.message || "บันทึกคำตอบไม่สำเร็จ");
            }

            navigate("/map", { state: { postTestJustCompleted: true } });
        } catch (err) {
            console.error(err);
            alert(err.message || "เกิดข้อผิดพลาด ไม่สามารถบันทึกคำตอบได้ กรุณาลองใหม่อีกครั้ง");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="h-screen w-full flex items-center justify-center px-10 pt-16 pb-10 overflow-hidden"
            style={{
                backgroundImage: `url(${bg_game})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
                fontFamily: "'Sarabun', sans-serif",
            }}
        >
            <div className="flex justify-center w-full h-full items-center">
                <div
                    className="w-full max-w-4xl relative"
                    style={{
                        background: "rgba(255,255,255,0.18)",
                        backdropFilter: "blur(12px)",
                        border: "2px solid rgba(255,255,255,.3)",
                        borderRadius: "24px",
                        padding: "32px",
                        boxShadow: "0 8px 30px rgba(0,0,0,.25)",
                    }}
                >
                    {/* Title */}
                    <div
                        style={{
                            position: "absolute",
                            top: "-24px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            backgroundColor: "#ea580c",
                            color: "white",
                            padding: "8px 40px",
                            borderRadius: "16px",
                            fontSize: "26px",
                            fontWeight: "800",
                            fontFamily: "'Sarabun', sans-serif",
                            textShadow: "0 4px 12px rgba(0,0,0,.5)",
                            boxShadow: "0 6px 15px rgba(0,0,0,.25)",
                        }}
                    >
                        Post-Test
                    </div>

                    {/* ยังทำไม่ได้ */}
                    {locked && (
                        <div style={{ textAlign: "center", color: "#4c2323", padding: "12px 0" }}>
                            <div style={{ fontSize: 40, marginBottom: 8 }}>
                                {status.post_test_done ? "✅" : "🔒"}
                            </div>

                            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
                                {status.post_test_done
                                    ? "คุณทำ Post-Test ไปแล้ว"
                                    : !status.pre_test_done
                                        ? "กรุณาทำ Pre-Test ก่อน"
                                        : "ยังทำ Post-Test ไม่ได้"}
                            </div>

                            {!status.post_test_done && status.pre_test_done && (
                                <>
                                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
                                        ต้องเล่นผ่านให้ครบทุกบทก่อน · ตอนนี้ผ่านแล้ว{" "}
                                        {status.units_completed}/{status.units_total} บท
                                    </div>

                                    <div
                                        style={{
                                            height: 10,
                                            maxWidth: 360,
                                            margin: "0 auto 16px",
                                            borderRadius: 999,
                                            background: "rgba(255,255,255,.6)",
                                            overflow: "hidden",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: `${status.units_total ? (status.units_completed / status.units_total) * 100 : 0}%`,
                                                height: "100%",
                                                background: "linear-gradient(90deg,#34d399,#10b981)",
                                            }}
                                        />
                                    </div>
                                </>
                            )}

                            <button
                                onClick={() => navigate("/map")}
                                style={{
                                    backgroundColor: "#ea580c",
                                    color: "white",
                                    padding: "9px 34px",
                                    borderRadius: "18px",
                                    fontSize: "15px",
                                    fontWeight: "700",
                                    fontFamily: "'Sarabun', sans-serif",
                                    cursor: "pointer",
                                    border: "none",
                                    boxShadow: "0 5px 15px rgba(91,56,41,.5)",
                                }}
                            >
                                กลับไปหน้าแผนที่
                            </button>
                        </div>
                    )}

                    {/* Description */}
                    {!locked && (
                        <div
                            style={{
                                textAlign: "center",
                                color: "#603535",
                                fontWeight: "700",
                                fontSize: "15px",
                                marginBottom: "16px",
                                lineHeight: 1.4,
                            }}
                        >
                            กรุณาให้คะแนนตามระดับความคิดเห็นของท่าน
                            <br />
                            1 = ไม่เห็นด้วยอย่างยิ่ง | 2 = ไม่เห็นด้วย | 3 = ปานกลาง |
                            4 = เห็นด้วย | 5 = เห็นด้วยอย่างยิ่ง
                        </div>
                    )}

                    {/* Loading / Error states */}
                    {loading && (
                        <div style={{ textAlign: "center", color: "#4c2323", fontWeight: 600 }}>
                            กำลังโหลดคำถาม...
                        </div>
                    )}

                    {!loading && error && (
                        <div style={{ textAlign: "center", color: "#b91c1c", fontWeight: 600 }}>
                            {error}
                        </div>
                    )}

                    {/* Questions */}
                    {!loading &&
                        !error &&
                        !locked &&
                        questions.map((q, qIndex) => (
                            <div
                                key={q.quiz_id}
                                style={{
                                    background: "rgba(255,255,255,.12)",
                                    border: "1px solid rgba(255,255,255,.2)",
                                    borderRadius: "12px",
                                    padding: "9px 18px",
                                    marginBottom: "6px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    flexWrap: "wrap",
                                    gap: "10px",
                                    backdropFilter: "blur(5px)",
                                }}
                            >
                                <div
                                    style={{
                                        color: "#4c2323",
                                        fontSize: "15px",
                                        fontWeight: "600",
                                        flex: "1 1 260px",
                                        textAlign: "left",
                                        lineHeight: 1.35,
                                    }}
                                >
                                    {qIndex + 1}. {q.question_text}
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        gap: "8px",
                                        justifyContent: "flex-end",
                                    }}
                                >
                                    {[1, 2, 3, 4, 5].map((score) => (
                                        <button
                                            key={score}
                                            onClick={() =>
                                                handleSelect(q.quiz_id, score)
                                            }
                                            style={{
                                                width: "24px",
                                                height: "24px",
                                                borderRadius: "50%",
                                                border: "2px solid white",
                                                cursor: "pointer",
                                                fontWeight: "700",
                                                fontSize: "12px",
                                                fontFamily: "'Sarabun', sans-serif",
                                                transition: ".2s",

                                                color:
                                                    answers[q.quiz_id] === score
                                                        ? "white"
                                                        : "#444",

                                                background:
                                                    answers[q.quiz_id] === score
                                                        ? "linear-gradient(135deg,#34d399,#10b981)"
                                                        : "rgba(255,255,255,.85)",

                                                boxShadow:
                                                    answers[q.quiz_id] === score
                                                        ? "0 0 14px rgba(16,185,129,.9)"
                                                        : "none",
                                            }}
                                        >
                                            {score}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                    {/* Submit */}
                    {!loading && !error && !locked && (
                        <div
                            style={{
                                textAlign: "center",
                                marginTop: "14px",
                            }}
                        >
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                style={{
                                    backgroundColor: "#ea580c",
                                    color: "white",
                                    padding: "9px 34px",
                                    borderRadius: "18px",
                                    fontSize: "15px",
                                    fontWeight: "700",
                                    fontFamily: "'Sarabun', sans-serif",
                                    cursor: submitting ? "not-allowed" : "pointer",
                                    opacity: submitting ? 0.7 : 1,
                                    border: "none",
                                    boxShadow: "0 5px 15px rgba(91,56,41,.5)",
                                }}
                            >
                                {submitting ? "กำลังบันทึก..." : "SUBMIT"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PostTest;