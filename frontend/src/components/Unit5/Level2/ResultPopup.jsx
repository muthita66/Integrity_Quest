import { BASE_URL } from "../../../config";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import './Result.css';
import {
    FaBookOpen,
    FaHeart,
    FaRoad,
    FaTree,
    FaFire,
    FaTint,
    FaCoins,
    FaHome,
    FaRedoAlt,
    FaPlay,
    FaLightbulb,
    FaTrophy,
    FaStar,
    FaSmileBeam,
} from "react-icons/fa";

// Config ชื่อและสีแต่ละหมวด
const BUDGET_CONFIG = [
    { id: "school", title: "โรงเรียน", icon: FaBookOpen, color: "#3b82f6" },
    { id: "hospital", title: "โรงพยาบาล", icon: FaHeart, color: "#ef4444" },
    { id: "road", title: "ถนน", icon: FaRoad, color: "#22c55e" },
    { id: "fire", title: "สถานีดับเพลิง", icon: FaFire, color: "#f97316" },
    { id: "park", title: "สวนสาธารณะ", icon: FaTree, color: "#84cc16" },
    { id: "water", title: "ระบบน้ำสะอาด", icon: FaTint, color: "#06b6d4" },
];

// ============================================================
// ผลของ Unit 5 Level 2 — ดึงจาก DB ด้วย playId
// คะแนน / ความสุข / Rank / IP คิดที่ backend (gamePlayService.calcBudgetResult)
// ============================================================

const API_URL = `${BASE_URL}`;

const RANK_INFO = {
    S: { rankText: "ยอดเยี่ยม!", stars: 5 },
    A: { rankText: "ดีมาก!", stars: 4 },
    B: { rankText: "ดี", stars: 3 },
    C: { rankText: "พอใช้", stars: 2 },
    D: { rankText: "ควรปรับปรุง", stars: 1 },
};

