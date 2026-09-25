import { motion } from "framer-motion";
import { FaArrowRight, FaMedal } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import "../../styles/theme.css";

const MAX_POINTS = 560;

export default function Completion() {
    const navigate = useNavigate();
    const save = (() => {
        try {
            return JSON.parse(localStorage.getItem("unit4")) || {};
        } catch {
            return {};
        }
    })();

    const points = Math.min(
        MAX_POINTS,
        (save.level1Points || 0) + (save.level2Points || 0) + (save.level3Points || 0)
    );

    return (
        <main className="unit4-complete">
            <motion.section
                className="unit4-complete-card"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .45 }}
            >
                <div className="unit4-complete-eyebrow">INTEGRITY QUEST · CASE CLOSED</div>
                <div className="unit4-complete-medal"><FaMedal /></div>
                <p className="unit4-complete-kicker">ยินดีด้วย นักสืบ!</p>
                <h1>คุณปิดคดี Cyber Trap สำเร็จแล้ว</h1>
                <p className="unit4-complete-copy">
                    คุณผ่านภารกิจครบทั้ง 3 บท และพร้อมรับมือกับกลโกงดิจิทัลในวันทำงานจริง
                </p>

                <div className="unit4-complete-score">
                    <span>INTEGRITY POINT</span>
                    <strong>{points}</strong>
                    <small>/ {MAX_POINTS}</small>
                </div>

                <div className="unit4-complete-progress"><span style={{ width: `${(points / MAX_POINTS) * 100}%` }} /></div>

                <div className="unit4-complete-actions">
                    <button type="button" onClick={() => navigate("/map")}>
                        กลับหน้า Map <FaArrowRight />
                    </button>
                </div>
            </motion.section>
        </main>
    );
}
