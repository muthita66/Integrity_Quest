import { FaThumbtack, FaGraduationCap } from "react-icons/fa";
import "./style/Game1.css";

export default function IntroScreen({ onStart }) {
    return (
        <div className="crisis-stage">
            <div className="intro-card">
                <span className="pin pin-left"><FaThumbtack /></span>
                <span className="pin pin-right"><FaThumbtack /></span>
                <div className="intro-badge">🦸</div>
                <h1><FaGraduationCap className="title-icon items-center justify-center" /> Crisis Response</h1>
                <p>โรงเรียนกำลังเกิดเหตุการณ์หลายจุด คุณมีเวลาเพียง 30 วินาทีในการช่วยเหลือให้มากที่สุด</p>
                <button className="intro-start" onClick={onStart}>เริ่มภารกิจ</button>
            </div>
        </div>
    );
}
