import { useState } from "react";
import { FaLock, FaUnlock, FaUnlockAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// TODO: ถ้ามี env ของ backend URL อยู่แล้ว (เช่น VITE_API_URL) ให้ใช้ตัวนั้นแทน
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function PrePost({ completedUnits = 0, totalUnits = 6 }) {
    const navigate = useNavigate();
    const [checkingPreTest, setCheckingPreTest] = useState(false);

    const isPostTestUnlocked = completedUnits >= totalUnits;

    const handlePreTestClick = async () => {
        if (checkingPreTest) return; // กันกดรัวๆ ระหว่างเช็คสถานะ

        try {
            setCheckingPreTest(true);
            const token = localStorage.getItem("token");

            const res = await fetch(
                `${API_BASE}/quiz-answers/status?type=pre_test`,
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                }
            );

            if (res.ok) {
                const data = await res.json();
                if (data.completed) {
                    alert("คุณทำ Pre-Test ไปแล้ว ไม่สามารถทำซ้ำได้");
                    return; // ไม่ navigate เข้าหน้า pre-test
                }
            }

            // ยังไม่เคยทำ (หรือเช็คสถานะไม่สำเร็จ) -> ให้เข้าไปทำตามปกติ
            navigate("/pretest");
        } catch (err) {
            console.error("เช็คสถานะ pre-test ไม่สำเร็จ:", err);
            // เช็คสถานะพังก็ยังปล่อยให้เข้าไปทำได้ (backend จะกันซ้ำอีกชั้นตอน submit อยู่แล้ว)
            navigate("/pretest");
        } finally {
            setCheckingPreTest(false);
        }
    };

    return (
        <div className="panel">
            <button
                onClick={handlePreTestClick}
                disabled={checkingPreTest}
                style={{
                    width: "100%",
                    background: "#e8efd3",
                    border: "2px solid #c6d2a7",
                    borderRadius: "14px",
                    padding: "12px",
                    fontWeight: "600",
                    fontSize: "16px",
                    color: "#6b4f3b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    cursor: checkingPreTest ? "not-allowed" : "pointer",
                    opacity: checkingPreTest ? 0.7 : 1,
                    marginBottom: "10px",
                }}
            >
                <FaUnlock />
                Pre-Test
            </button>

            <button
                disabled={!isPostTestUnlocked}
                onClick={() => navigate("/posttest")}
                style={{
                    width: "100%",
                    background: isPostTestUnlocked ? "#e8efd3" : "#e5e5e5",
                    border: `2px solid ${isPostTestUnlocked ? "#c6d2a7" : "#cfcfcf"
                        }`,
                    borderRadius: "14px",
                    padding: "12px",
                    fontWeight: "600",
                    fontSize: "16px",
                    color: isPostTestUnlocked ? "#6b4f3b" : "#888",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    cursor: isPostTestUnlocked ? "pointer" : "not-allowed",
                }}
            >
                {isPostTestUnlocked ? (
                    <>
                        <FaUnlock />
                        Post-Test
                    </>
                ) : (
                    <>
                        <FaLock />
                        Post-Test
                    </>
                )}
            </button>
        </div>
    );
}

export default PrePost;