export default function TaxBuilderResult() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const playId = Number(searchParams.get("playId"));

    const [result, setResult] = useState(null);

    useEffect(() => {
        if (!Number.isInteger(playId) || playId <= 0) {
            navigate("/unit5/game2", { replace: true });
            return;
        }

        let isMounted = true;

        const load = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/api/budget-game/play/${playId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                if (response.status === 401) {
                    navigate("/", { replace: true });
                    return;
                }

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "โหลดผลลัพธ์ไม่สำเร็จ");
                }

                if (isMounted) setResult(data.data);
            } catch (error) {
                console.error("Load budget result error:", error);
                alert("ไม่สามารถโหลดผลลัพธ์: " + error.message);
                navigate("/unit5/game2", { replace: true });
            }
        };

        load();

        return () => {
            isMounted = false;
        };
    }, [playId, navigate]);

    if (!result) {
        return (
            <div
                style={{
                    height: "100dvh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#e7ebf3",
                    background: "#21130c",
                    fontSize: 18,
                }}
            >
                กำลังโหลดรายงานผล...
            </div>
        );
    }

    const budgets = result.budgets;
    const totalBudget = result.total_budget;
    const remainingBudget = result.remaining_budget;
    const usedBudget = result.used_budget;
    const happiness = result.happiness;
    const score = result.score;
    const rank = result.rank;
    const earnedIP = result.earned_ip ?? 0;
    const { rankText, stars } = RANK_INFO[rank] || RANK_INFO.C;

    // แปลง budgets object → array ที่มี cost และ percent
    const budgetList = BUDGET_CONFIG.map((cfg) => {
        const cost = budgets[cfg.id] ?? 0;
        const percent = totalBudget > 0 ? Math.round((cost / totalBudget) * 100) : 0;
        return { ...cfg, cost, percent };
    });

    // ความพอเพียงรายด้าน = งบที่ได้ ÷ ส่วนแบ่งเท่ากัน (งบรวม ÷ 6)
    // 100% = ได้เท่ากับส่วนแบ่งเท่ากันหรือมากกว่า, ต่ำกว่านั้นคือได้น้อยกว่าส่วนแบ่ง
    const fairShare = totalBudget / BUDGET_CONFIG.length;
    const statData = budgetList.map((item) => ({
        ...item,
        value: fairShare > 0 ? Math.min(100, Math.round((item.cost / fairShare) * 100)) : 0,
    }));

    const event = result.event ?? null;
    const penalty = result.penalty ?? 0;
    const baseScore = result.base_score ?? score + penalty;
    const weakest = result.weakest ?? null;

    return (
        <>
            <div className="tax-result-page">

                <div className="gold-frame">

                    <div className="result-header">

                        <div className="title-group">

                            <div className="laurel">🌿</div>

                            <div>
                                <h1>รายงานผล</h1>
                            </div>

                            <div className="laurel">🌿</div>

                        </div>

                        <p className="subtitle">เมืองของเราเติบโตไปด้วยกัน</p>

                    </div>

                    <div className="result-content">

                        {/* ================= LEFT ================= */}

                        <div className="left-panel">

                            <div className="panel-title">
                                <FaCoins className="panel-title-icon" />
                                การจัดสรรงบประมาณ
                            </div>

                            <div className="budget-grid">
                                {budgetList.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <div
                                            className="budget-card"
                                            key={item.id}
                                        >
                                            <div
                                                className="budget-icon"
                                                style={{
                                                    background: item.color,
                                                }}
                                            >
                                                <Icon />
                                            </div>

                                            <div className="budget-title">
                                                {item.title}
                                            </div>

                                            <div className="budget-cost">
                                                {item.cost}
                                                <FaCoins className="coin-icon" />
                                            </div>

                                            <div className="progress-wrap">
                                                <div className="progress-bg">
                                                    <div
                                                        className="progress-fill"
                                                        style={{
                                                            width: `${item.percent}%`,
                                                            background: item.color,
                                                        }}
                                                    />
                                                </div>

                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="budget-footer">

                                <div className="budget-item">
                                    <div className="budget-item-label">
                                        <FaCoins />
                                        <span>งบประมาณรวม</span>
                                    </div>
                                    <strong>{totalBudget}</strong>
                                </div>

                                <div className="divider" />

                                <div className="budget-item">
                                    <div className="budget-item-label">
                                        <span>ใช้ไป</span>
                                    </div>
                                    <strong>{usedBudget}</strong>
                                </div>

                                <div className="divider" />

                                <div className="budget-item">
                                    <div className="budget-item-label">
                                        <span>คงเหลือ</span>
                                    </div>
                                    <strong style={{ color: "#ff4d4f" }}>
                                        {remainingBudget}
                                    </strong>
                                </div>

                            </div>

                        </div>

                        {/* ================= CENTER ================= */}

                        <div className="center-panel">
                            <div className="score-header">

                                <div className="mini-laurel">
                                    <FaTrophy />
                                </div>

                                <div className="score-group">
                                    <span>คะแนนรวม</span>

                                    <h2>
                                        {score}
                                        <small>/100</small>
                                    </h2>
                                </div>

                                <div className="mini-laurel">
                                    <FaTrophy />
                                </div>

                            </div>

                            <div className="grade-card">

                                <div className="grade-medal">
                                    <div className="grade-shield">
                                        {rank}
                                    </div>
                                </div>

                                <div className="grade-banner">
                                    {rankText}
                                </div>

                                <div className="stars">
                                    {[...Array(stars)].map((_, i) => (
                                        <FaStar key={i} />
                                    ))}
                                </div>

                            </div>

                            <p className="grade-description">

                                {rank === "S" &&
                                    "เมืองพัฒนาอย่างยอดเยี่ยม ประชาชนมีคุณภาพชีวิตสูง"}

                                {rank === "A" &&
                                    "เมืองมีการบริหารจัดการที่ดีและสมดุล"}

                                {rank === "B" &&
                                    "เมืองพัฒนาได้ดี แต่ยังมีบางส่วนที่ควรปรับปรุง"}

                                {rank === "C" &&
                                    "การจัดสรรงบประมาณยังไม่สมดุลเท่าที่ควร"}

                                {rank === "D" &&
                                    "ควรวางแผนการใช้งบประมาณใหม่ให้ตอบโจทย์ประชาชนมากขึ้น"}

                            </p>

                            <div className="hp-card">

                                <span className="hp-number">
                                    {earnedIP} IP ที่ได้รับ
                                </span>
                            </div>

                            <div className="suggest-card" style={{ width: "100%", textAlign: "left", marginTop: 12 }}>
                                <div className="suggest-title">
                                    <FaLightbulb />
                                    ข้อเสนอแนะ
                                </div>

                                <p>
                                    {event && (
                                        <>
                                            <strong>เหตุการณ์ {event.title}:</strong>{" "}
                                            {event.triggered
                                                ? `${event.category_name}ได้งบ ${event.amount} เหรียญ ต่ำกว่า ${event.min_required} จึงถูกหัก ${event.penalty} คะแนน`
                                                : `${event.category_name}ได้งบ ${event.amount} เหรียญ รับมือได้ ไม่ถูกหักคะแนน`}
                                            <br />
                                        </>
                                    )}
                                    {weakest && (
                                        <>
                                            ด้านที่ได้งบน้อยที่สุดคือ{weakest.name} ({weakest.amount} เหรียญ)
                                            ลองเพิ่มงบด้านนี้เพื่อให้ประชาชนพึงพอใจมากขึ้น
                                        </>
                                    )}

                                </p>
                            </div>

                        </div>

                        {/* ================= RIGHT ================= */}

                        <div className="right-panel">

                            <div className="happy-card">

                                <h3>
                                    ความสุขประชาชน
                                </h3>

                                <div className="happy-score">
                                    <span>{happiness}%</span>
                                    <FaSmileBeam />
                                </div>

                            </div>

                            <p style={{ color: "#d7bf98", fontSize: 12, textAlign: "center", marginBottom: 8, flexShrink: 0 }}>
                                ความพอเพียงรายด้าน (100% = ได้เท่าส่วนแบ่งเท่ากัน {fairShare.toFixed(1)} เหรียญ)
                            </p>

                            <div className="stat-list">

                                {statData.map((item) => {

                                    const Icon = item.icon;

                                    return (

                                        <div
                                            className="stat-item"
                                            key={item.title}
                                        >

                                            <div className="stat-top">

                                                <div
                                                    className="stat-icon"
                                                    style={{
                                                        background: item.color,
                                                    }}
                                                >

                                                    <Icon />

                                                </div>

                                                <span>
                                                    {item.title}
                                                </span>

                                                <strong>
                                                    {item.value}%
                                                </strong>

                                            </div>

                                            <div className="stat-progress">

                                                <div
                                                    className="stat-fill"
                                                    style={{
                                                        width: `${item.value}%`,
                                                        background: item.color,
                                                    }}
                                                />

                                            </div>

                                        </div>

                                    );

                                })}

                            </div>

                        </div>

                    </div>

                    <div className="bottom-buttons">

                        <button className="btn blue" onClick={() => navigate("/unit5/game2")}>

                            <FaRedoAlt />

                            <div>
                                <strong>เริ่มใหม่</strong>
                                <span>เริ่มใหม่อีกครั้ง</span>
                            </div>

                        </button>

                        <button className="btn green" onClick={() => navigate("/unit5/game3/intro")}>

                            <FaPlay />

                            <div>
                                <strong>ด่านถัดไป</strong>
                                <span>ไปยังภารกิจถัดไป</span>
                            </div>

                        </button>

                        <button className="btn blue" onClick={() => navigate('/map')}>กลับหน้าหลัก</button>
                    </div>

                </div>

            </div>

        </>
    );
}