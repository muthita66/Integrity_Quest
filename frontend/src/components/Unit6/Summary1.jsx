import { FaTrophy } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

export default function SummaryScreen(props) {
    const {
        helpedCount,
        missedCount,
        integrity,
        score,
        rank,
        rankText,
        flavor,
        studentsSafe,
        onRestart,
        onNext,
    } = props;

    return (
        <div className="summary-card">
            <div className="summary-badge"><FaTrophy /></div>
            <h1>Mission Complete</h1>
            <p>ช่วยเหลือ {helpedCount} / {helpedCount + missedCount}</p>
            <p>Integrity: {integrity}</p>
            <p>Score: {score}</p>
            <div className="summary-rank">
                <div className="rank-shield">{rank}</div>
                <div className="rank-text">{rankText}</div>
            </div>
            <p>{studentsSafe ? "✅ นักเรียนปลอดภัย" : "⚠️ นักเรียนบางส่วนไม่ปลอดภัย"} — {flavor}</p>
            <button onClick={onRestart}>เล่นใหม่</button>
            <button onClick={() => navigate('/unit6/game2')}>ด่านต่อไป</button>
        </div>
    );
}