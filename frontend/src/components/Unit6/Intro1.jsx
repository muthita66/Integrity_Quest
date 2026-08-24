import { FaThumbtack, FaGraduationCap } from "react-icons/fa";

export default function IntroScreen({ onStart }) {
    return (
        <div className="intro-card">
            <span className="pin pin-left"><FaThumbtack /></span>
            <span className="pin pin-right"><FaThumbtack /></span>
            <div className="intro-badge">🦸</div>
            <h1><FaGraduationCap className="title-icon" /> Crisis Response</h1>
            <p>โรงเรียนกำลังเกิดเหตุการณ์หลายจุด คุณมีเวลาเพียง 2 นาทีในการช่วยเหลือให้มากที่สุด</p>
            <button className="intro-start" onClick={onStart}>เริ่มภารกิจ</button>
        </div>
    );
}