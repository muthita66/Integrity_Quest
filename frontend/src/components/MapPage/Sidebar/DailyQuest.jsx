import { useEffect, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";

import { getDailyQuests } from "../../services/profileService";

// ============================================================
// Daily Quests (ดึงจาก DB ผ่าน /api/profile/daily-quests)
// ------------------------------------------------------------
// - ภารกิจของ "วันนี้" รีเซ็ตทุกเที่ยงคืน (เวลาไทย)
// - ยังไม่เสร็จ : แสดง 0/1 + แถบความคืบหน้า
// - เสร็จแล้ว   : พื้นเขียว + ✓
// ใช้ class เดิมใน index.css (.panel / .quest-item / .quest-check)
// ============================================================

function DailyQuest() {
    const [quests, setQuests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        getDailyQuests()
            .then((data) => {
                if (isMounted) setQuests(data?.quests || []);
            })
            .catch((error) => {
                console.error("Load daily quests error:", error);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="panel">
            <div className="panel-header-container">
                <h3>Daily Quests</h3>
            </div>

            {loading && (
                <div className="quest-item">
                    <span className="quest-text">กำลังโหลด...</span>
                </div>
            )}

            {!loading && quests.length === 0 && (
                <div className="quest-item">
                    <span className="quest-text">โหลดภารกิจไม่สำเร็จ</span>
                </div>
            )}

            {quests.map((quest) => {
                const percent = Math.round(
                    (quest.progress / quest.target) * 100
                );

                return (
                    <div
                        key={quest.key}
                        className={`quest-item ${quest.completed ? "completed" : ""}`}
                        style={{ flexDirection: "column", alignItems: "stretch", gap: 6 }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 8,
                            }}
                        >
                            <span className="quest-text">{quest.title}</span>

                            {quest.completed ? (
                                <FaCheckCircle className="quest-check" />
                            ) : (
                                <span
                                    style={{
                                        fontSize: 12,
                                        fontWeight: 800,
                                        color: "#8c5d40",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {quest.progress}/{quest.target}
                                </span>
                            )}
                        </div>

                        {/* แถบความคืบหน้า (เฉพาะที่ยังไม่เสร็จ) */}
                        {!quest.completed && (
                            <div
                                style={{
                                    height: 6,
                                    borderRadius: 999,
                                    background: "rgba(212, 163, 115, 0.25)",
                                    overflow: "hidden",
                                }}
                            >
                                <div
                                    style={{
                                        width: `${percent}%`,
                                        height: "100%",
                                        borderRadius: 999,
                                        background: "#f59e0b",
                                        transition: "width 0.4s ease",
                                    }}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default DailyQuest;