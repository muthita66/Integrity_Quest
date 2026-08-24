import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";


import laptopNormal from "../../../assets/unit4/normal.png";
import laptopSafe from "../../../assets/unit4/Potect.png";
import laptopWarning from "../../../assets/unit4/warning.png";

import virusImg from "../../../assets/unit4/virus.png";

const questions = [
    {
        question: "หากได้รับลิงก์แปลกจากคนไม่รู้จัก ควรทำอย่างไร",
        choices: [
            "กดลิงก์ทันที",
            "ส่งต่อให้เพื่อน",
            "บันทึกลิงก์ไว้",
            "ไม่กดและตรวจสอบแหล่งที่มา",
        ],
        answer: 3,
    },
    {
        question: "สลิปโอนเงินปลอมมักมีจุดสังเกตใด",
        choices: [
            "ฟอนต์ผิดปกติ",
            "มีโลโก้ธนาคาร",
            "มี QR Code",
            "มีชื่อผู้โอน",
        ],
        answer: 0,
    },
    {
        question: "รหัสผ่านที่ปลอดภัยควรเป็นแบบใด",
        choices: [
            "12345678",
            "วันเกิด",
            "ผสมตัวอักษร ตัวเลข และสัญลักษณ์",
            "ชื่อเล่น",
        ],
        answer: 2,
    },
    {
        question: "หากพบข่าวน่าสงสัยบนโซเชียล ควรทำอย่างไร",
        choices: [
            "แชร์ทันที",
            "เชื่อเพราะมีคนแชร์เยอะ",
            "ตรวจสอบจากแหล่งข่าวที่น่าเชื่อถือ",
            "ส่งต่อให้ครอบครัว",
        ],
        answer: 2,
    },
    {
        question: "OTP ควรบอกกับใคร",
        choices: [
            "พนักงานธนาคารที่โทรมา",
            "เพื่อนสนิท",
            "คนในครอบครัว",
            "ไม่ควรบอกใคร",
        ],
        answer: 3,
    },
    {
        question: "ข้อใดเป็นลักษณะของเว็บไซต์ปลอม",
        choices: [
            "URL สะกดผิด",
            "มี HTTPS เสมอ",
            "โหลดเร็ว",
            "มีโลโก้บริษัท",
        ],
        answer: 0,
    },
    {
        question: "ควรอัปเดตซอฟต์แวร์สม่ำเสมอเพราะเหตุใด",
        choices: [
            "เพิ่มสีสันหน้าจอ",
            "ปิดช่องโหว่ด้านความปลอดภัย",
            "ทำให้แบตเตอรี่หมดเร็ว",
            "เปลี่ยนไอคอน",
        ],
        answer: 1,
    },
    {
        question: "Wi-Fi สาธารณะมีความเสี่ยงอย่างไร",
        choices: [
            "อินเทอร์เน็ตช้า",
            "ข้อมูลอาจถูกดักจับ",
            "โทรศัพท์ร้อน",
            "ใช้แอปไม่ได้",
        ],
        answer: 1,
    },
    {
        question: "ควรทำอย่างไรเมื่อได้รับอีเมลขอข้อมูลส่วนตัว",
        choices: [
            "ตอบกลับทันที",
            "ส่งข้อมูลให้ครบ",
            "ตรวจสอบผู้ส่งก่อนทุกครั้ง",
            "กดลิงก์ในอีเมล",
        ],
        answer: 2,
    },
    {
        question: "การยืนยันตัวตนแบบ 2 ขั้นตอนช่วยอะไร",
        choices: [
            "เพิ่มความปลอดภัยของบัญชี",
            "ทำให้อินเทอร์เน็ตเร็วขึ้น",
            "เพิ่มพื้นที่เก็บข้อมูล",
            "ลดการใช้แบตเตอรี่",
        ],
        answer: 0,
    },
];



