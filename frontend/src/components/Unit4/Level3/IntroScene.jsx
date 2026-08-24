import { useState, useEffect } from "react";
import {
  RiAlarmWarningFill,
  RiShieldFlashFill,
} from "react-icons/ri";

import {
  FaServer,
  FaLock,
  FaCheckCircle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

import roomBg from "../../../assets/unit4/bor.jpg";
import janeImg from "../../../assets/unit4/Jane.png";

export default function CompanyIntro() {
  const navigate = useNavigate();

  const [showTutorial, setShowTutorial] = useState(false);

  const fullText = `ขอบคุณที่รีบมานะ !!!

ตอนนี้บริษัทกำลังถูกโจมตีจากมิจฉาชีพหลายรูปแบบพร้อมกัน ทั้งสลิปปลอม ลิงก์ดูดเงิน ข่าวปลอม และโฆษณาพนันออนไลน์

ความรู้ที่คุณได้เรียนรู้จากภารกิจก่อนหน้านี้ กำลังจะถูกนำมาใช้จริง

เราต้องสร้าง Firewall เพื่อปกป้องฐานข้อมูลของบริษัท และหยุดการโจมตีครั้งนี้ให้ได้`;

  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let index = 0;

    const typing = setInterval(() => {
      setDisplayText(fullText.slice(0, index));

      index++;

      if (index > fullText.length) {
        clearInterval(typing);
      }
    }, 30);

    return () => clearInterval(typing);
  }, []);

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .company-container {
          width: 100vw;
          height: 100vh;
          position: relative;
          overflow: hidden;
          font-family: sans-serif;
          background: url(${roomBg}) center/cover no-repeat;
        }

        .overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
        }

        .dialog-container {
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          padding: 24px;
          z-index: 2;
        }

        .tutorial-overlay {
          position: absolute;
          inset: 0;
          z-index: 20;

          display: flex;
          justify-content: center;
          align-items: center;

          background: rgba(0, 0, 0, 0.82);
          backdrop-filter: blur(8px);
        }

        .tutorial-box {
  position: relative;
  width: min(900px, 92vw);
  padding: 60px;
  border-radius: 30px;

  background:
    linear-gradient(
      180deg,
      rgba(4,10,30,.97),
      rgba(6,15,40,.95)
    );

  border: 1px solid rgba(0,229,255,.18);

  backdrop-filter: blur(20px);

  overflow: hidden;

  box-shadow:
    0 0 30px rgba(0,229,255,.15),
    0 0 100px rgba(0,229,255,.08),
    0 0 150px rgba(139,92,246,.1);
}

.tutorial-box::before{
  content:"";
  position:absolute;
  top:0;
  left:0;

  width:100%;
  height:3px;

  background:
    linear-gradient(
      90deg,
      #00e5ff,
      #8b5cf6,
      #00e5ff
    );
}

.tutorial-content{
  text-align:center;
  color:white;
}

.threat-badge{
  display:inline-flex;
  align-items:center;
  gap:10px;

  padding:10px 22px;

  border-radius:999px;

  background:
    rgba(255,0,70,.12);

  border:
    1px solid rgba(255,0,70,.35);

  color:#ff4f72;

  font-size:15px;
  font-weight:700;

  letter-spacing:2px;

  margin-bottom:30px;

  box-shadow:
    0 0 25px rgba(255,0,70,.25);
}

.tutorial-title{
  font-size:72px;
  font-weight:900;

  line-height:1;

  color:#57e7ff;

  letter-spacing:4px;

  margin-bottom:10px;

  text-shadow:
    0 0 15px #57e7ff,
    0 0 35px rgba(87,231,255,.8);
}

.mission-name{
  color:#d4b6ff;

  font-size:28px;
  font-weight:600;

  margin-bottom:35px;
}

.mission-divider{
  width:120px;
  height:4px;

  margin:0 auto 40px;

  border-radius:999px;

  background:
    linear-gradient(
      90deg,
      #00e5ff,
      #8b5cf6
    );
}

.mission-grid{
  display:grid;

  grid-template-columns:
    repeat(2,1fr);

  gap:18px;

  margin-bottom:45px;
}

.mission-card{
  display:flex;
  align-items:center;

  gap:14px;

  padding:18px;

  text-align:left;

  border-radius:16px;

  background:
    rgba(255,255,255,.04);

  border:
    1px solid rgba(255,255,255,.08);

  transition:.25s;
}

.mission-card:hover{
  transform:translateY(-4px);

  border-color:
    rgba(0,229,255,.3);

  box-shadow:
    0 0 20px rgba(0,229,255,.15);
}

.mission-icon{
  width:48px;
  height:48px;

  display:flex;
  align-items:center;
  justify-content:center;

  border-radius:12px;

  background:
    linear-gradient(
      135deg,
      #00e5ff,
      #8b5cf6
    );

  font-size:22px;

  flex-shrink:0;
}

