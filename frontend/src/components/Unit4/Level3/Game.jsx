import { useEffect, useRef, useState } from "react";
import { FaShieldAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BookLayout from "../BookLayout";
import normalScreen from "../../../assets/unit4/normal.png";
import safeScreen from "../../../assets/unit4/Potect.png";
import warningScreen from "../../../assets/unit4/warning.png";
import virusImg from "../../../assets/unit4/virus.png";
import "../../../styles/theme.css";
import "./level3.css";

const QUESTIONS = [
    { question: "หากได้รับลิงก์แปลกจากคนไม่รู้จัก ควรทำอย่างไร", choices: ["กดลิงก์ทันที", "ส่งต่อให้เพื่อน", "บันทึกลิงก์ไว้", "ไม่กดและตรวจสอบแหล่งที่มา"], answer: 3 },
    { question: "สลิปโอนเงินปลอมมักมีจุดสังเกตใด", choices: ["ฟอนต์ผิดปกติ", "มีโลโก้ธนาคาร", "มี QR Code", "มีชื่อผู้โอน"], answer: 0 },
    { question: "รหัสผ่านที่ปลอดภัยควรเป็นแบบใด", choices: ["12345678", "วันเกิด", "ผสมตัวอักษร ตัวเลข และสัญลักษณ์", "ชื่อเล่น"], answer: 2 },
    { question: "หากพบข่าวน่าสงสัยบนโซเชียล ควรทำอย่างไร", choices: ["แชร์ทันที", "เชื่อเพราะมีคนแชร์เยอะ", "ตรวจสอบจากแหล่งข่าวที่น่าเชื่อถือ", "ส่งต่อให้ครอบครัว"], answer: 2 },
    { question: "OTP ควรบอกกับใคร", choices: ["พนักงานธนาคารที่โทรมา", "เพื่อนสนิท", "คนในครอบครัว", "ไม่ควรบอกใคร"], answer: 3 },
    { question: "ข้อใดเป็นลักษณะของเว็บไซต์ปลอม", choices: ["URL สะกดผิด", "มี HTTPS เสมอ", "โหลดเร็ว", "มีโลโก้บริษัท"], answer: 0 },
    { question: "ควรอัปเดตซอฟต์แวร์สม่ำเสมอเพราะเหตุใด", choices: ["เพิ่มสีสันหน้าจอ", "ปิดช่องโหว่ด้านความปลอดภัย", "ทำให้แบตเตอรี่หมดเร็ว", "เปลี่ยนไอคอน"], answer: 1 },
    { question: "Wi-Fi สาธารณะมีความเสี่ยงอย่างไร", choices: ["อินเทอร์เน็ตช้า", "ข้อมูลอาจถูกดักจับ", "โทรศัพท์ร้อน", "ใช้แอปไม่ได้"], answer: 1 },
    { question: "ควรทำอย่างไรเมื่อได้รับอีเมลขอข้อมูลส่วนตัว", choices: ["ตอบกลับทันที", "ส่งข้อมูลให้ครบ", "ตรวจสอบผู้ส่งก่อนทุกครั้ง", "กดลิงก์ในอีเมล"], answer: 2 },
    { question: "การยืนยันตัวตนแบบ 2 ขั้นตอนช่วยอะไร", choices: ["เพิ่มความปลอดภัยของบัญชี", "ทำให้อินเทอร์เน็ตเร็วขึ้น", "เพิ่มพื้นที่เก็บข้อมูล", "ลดการใช้แบตเตอรี่"], answer: 0 },
];

export default function Game() {
    const navigate = useNavigate();
    const startTime = useRef(Date.now());
    const timerRef = useRef();
    const [current, setCurrent] = useState(0);
    const [correct, setCorrect] = useState(0);
    const [hearts, setHearts] = useState(4);
    const [screenState, setScreenState] = useState("normal");
    const [virusAttack, setVirusAttack] = useState(false);

    const finish = (remainingHearts = hearts, correctAnswers = correct) => {
        const elapsed = Date.now() - startTime.current;
        navigate("/unit4/level3/result", {
            state: {
                score: Math.round((correctAnswers / QUESTIONS.length) * 100),
                hp: remainingHearts * 25,
                correctAnswers,
                wrongAnswers: QUESTIONS.length - correctAnswers,
                playTime: `${String(Math.floor(elapsed / 60000)).padStart(2, "0")}:${String(Math.floor((elapsed / 1000) % 60)).padStart(2, "0")}`,
            },
        });
    };

    useEffect(() => () => clearTimeout(timerRef.current), []);

    const next = (nextHearts = hearts, nextCorrect = correct) => {
        if (current === QUESTIONS.length - 1) {
            finish(nextHearts, nextCorrect);
            return;
        }
        setCurrent((value) => value + 1);
        setScreenState("normal");
        setVirusAttack(false);
    };

    const wrong = () => {
        const remaining = hearts - 1;
        setVirusAttack(true);
        setScreenState("warning");
        setHearts(remaining);
        timerRef.current = setTimeout(() => {
            if (remaining <= 0) finish(0, correct);
            else next(remaining, correct);
        }, 850);
    };

    const answer = (choice) => {
        if (screenState !== "normal") return;
        clearTimeout(timerRef.current);
        if (choice === QUESTIONS[current].answer) {
            const nextCorrect = correct + 1;
            setCorrect(nextCorrect);
            setScreenState("safe");
            timerRef.current = setTimeout(() => next(hearts, nextCorrect), 650);
        } else {
            wrong();
        }
    };

    const screen = screenState === "safe" ? safeScreen : screenState === "warning" ? warningScreen : normalScreen;

    return (
        <BookLayout
            title="บทที่ 3 — ภารกิจสุดท้าย"
            subtitle="Firewall Defender"
            rightLabel="คำถามป้องกันระบบ"
            rightNote={`${current + 1} / ${QUESTIONS.length}`}
            onBack={() => navigate("/unit4/book")}
            leftPage={
                <div className="level3-phone-page">
                    <div className="level3-phone">
                        <div className="level3-phone-speaker" />
                        <div className="level3-phone-screen">
                            <div className="level3-phone-status"><span>09:41</span><span>●●● ◒</span></div>
                            <div className="level3-phone-appbar"><FaShieldAlt /> <span>FIREWALL DEFENDER</span></div>
                            <motion.img
                                key={screenState}
                                src={screen}
                                alt="สถานะระบบป้องกัน"
                                className="level3-phone-image"
                                animate={screenState === "warning" ? { x: [-4, 4, -4, 0] } : { scale: [1, 1.02, 1] }}
                                transition={{ duration: .45 }}
                            />
                            <div className={`level3-phone-status-card is-${screenState}`}>
                                <strong>{screenState === "warning" ? "THREAT DETECTED" : screenState === "safe" ? "THREAT BLOCKED" : "SYSTEM SECURE"}</strong>
                                <span>Firewall integrity {hearts * 25}%</span>
                            </div>
                            {virusAttack && <motion.img className="level3-virus" src={virusImg} alt="ไวรัสกำลังโจมตี" initial={{ x: 80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} />}
                        </div>
                        <div className="level3-phone-home" />
                    </div>
                    <div className="level3-phone-caption">DEVICE 03 / LIVE DEFENSE</div>
                </div>
            }
            rightPage={
                <div className="level3-question-page">
                    <div className="level3-progress-row"><span>กำลังป้องกันฐานข้อมูล</span><strong>{correct} ถูก</strong></div>
                    <div className="level3-progress"><span style={{ width: `${((current + 1) / QUESTIONS.length) * 100}%` }} /></div>
                    <div className="level3-question-card">
                        <span className="level3-question-label">THREAT SCAN {String(current + 1).padStart(2, "0")}</span>
                        <h2>{QUESTIONS[current].question}</h2>
                        <div className="level3-answers">
                            {QUESTIONS[current].choices.map((choice, index) => (
                                <button type="button" key={choice} onClick={() => answer(index)} disabled={screenState !== "normal"}>
                                    <b>{String.fromCharCode(65 + index)}</b><span>{choice}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            }
        />
    );
}