export default function FinalMission() {
    const navigate = useNavigate();
    const startTimeRef = useRef(Date.now());
    const [correctCount, setCorrectCount] = useState(0);
    const [current, setCurrent] = useState(0);
    const [hearts, setHearts] = useState(4);
    const [screenState, setScreenState] = useState("normal");
    const [virusAttack, setVirusAttack] = useState(false);
    const [virusKey, setVirusKey] = useState(0);
    const timerRef = useRef();

    const formatTime = (ms) => {
        const totalSec = Math.floor(ms / 1000);
        const m = String(Math.floor(totalSec / 60)).padStart(2, "0");
        const s = String(totalSec % 60).padStart(2, "0");
        return `${m}:${s}`;
    };

    const goToResult = () => {
        const elapsed = Date.now() - startTimeRef.current;

        const score = Math.round(
            (correctCount / questions.length) * 100
        );

        console.log({
            correctCount,
            score,
        });

        const hp = hearts * 25;


        navigate("/unit4/result", {
            state: {
                score,
                hp,
                correctAnswers: correctCount,
                wrongAnswers: questions.length - correctCount,
                playTime: formatTime(elapsed),
            },
        });
    };




    useEffect(() => {
        if (hearts <= 0) {
            // Navigate to result page on failure
            goToResult();
            return;
        }

        startTimer();

        return () => clearTimeout(timerRef.current);
    }, [current]);

    const startTimer = () => {
        clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
            handleWrong();
        }, 5000);
    };

    const nextQuestion = () => {
        if (current === questions.length - 1) {
            // Navigate to result page when mission is completed
            goToResult();
            return;
        }

        setCurrent((prev) => prev + 1);
        setVirusAttack(false);
        setVirusKey((prev) => prev + 1);
    };

    const handleWrong = () => {
        clearTimeout(timerRef.current);

        setVirusAttack(true);
        setScreenState("warning");

        setTimeout(() => {
            const remain = hearts - 1;

            setHearts(remain);
            setScreenState("normal");

            if (remain <= 0) {
                alert("Server ถูกโจมตี! ภารกิจล้มเหลว");
                goToResult();
                return;
            }

            nextQuestion();
        }, 1200);
    };

    const handleAnswer = (index) => {
        clearTimeout(timerRef.current);

        if (index === questions[current].answer) {
            setCorrectCount((prev) => prev + 1); // เพิ่มจำนวนข้อที่ตอบถูก

            setScreenState("safe");

            setTimeout(() => {
                setScreenState("normal");
                nextQuestion();
            }, 1000);
        } else {
            handleWrong();
        }
    };

    const laptopImage =
        screenState === "safe"
            ? laptopSafe
            : screenState === "warning"
                ? laptopWarning
                : laptopNormal;

    return (
        <>
            <style>{`
        *{
          margin:0;
          padding:0;
          box-sizing:border-box;
        }

        html,
        body,
        #root{
          width:100%;
          height:100%;
          overflow:hidden;
        }

        body{
          font-family:'Segoe UI',sans-serif;
          background:#020817;
        }

        .game{
          width:100vw;
          height:100vh;
          overflow:hidden;
          position:relative;

          background:
            linear-gradient(rgba(0,255,255,.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,255,.05) 1px, transparent 1px),
            radial-gradient(circle at center,#07152f 0%,#020817 100%);

          background-size:48px 48px,48px 48px,100% 100%;
        }

        .header{
          position:absolute;
          top:20px;
          left:20px;
          right:20px;

          display:flex;
          justify-content:space-between;
          align-items:center;

          padding:18px 28px;

          background:rgba(17,24,39,.75);
          border:1px solid rgba(0,255,255,.2);

          backdrop-filter:blur(10px);
          z-index:20;
        }

        .title{
          color:#3cf6ff;
          font-size:2rem;
          font-weight:800;
          text-shadow:0 0 18px rgba(60,246,255,.8);
        }

        .progress{
          color:#9ca3af;
          font-size:1rem;
          margin-left:20px;
        }

        .hearts{
          font-size:2rem;
        }

        .battle-zone{
          position:absolute;
          top:120px;
          left:0;
          right:0;
          height:320px;
        }

        .laptop-wrap{
          position:absolute;
          left:8vw;
          top:50%;

          transform:translateY(-50%);
          width:360px;
        }

        .laptop{
          width:100%;
          object-fit:contain;

          filter:drop-shadow(0 0 30px rgba(0,255,255,.45));
        }

        .virus-wrap{
          position:absolute;
          left:0;
          right:0;
          top:50%;

          transform:translateY(-50%);
          height:220px;
          overflow:visible;
        }

        .virus{
          position:absolute;
          width:180px;

          filter:
            drop-shadow(0 0 25px #ff00ff)
            drop-shadow(0 0 50px rgba(255,0,255,.5));
        }

        .question-zone{
          position:absolute;
          bottom:40px;
          left:50%;

          transform:translateX(-50%);
          width:min(1000px,90vw);
        }

        .question{
          text-align:center;
          color:white;

          font-size:2rem;
          font-weight:700;

          margin-bottom:28px;
          line-height:1.4;
        }

        .answers{
          display:grid;
          grid-template-columns:repeat(2,1fr);
          gap:18px;
        }

        .answer-btn{
          min-height:80px;

          border:none;
          border-radius:18px;

          background:rgba(20,36,70,.95);

          color:white;
          font-size:1.1rem;
          font-weight:600;

          border:2px solid rgba(0,255,255,.15);

          cursor:pointer;
          transition:.25s;
        }

        .answer-btn:hover{
          transform:translateY(-4px);

          border-color:#22d3ee;

          box-shadow:0 0 24px rgba(34,211,238,.4);
        }

        @media(max-width:768px){

          .laptop-wrap{
            width:230px;
            left:4vw;
          }

          .virus{
            width:120px;
          }

          .question{
            font-size:1.4rem;
          }

          .answers{
            grid-template-columns:1fr;
          }
        }
      `}</style>

            <div className="game">
                <div className="header">
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <div className="title">FINAL MISSION</div>

                        <div className="progress">
                            {current + 1} / {questions.length}
                        </div>
                    </div>

                    <div className="hearts">
                        {"❤️".repeat(hearts)}
                    </div>
                </div>

                <div className="battle-zone">
                    <div className="laptop-wrap">
                        <motion.img
                            key={screenState}
                            src={laptopImage}
                            alt=""
                            className="laptop"
                            animate={
                                screenState === "warning"
                                    ? { x: [-10, 10, -10, 10, 0] }
                                    : { scale: [1, 1.03, 1] }
                            }
                            transition={{ duration: 0.5 }}
                        />
                    </div>

                    <div className="virus-wrap">
                        <motion.img
                            key={virusKey}
                            src={virusImg}
                            alt=""
                            className="virus"
                            initial={{
                                x: 1200, // จุดเริ่มต้นฝั่งขวา
                            }}
                            animate={{
                                x: virusAttack ? "18vw" : "50vw", // จุดสิ้นสุดใกล้คอม
                            }}
                            transition={{
                                duration: virusAttack ? 0.8 : 5,
                                ease: "linear",
                            }}
                        />
                    </div>
                </div>

                <div className="question-zone">
                    <div className="question">
                        {questions[current].question}
                    </div>

                    <div className="answers">
                        {questions[current].choices.map((choice, index) => (
                            <button
                                key={index}
                                className="answer-btn"
                                onClick={() => handleAnswer(index)}
                            >
                                {choice}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}