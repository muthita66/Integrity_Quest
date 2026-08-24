import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import Confetti from "react-confetti";

import rankS from "../../../assets/unit4/s.png";
import rankA from "../../../assets/unit4/a.png";
import rankB from "../../../assets/unit4/b.png";
import rankC from "../../../assets/unit4/c.png";
import rankD from "../../../assets/unit4/d.png";

import {
  FaShieldAlt,
  FaRedoAlt,
  FaHome,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

import { RiHeartPulseFill } from "react-icons/ri";
export default function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    score = 0,
    hp = 0,
    correctAnswers = 0,
    wrongAnswers = 0,
  } = location.state || {};

  const getRank = () => {
    if (score >= 90) {
      return {
        color: "#FFD700",
        image: rankS,
        message: "สุดยอด! คุณสามารถปกป้องบริษัทได้อย่างสมบูรณ์",
      };
    }

    if (score >= 80) {
      return {
        color: "#C084FC",
        image: rankA,
        message: "ยอดเยี่ยม! ระบบปลอดภัยจากการโจมตี",
      };
    }

    if (score >= 70) {
      return {
        color: "#60A5FA",
        image: rankB,
        message: "ดีมาก แต่ยังมีจุดที่ควรระวัง",
      };
    }

    if (score >= 60) {
      return {
        color: "#34D399",
        image: rankC,
        message: "ผ่านภารกิจ แต่ควรทบทวนความรู้เพิ่มเติม",
      };
    }

    return {
      color: "#9CA3AF",
      image: rankD,
      message: "ระบบถูกโจมตีสำเร็จ",
    };
  };

  const { color, image, message } = getRank();

  return (
    <>
      {score >= 80 && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={250}
        />
      )}

      <style>{`
        *{
          box-sizing:border-box;
          margin:0;
          padding:0;
        }

        body{
          overflow-x:hidden;
        }

        .result-container{
          min-height:100vh;
          padding:50px 24px;

          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;

          color:white;

          position:relative;
          overflow:hidden;

          background:
            linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px),
            radial-gradient(circle at top, #18386a, #08111f 60%, #02050d);

          background-size:
            30px 30px,
            30px 30px,
            cover;
        }

        .result-container::before,
        .result-container::after{
          content:"";
          position:absolute;
          border-radius:50%;
          filter:blur(180px);
          z-index:0;
        }

        .result-container::before{
          width:700px;
          height:700px;

          background:rgba(87,231,255,.12);

          top:-250px;
          left:50%;

          transform:translateX(-50%);
        }

        .result-container::after{
          width:450px;
          height:450px;

          background:rgba(139,92,246,.12);

          bottom:-200px;
          right:-100px;
        }

        .hero-section{
  width:min(520px,95vw);

  padding:20px 24px;

  display:flex;
  flex-direction:column;
  align-items:center;

  text-align:center;

  z-index:2;
  margin-bottom:40px;

  border-radius:32px;

  background:linear-gradient(
    145deg,
    rgba(255,255,255,.08),
    rgba(255,255,255,.03)
  );

  border:1px solid rgba(255,255,255,.1);

  backdrop-filter:blur(24px);

  box-shadow:
    0 20px 60px rgba(0,0,0,.3),
    inset 0 1px 1px rgba(255,255,255,.05);
}

        .rank-label{
          color:#94a3b8;
          font-size:14px;
          letter-spacing:4px;
          font-weight:700;
          margin-bottom:24px;
        }

        .rank-image{
  width:220px;
  height:220px;

  display:block;

  object-fit:contain;

  margin:0 auto 24px;

  filter:drop-shadow(0 0 30px ${color});
}

        .rank-message{
          font-size:18px;
          color:#cbd5e1;
          line-height:1.7;
          margin-bottom:28px;
        }

        .progress-bar{
          width:100%;
          height:14px;

          background:rgba(255,255,255,.08);

          border-radius:999px;
          overflow:hidden;

          border:1px solid rgba(255,255,255,.08);
        }

        .progress-fill{
          height:100%;
          width:${score}%;

          border-radius:999px;

          background:linear-gradient(
            90deg,
            ${color},
            #57e7ff
          );

          box-shadow:0 0 20px ${color};

          transition:width 1s ease;
        }

        .score-text{
          margin-top:16px;

          color:#e2e8f0;
          font-size:18px;
          font-weight:700;
        }

        .stats-grid{
  width:min(900px,95vw);

  display:grid;

  grid-template-columns:repeat(4,1fr);

  gap:20px;

  margin-bottom:40px;

  z-index:2;
}

        .stat-card{
          padding:30px 24px;

          text-align:center;

          border-radius:28px;

          background:linear-gradient(
            145deg,
            rgba(255,255,255,.08),
            rgba(255,255,255,.03)
          );

          border:1px solid rgba(255,255,255,.08);

          backdrop-filter:blur(20px);

          transition:.3s;

          box-shadow:
            inset 0 1px 1px rgba(255,255,255,.05),
            0 8px 32px rgba(0,0,0,.25);
        }

        .stat-card:hover{
          transform:translateY(-10px);

          box-shadow:
            0 0 35px rgba(87,231,255,.18);
        }

        .stat-card svg{
          font-size:30px;
          margin-bottom:16px;
          color:#57e7ff;
        }
        .correct-card svg{
  color:#22c55e;
}

.correct-card{
  border-color:rgba(34,197,94,.25);
}

.correct-card:hover{
  box-shadow:0 0 35px rgba(34,197,94,.25);
}

.wrong-card svg{
  color:#ef4444;
}

.wrong-card{
  border-color:rgba(239,68,68,.25);
}

.wrong-card:hover{
  box-shadow:0 0 35px rgba(239,68,68,.25);
}

        .stat-card h3{
          font-size:42px;
          margin-bottom:10px;
          font-weight:800;
        }

        .stat-card p{
          color:#cbd5e1;
          font-size:17px;
        }

        .result-buttons{
          display:flex;
          gap:24px;
          z-index:2;
        }

        .btn{
          min-width:230px;
          height:72px;

          border:none;
          border-radius:20px;

          color:white;

          font-size:20px;
          font-weight:700;

          cursor:pointer;

          display:flex;
          justify-content:center;
          align-items:center;
          gap:12px;

          transition:.3s;
        }

        .btn:hover{
          transform:
            translateY(-5px)
            scale(1.03);
        }

        .retry-btn{
          background:linear-gradient(
            135deg,
            #00d4ff,
            #8b5cf6
          );

          box-shadow:
            0 0 30px rgba(0,212,255,.35);
        }

        .home-btn{
          background:linear-gradient(
            135deg,
            #ff7a45,
            #ffb347
          );

          box-shadow:
            0 0 30px rgba(255,122,69,.35);
        }

        @media(max-width:768px){

  .rank-image{
    width:170px;
    height:170px;
  }

  .stats-grid{
    grid-template-columns:repeat(2,1fr);
  }

  .result-buttons{
    flex-direction:column;
    width:100%;
    max-width:320px;
  }

  .btn{
    width:100%;
  }
}

@media(max-width:480px){

  .stats-grid{
    grid-template-columns:1fr;
  }
}
      `}</style>

      <div className="result-container">
        <motion.div
          className="hero-section"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="rank-label">
            YOUR REWARD
          </p>

          <img
            src={image}
            alt="reward"
            className="rank-image"
          />

          <p className="rank-message">
            {message}
          </p>

          <div className="progress-bar">
            <div className="progress-fill" />
          </div>

          <p className="score-text">
            คะแนนรวม {score}/100
          </p>
        </motion.div>

        <motion.div
          className="stats-grid"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="stat-card">
            <RiHeartPulseFill />

            <h3>{hp}%</h3>

            <p>Server HP</p>
          </div>

          <div className="stat-card">
            <FaShieldAlt />

            <h3>MAX</h3>

            <p>Firewall</p>
          </div>

          <div className="stat-card correct-card">
            <FaCheckCircle />

            <h3>{correctAnswers}</h3>

            <p>ตอบถูก</p>
          </div>

          <div className="stat-card wrong-card">
            <FaTimesCircle />

            <h3>{wrongAnswers}</h3>

            <p>ตอบผิด</p>
          </div>
        </motion.div>

        <div className="result-buttons">
          <button
            className="btn retry-btn"
            onClick={() => navigate("/unit4/finalMission")}
          >
            <FaRedoAlt />
            เล่นอีกครั้ง
          </button>

          <button
            className="btn home-btn"
            onClick={() => navigate("/map")}
          >
            <FaHome />
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    </>
  );
}