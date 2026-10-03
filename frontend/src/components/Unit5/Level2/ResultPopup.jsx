import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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
    { id: "school", title: "การศึกษา", icon: FaBookOpen, color: "#3b82f6" },
    { id: "hospital", title: "สาธารณสุข", icon: FaHeart, color: "#ef4444" },
    { id: "road", title: "คมนาคม", icon: FaRoad, color: "#22c55e" },
    { id: "fire", title: "ความปลอดภัย", icon: FaFire, color: "#f97316" },
    { id: "park", title: "สวนสาธารณะ", icon: FaTree, color: "#22c55e" },
    { id: "water", title: "ระบบน้ำประปา", icon: FaTint, color: "#06b6d4" },
];

// ============================================================
// ผลของ Unit 5 Level 2 — ดึงจาก DB ด้วย playId
// คะแนน / ความสุข / Rank / IP คิดที่ backend (gamePlayService.calcBudgetResult)
// ============================================================

const API_URL = "http://localhost:5000";

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
                    height: "100vh",
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
    const { rankText, stars } = RANK_INFO[rank] || RANK_INFO.D;

    // แปลง budgets object → array ที่มี cost และ percent
    const budgetList = BUDGET_CONFIG.map((cfg) => {
        const cost = budgets[cfg.id] ?? 0;
        const percent = totalBudget > 0 ? Math.round((cost / totalBudget) * 100) : 0;
        return { ...cfg, cost, percent };
    });

    // statData สำหรับ right panel
    const statData = [
        { title: "การศึกษา", icon: FaBookOpen, color: "#3b82f6", value: Math.min(100, (budgets.school / totalBudget) * 100 * 3 | 0) },
        { title: "สุขภาพ", icon: FaHeart, color: "#ef4444", value: Math.min(100, (budgets.hospital / totalBudget) * 100 * 3 | 0) },
        { title: "คมนาคม", icon: FaRoad, color: "#22c55e", value: Math.min(100, (budgets.road / totalBudget) * 100 * 3 | 0) },
        { title: "ความปลอดภัย", icon: FaFire, color: "#f97316", value: Math.min(100, (budgets.fire / totalBudget) * 100 * 3 | 0) },
        { title: "สิ่งแวดล้อม", icon: FaTree, color: "#22c55e", value: Math.min(100, (budgets.park / totalBudget) * 100 * 3 | 0) },
    ];

    return (
        <>
            <style>{css}</style>

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

                                                <span
                                                    className="progress-text"
                                                    style={{
                                                        color: item.color,
                                                    }}
                                                >
                                                    {item.percent}%
                                                </span>
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

                                <FaHeart className="hp-heart" />

                                <span className="hp-number">
                                    +{earnedIP}
                                </span>

                                <span className="hp-label">
                                    IP ที่ได้รับ
                                </span>

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

                            <div className="suggest-card">
                                <div className="suggest-title">
                                    <FaLightbulb />
                                    ข้อเสนอแนะ
                                </div>

                                <p>
                                    ควรเพิ่มงบประมาณด้านคมนาคมและความปลอดภัย
                                    เพื่อเพิ่มความสุขของประชาชน
                                </p>
                            </div>

                        </div>

                    </div>

                    <div className="bottom-buttons">

                        <button className="btn blue" onClick={() => navigate("/unit5/game2")}>

                            <FaRedoAlt />

                            <div>
                                <strong>เล่นใหม่</strong>
                                <span>เริ่มใหม่อีกครั้ง</span>
                            </div>

                        </button>

                        <button className="btn green" onClick={() => navigate("/unit5/game3/intro")}>

                            <FaPlay />

                            <div>
                                <strong>ดำเนินการต่อ</strong>
                                <span>ไปยังภารกิจถัดไป</span>
                            </div>

                        </button>

                    </div>

                </div>

            </div>

        </>
    );
}
const css = `
*{
box-sizing:border-box;
margin:0;
padding:0;
font-family:Inter,sans-serif;
}

body{
background:#21130c;
}

.tax-result-page{
height:100vh;
padding:10px;
display:flex;
justify-content:center;
align-items:center;
overflow:hidden;
background:
radial-gradient(circle at 50% -20%,#70431f 0%,transparent 42%),
linear-gradient(135deg,#1b0e08 0%,#2c180d 48%,#160b07 100%);
position:relative;
}

.tax-result-page::before{
content:"";
position:absolute;
inset:0;
pointer-events:none;
opacity:.22;
background-image:
linear-gradient(rgba(255,210,90,.1) 1px,transparent 1px),
linear-gradient(90deg,rgba(255,210,90,.1) 1px,transparent 1px);
background-size:32px 32px;
}

.gold-frame{
width:min(96vw,1500px);
height:96vh;
padding:16px 24px 18px;
display:flex;
flex-direction:column;
overflow:hidden;
background:linear-gradient(145deg,#2f1b10 0%,#21120b 55%,#3a2113 100%);
border:3px solid #c99833;
border-radius:24px;
box-shadow:
0 0 0 2px rgba(255,204,90,.25) inset,
0 20px 60px rgba(0,0,0,.5),
0 0 40px rgba(255,196,55,.08);
position:relative;
z-index:1;
}

.result-header{
display:flex;
flex-direction:column;
align-items:center;
margin-bottom:10px;
flex-shrink:0;
}

.title-group{
display:flex;
align-items:center;
gap:12px;
}

.laurel{
font-size:28px;
color:#ffc93c;
filter:drop-shadow(0 0 10px rgba(255,201,60,.5));
}

.title-group h1{
font-size:34px;
font-weight:900;
color:#ffcb3f;
text-shadow:
0 2px 0 #6b4300,
0 6px 18px rgba(255,190,0,.4);
letter-spacing:1px;
}

.subtitle{
margin-top:2px;
font-size:13px;
color:#d7bf98;
letter-spacing:.5px;
}

.result-content{
flex:1;
min-height:0;
display:grid;
grid-template-columns:1.2fr .95fr 1.05fr;
gap:16px;
align-items:stretch;
}

.left-panel,
.center-panel,
.right-panel{
display:flex;
flex-direction:column;
background:rgba(38,21,13,.9);
border:1px solid #684522;
border-radius:18px;
padding:16px;
min-height:0;
overflow:hidden;
box-shadow:0 10px 24px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,244,210,.06);
}

.center-panel{
align-items:center;
justify-content:center;
text-align:center;
gap:6px;
}

.panel-title{
display:flex;
align-items:center;
justify-content:center;
gap:8px;
font-size:18px;
font-weight:800;
color:white;
margin-bottom:14px;
flex-shrink:0;
}

.panel-title-icon{
color:#ffd54a;
}

.budget-grid{
flex:1;
min-height:0;
display:grid;
grid-template-columns:repeat(3,minmax(0,1fr));
grid-template-rows:repeat(2,1fr);
gap:10px;
}

.budget-card{
display:flex;
flex-direction:column;
align-items:center;
justify-content:space-evenly;
gap:6px;
padding:14px 8px;
background:#3a2518;
border-radius:14px;
border:1px solid #624326;
transition:.25s;
min-height:0;
box-shadow:inset 0 1px 0 rgba(255,244,210,.06);
}

.budget-card:hover{
transform:translateY(-4px) rotate(-.5deg);
border-color:#b27a2b;
box-shadow:0 10px 20px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,244,210,.08);
}

.budget-card:nth-child(1){box-shadow:inset 0 3px 0 #3b82f6,0 6px 16px rgba(0,0,0,.16)}
.budget-card:nth-child(2){box-shadow:inset 0 3px 0 #ef4444,0 6px 16px rgba(0,0,0,.16)}
.budget-card:nth-child(3){box-shadow:inset 0 3px 0 #22c55e,0 6px 16px rgba(0,0,0,.16)}
.budget-card:nth-child(4){box-shadow:inset 0 3px 0 #f97316,0 6px 16px rgba(0,0,0,.16)}
.budget-card:nth-child(5){box-shadow:inset 0 3px 0 #22c55e,0 6px 16px rgba(0,0,0,.16)}
.budget-card:nth-child(6){box-shadow:inset 0 3px 0 #06b6d4,0 6px 16px rgba(0,0,0,.16)}

.budget-icon{
width:44px;
height:44px;
border-radius:50%;
display:flex;
justify-content:center;
align-items:center;
font-size:18px;
color:white;
box-shadow:0 4px 10px rgba(0,0,0,.4);
}

.budget-title{
font-size:13px;
font-weight:700;
color:#f6e7c9;
text-align:center;
}

.budget-cost{
display:flex;
justify-content:center;
align-items:center;
gap:6px;
font-size:24px;
font-weight:900;
color:#ffd74d;
}

.coin-icon{
font-size:15px;
}

.progress-wrap{
width:88%;
margin-top:2px;
}

.progress-bg{
height:6px;
background:#5a4028;
border-radius:999px;
overflow:hidden;
}

.progress-fill{
height:100%;
border-radius:999px;
}

.progress-text{
margin-top:3px;
display:block;
text-align:center;
font-size:11px;
font-weight:700;
}

.budget-footer{
margin-top:16px;
flex-shrink:0;
display:flex;
justify-content:space-around;
align-items:center;
padding:16px;
border-radius:14px;
background:#3a2518;
border:1px solid #624326;
}

.budget-item{
display:flex;
flex-direction:column;
align-items:center;
gap:6px;
}

.budget-item-label{
display:flex;
align-items:center;
gap:5px;
font-size:12px;
color:#d7bf98;
}

.budget-item strong{
font-size:24px;
color:#ffd54a;
}

.divider{
width:1px;
height:38px;
background:#5a4028;
}

.score-header{
display:flex;
justify-content:center;
align-items:center;
gap:12px;
flex-shrink:0;
}

.mini-laurel{
font-size:22px;
color:#ffca2b;
}

.score-group{
text-align:center;
}

.score-group span{
color:#d7bf98;
font-size:13px;
font-weight:600;
}

.score-group h2{
font-size:46px;
color:#24e24b;
font-weight:900;
line-height:1.1;
}

.score-group small{
font-size:20px;
color:#9fb2c9;
font-weight:700;
}

.grade-card{
margin-top:22px;
display:flex;
flex-direction:column;
align-items:center;
flex-shrink:0;
}

.grade-medal{
padding:6px;
border-radius:50%;
background:radial-gradient(circle,rgba(255,199,0,.18),transparent 70%);
}

.grade-shield{
width:118px;
height:118px;
border-radius:50%;
display:flex;
justify-content:center;
align-items:center;
font-size:68px;
font-weight:900;
color:#7a4a00;
background:radial-gradient(circle at 35% 30%,#fff3b0,#ffcb33 55%,#c98910);
box-shadow:
0 0 0 5px rgba(255,203,51,.15),
0 10px 24px rgba(255,180,0,.35),
0 0 36px rgba(255,204,60,.22);
}

.grade-banner{
margin-top:-12px;
padding:7px 28px;
font-size:16px;
font-weight:800;
color:white;
background:linear-gradient(#d92b2b,#8a1010);
clip-path:polygon(6% 0%,94% 0%,100% 50%,94% 100%,6% 100%,0% 50%);
box-shadow:0 5px 12px rgba(0,0,0,.35);
}

.stars{
margin-top:12px;
display:flex;
justify-content:center;
gap:7px;
font-size:20px;
color:#ffd13b;
}

.grade-description{
margin-top:20px;
color:#ead9bd;
font-size:15px;
line-height:1.6;
max-width:300px;
flex-shrink:0;
}

.hp-card{
margin-top:24px;
width:100%;
display:flex;
justify-content:center;
align-items:center;
gap:14px;
padding:16px;
border-radius:14px;
background:#3a2518;
border:1px solid #624326;
flex-shrink:0;
}

.hp-heart{
font-size:26px;
color:#ff4f65;
}

.hp-number{
font-size:30px;
font-weight:900;
color:#97f76b;
}

.hp-label{
font-size:16px;
color:#97f76b;
font-weight:700;
}

.happy-card{
padding:18px;
border-radius:16px;
background:#3a2518;
border:1px solid #624326;
margin-bottom:18px;
text-align:center;
flex-shrink:0;
}

.happy-card h3{
color:#ffd13b;
font-size:16px;
font-weight:800;
}

.happy-score{
margin-top:6px;
display:flex;
justify-content:center;
align-items:center;
gap:10px;
font-size:34px;
font-weight:900;
color:white;
}

.happy-score svg{
color:#ffd23b;
}

.stat-list{
flex:1;
min-height:0;
display:flex;
flex-direction:column;
justify-content:center;
gap:20px;
}

.stat-item{
display:flex;
flex-direction:column;
gap:7px;
}

.stat-top{
display:flex;
align-items:center;
gap:10px;
color:#e7ebf3;
font-size:14px;
}

.stat-top strong{
margin-left:auto;
}

.stat-icon{
width:30px;
height:30px;
border-radius:50%;
display:flex;
align-items:center;
justify-content:center;
color:white;
font-size:12px;
flex-shrink:0;
}

.stat-progress{
height:8px;
border-radius:999px;
background:#5a4028;
overflow:hidden;
}

.stat-fill{
height:100%;
border-radius:999px;
}

.suggest-card{
margin-top:18px;
padding:16px;
border-radius:16px;
background:#4a2b17;
border:1px solid #99682b;
flex-shrink:0;
}

.suggest-title{
display:flex;
align-items:center;
gap:8px;
font-size:14px;
font-weight:800;
color:#ffd84a;
margin-bottom:8px;
}

.suggest-card p{
font-size:13px;
line-height:1.6;
color:#f0dfc2;
}

.bottom-buttons{
display:grid;
grid-template-columns:repeat(2,1fr);
gap:16px;
margin-top:14px;
flex-shrink:0;
}

.btn{
height:52px;
border:none;
border-radius:14px;
display:flex;
justify-content:center;
align-items:center;
gap:12px;
cursor:pointer;
font-size:15px;
color:white;
font-weight:700;
transition:.25s;
}

.btn:hover{
transform:translateY(-3px) scale(1.01);
filter:brightness(1.08);
box-shadow:0 8px 20px rgba(0,0,0,.25);
}

.btn svg{
font-size:18px;
}

.btn div{
display:flex;
flex-direction:column;
align-items:flex-start;
}

.btn div span{
font-size:11px;
opacity:.85;
font-weight:500;
}

.blue{
background:linear-gradient(#e7b83f,#a96b18);
}

.green{
background:linear-gradient(#d89b35,#8f5015);
}

@media(max-width:1100px){

.result-content{
grid-template-columns:1fr;
}

.budget-grid{
grid-template-columns:repeat(2,1fr);
}

.title-group h1{
font-size:42px;
}

.bottom-buttons{
grid-template-columns:1fr;
}

}
`;