.mission-card span{
  font-size:18px;
  font-weight:500;
}

.start-button{
  border:none;

  border-radius:16px;

  padding:18px 60px;

  cursor:pointer;

  font-size:22px;
  font-weight:800;

  color:white;

  background:
    linear-gradient(
      90deg,
      #00d9ff,
      #8b5cf6
    );

  box-shadow:
    0 0 25px rgba(0,229,255,.45),
    0 0 70px rgba(139,92,246,.25);

  transition:.25s;
}

.start-button:hover{
  transform:
    translateY(-4px)
    scale(1.03);

  box-shadow:
    0 0 35px rgba(0,229,255,.65),
    0 0 90px rgba(139,92,246,.35);
}

        @media (max-width: 768px) {
          .tutorial-box {
            width: 92vw;
            padding: 36px 24px;
          }

          .tutorial-title {
            font-size: 34px;
          }

          .tutorial-subtitle {
            font-size: 24px;
            margin-bottom: 24px;
          }

          .tutorial-list {
            font-size: 17px;
            line-height: 1.45;
          }

          .tutorial-list li {
            margin-bottom: 12px;
          }

          .start-button {
            width: 100%;
            font-size: 18px;
            padding: 14px;
          }
        }
      `}</style>

      <div className="company-container">
        <div className="overlay" />

        <div className="dialog-container">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              position: "relative",
              width: "100%",
              minHeight: "260px",
              padding: "24px",

              background: "rgba(15,20,35,.92)",
              backdropFilter: "blur(8px)",

              border: "2px solid rgba(0,255,255,.35)",
              borderRadius: "24px",

              boxShadow: "0 0 30px rgba(0,255,255,.15)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "20px",
                left: "20px",
                width: "120px",
              }}
            >
              <img
                src={janeImg}
                alt="พี่เจน"
                style={{
                  width: "100%",
                  display: "block",
                }}
              />
            </div>

            <div
              style={{
                marginLeft: "150px",
                paddingRight: "160px",
                color: "white",
              }}
            >
              <div
                style={{
                  color: "#53f3ff",
                  fontSize: "28px",
                  fontWeight: "bold",
                  marginBottom: "12px",
                }}
              >
                พี่เจน
              </div>

              <div
                style={{
                  fontSize: "19px",
                  lineHeight: "1",
                  whiteSpace: "pre-line",
                  color: "#e6e6e6",
                  minHeight: "150px",
                }}
              >
                {displayText}

                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                  }}
                >
                  |
                </motion.span>
              </div>
            </div>

            <button
              onClick={() => setShowTutorial(true)}
              disabled={displayText.length !== fullText.length}
              style={{
                position: "absolute",
                right: "24px",
                bottom: "24px",

                padding: "14px 32px",

                border: "none",
                borderRadius: "12px",

                background:
                  "linear-gradient(90deg,#00e5ff,#8b5cf6)",

                color: "white",
                fontSize: "18px",
                fontWeight: "bold",

                cursor:
                  displayText.length === fullText.length
                    ? "pointer"
                    : "not-allowed",

                opacity:
                  displayText.length === fullText.length
                    ? 1
                    : 0.5,

                transition: ".2s",
              }}
            >
              รับภารกิจ
            </button>
          </motion.div>
        </div>

        <AnimatePresence>
          {showTutorial && (
            <motion.div
              className="tutorial-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="tutorial-box"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="corner corner-tl" />
                <div className="corner corner-tr" />
                <div className="corner corner-bl" />
                <div className="corner corner-br" />

                <div className="tutorial-content">

                  <div className="threat-badge">
                    <RiAlarmWarningFill size={18} />
                    THREAT LEVEL : CRITICAL
                  </div>

                  <h1 className="tutorial-title">
                    FINAL MISSION
                  </h1>

                  <div className="mission-name">
                    Firewall Defender
                  </div>

                  <div className="mission-divider" />

                  <div className="mission-grid">

                    <div className="mission-card">
                      <div className="mission-icon">
                        <RiShieldFlashFill />
                      </div>
                      <span>
                        ตอบคำถามด้าน Cyber Security
                      </span>
                    </div>

                    <div className="mission-card">
                      <div className="mission-icon">
                        <FaCheckCircle />
                      </div>
                      <span>
                        ตอบถูกเพื่ออัปเกรด Firewall
                      </span>
                    </div>

                    <div className="mission-card">
                      <div className="mission-icon">
                        <FaServer />
                      </div>
                      <span>
                        ตอบผิด Server จะเสีย HP
                      </span>
                    </div>

                    <div className="mission-card">
                      <div className="mission-icon">
                        <FaLock />
                      </div>
                      <span>
                        ปกป้องฐานข้อมูลของบริษัท
                      </span>
                    </div>

                  </div>

                  <button
                    className="start-button"
                    onClick={() =>
                      navigate("/unit4/level3/game")
                    }
                  >
                    ⚡ เริ่มป้องกันระบบ
                  </button>

                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}