import mirrorImage from "../../../assets/unit6/golden-mirror.png";

export default function IntroScreen({ startGame }) {
    return (
        <div className="sm-screen sm-golden-intro">
            <div className="sm-mirror-preview"><img src={mirrorImage} alt="กระจกกรอบทองประดับคริสตัล" /><div className="sm-mirror-inscription"><span>ภาพสะท้อนที่มีค่า</span><strong>คือตัวคุณเอง</strong></div></div>
            <div className="sm-intro-copy">
            <p className="sm-eyebrow">บทที่ 6 · ภารกิจสุดท้าย</p>
            <h1 className="sm-title">เงาในกระจก</h1>

            <p className="sm-sub">
                พิมพ์คำตอบได้ตามสบาย ไม่มีคำตอบที่ถูกหรือผิด
                <br />
                เงาในกระจกเพียงอยากเห็นเงาที่แท้จริงของคุณ
            </p>

            <ul className="sm-rules-list">
                <li>
                    <b>วิธีเล่น</b>
                    <span>ตอบคำถามสะท้อนใจ 6 ข้อ ด้วยคำพูดของคุณเอง</span>
                </li>

                <li>
                    <b>AI วิเคราะห์</b>
                    <span>ตรรกะ · ความเห็นใจ · ความรับผิดชอบ · ความสอดคล้อง</span>
                </li>

                <li>
                    <b>ผลลัพธ์</b>
                    <span>ตรารางวัล Bronze ถึง Legend สะท้อนภาพรวมของคุณ</span>
                </li>
            </ul>

            <div className="sm-begin-wrap">
                <button className="sm-btn" onClick={startGame}>
                    เริ่มมองเข้าไปในกระจก
                </button>
            </div>
            </div>
        </div>
    );
}
