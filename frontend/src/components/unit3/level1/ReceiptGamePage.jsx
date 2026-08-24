import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import bgGame1 from "../../../assets/unit3/level1/bgGame1.png";

import DocumentCard from "./components/DocumentCard";
import GameBoard from "./components/GameBoard";
import GameHeader from "./components/GameHeader";
import MessagePopup from "./components/MessagePopup";
import PauseModal from "./components/PauseModal";
import ResultModel from "./components/ResultModel";
import TaskBox from "./components/TaskBox";

const INITIAL_TIME = 60;
const MAX_WRONG = 3;

// โหลดรูปทั้งโฟลเดอร์อัตโนมัติ — มีรูปเพิ่มแค่โยนไฟล์ใส่โฟลเดอร์ ไม่ต้องแก้โค้ดตรงนี้
// { eager: true } = โหลดทันทีตอน build (import.meta.glob เป็นฟีเจอร์ของ Vite)
const goodImageModules = import.meta.glob(
    "../../../assets/unit3/level1/good/*.{png,jpg,jpeg,webp}",
    { eager: true }
);
const badImageModules = import.meta.glob(
    "../../../assets/unit3/level1/bad/*.{png,jpg,jpeg,webp}",
    { eager: true }
);

// map path -> ชื่อไฟล์ (ไม่รวมนามสกุล) เพื่อใช้เป็น key อ้างอิงรูป
function toImageMap(modules) {
    return Object.fromEntries(
        Object.entries(modules).map(([path, mod]) => {
            const fileName = path.split("/").pop().replace(/\.[^/.]+$/, "");
            return [fileName, mod.default];
        })
    );
}

const GOOD_IMAGE_MAP = toImageMap(goodImageModules);
const BAD_IMAGE_MAP = toImageMap(badImageModules);

// DEBUG: ลบบล็อกนี้ออกได้หลังแก้ปัญหารูปไม่ขึ้นเรียบร้อยแล้ว
if (import.meta.env.DEV) {
    console.log("[debug] good images found:", Object.keys(GOOD_IMAGE_MAP));
    console.log("[debug] bad images found:", Object.keys(BAD_IMAGE_MAP));

    if (Object.keys(GOOD_IMAGE_MAP).length === 0) {
        console.warn("[debug] ไม่พบไฟล์รูปในโฟลเดอร์ good/ เลย — เช็ค path");
    }
    if (Object.keys(BAD_IMAGE_MAP).length === 0) {
        console.warn("[debug] ไม่พบไฟล์รูปในโฟลเดอร์ bad/ เลย — เช็ค path");
    }
}

// ป้ายชื่อรูปที่ถูก (ไทย) ต่อ key — ไฟล์ไหนไม่ได้ระบุไว้ จะใช้ชื่อไฟล์แทนชั่วคราว
// TODO: ถ้ามีไฟล์สำหรับ "ใบกำกับภาษี" / "ใบสำคัญรับเงิน" แยกต่างหาก ให้เพิ่ม key นั้นที่นี่
const GOOD_LABELS = {
    cash1: "ใบเสร็จรับเงิน",
    cash2: "ใบเสร็จรับเงิน",
    cash3: "ใบเสร็จรับเงิน",
    cash4: "ใบเสร็จรับเงิน",
    cash5: "ใบเสร็จรับเงิน",
    receipt2: "ใบเสร็จรับเงิน",
};

// รูปที่ถูก — สร้างอัตโนมัติจากทุกไฟล์ในโฟลเดอร์ good/
// แต่ละรอบการันตีว่าทุกไฟล์ (ทุก "ประเภท") ต้องปรากฏอย่างน้อย 1 ครั้ง
const GOOD_TYPES = Object.entries(GOOD_IMAGE_MAP).map(([key, image]) => ({
    key,
    label: GOOD_LABELS[key] ?? key,
    image,
}));

// ป้ายชื่อรูปที่ผิด (ไทย) ต่อ key — ถ้าเพิ่มไฟล์ใหม่ในโฟลเดอร์ bad/ มาเติมป้ายชื่อที่นี่บรรทัดเดียว
const BAD_LABELS = {
    clubSchool1: "กิจกรรมชมรม",
    clubSchool2: "กิจกรรมชมรม",
    coffeeBill1: "บิลค่ากาแฟ",
    coffeeBill2: "บิลค่ากาแฟ",
    homework: "การบ้าน",
    minimart: "ใบเสร็จร้านสะดวกซื้อ",
    Notepad: "สมุดจด",
    payPalShipping: "ใบเสร็จค่าส่งของออนไลน์",
    pubbles: "กระดาษเปล่า",
    timetable: "ตารางเรียน",
};

// รูปที่ผิด — สร้างอัตโนมัติจากทุกไฟล์ในโฟลเดอร์ bad/ สุ่มออกมาได้อิสระ ไม่ต้องครบทุกแบบ
const BAD_TYPES = Object.entries(BAD_IMAGE_MAP).map(([key, image]) => ({
    key,
    label: BAD_LABELS[key] ?? key,
    image,
}));

// ตำแหน่งบนกระดาน: รวมเป็น pool เดียว 13 ช่อง (8 สำหรับรูปถูก + 5 สำหรับรูปผิด)
// แต่ละรอบจะสุ่มแจกตำแหน่งเหล่านี้ใหม่ ไม่ตายตัวว่าช่องไหนต้องเป็นถูก/ผิดเสมอ
const ALL_POSITIONS = [
    { x: "18%", y: "25%" },
    { x: "42%", y: "18%" },
    { x: "70%", y: "27%" },
    { x: "28%", y: "60%" },
    { x: "55%", y: "65%" },
    { x: "75%", y: "58%" },
    { x: "15%", y: "72%" },
    { x: "46%", y: "43%" },
    { x: "33%", y: "38%" },
    { x: "63%", y: "45%" },
    { x: "58%", y: "22%" },
    { x: "37%", y: "78%" },
    { x: "82%", y: "72%" },
];

const GOOD_COUNT = 8;

const TOTAL_DOCUMENTS = GOOD_COUNT;

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function pickRandom(pool) {
    return pool[Math.floor(Math.random() * pool.length)];
}

// สร้างชุดเอกสารใหม่สำหรับหนึ่งรอบการเล่น
function generateRound() {
    // สุ่มตำแหน่งใหม่ทั้งกระดานทุกรอบ
    const shuffledPositions = shuffleArray(ALL_POSITIONS);
    const goodPositions = shuffledPositions.slice(0, GOOD_COUNT);
    const badPositions = shuffledPositions.slice(GOOD_COUNT);

    // การันตีว่าทุกประเภทของรูปถูกปรากฏอย่างน้อย 1 ครั้งก่อน (ถ้ามีมากกว่าจำนวนช่อง จะสุ่มเลือกมาแค่เท่าจำนวนช่อง)
    const shuffledTypes = shuffleArray(GOOD_TYPES);
    const guaranteed = shuffledTypes.slice(0, goodPositions.length);
    const extraCount = Math.max(0, goodPositions.length - guaranteed.length);
    const extras = Array.from({ length: extraCount }, () => pickRandom(GOOD_TYPES));
    const goodPool = shuffleArray([...guaranteed, ...extras]);

    const goodDocs = goodPositions.map((pos, i) => ({
        id: `good-${i}`,
        type: "good",
        ...pos,
        ...goodPool[i],
    }));

    // รูปผิดสุ่มอิสระ ไม่ต้องครบทุกแบบ
    const badDocs = badPositions.map((pos, i) => ({
        id: `bad-${i}`,
        type: "bad",
        ...pos,
        ...pickRandom(BAD_TYPES),
    }));

    return shuffleArray([...goodDocs, ...badDocs]);
}

export default function ReceiptGamePage() {
    const navigate = useNavigate();
    const messageTimerRef = useRef(null);

    const [documents, setDocuments] = useState(() => generateRound());
    const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
    const [found, setFound] = useState([]);
    const [wrong, setWrong] = useState(0);
    const [message, setMessage] = useState("");
    const [gameStatus, setGameStatus] = useState("playing");
    const [isPaused, setIsPaused] = useState(false);

    const foundCount = found.length;

    useEffect(() => {
        if (gameStatus !== "playing" || isPaused) return undefined;

        const timer = window.setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    window.clearInterval(timer);
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => {
            window.clearInterval(timer);
        };
    }, [gameStatus, isPaused]);

    useEffect(() => {
        if (timeLeft === 0 && gameStatus === "playing") {
            setGameStatus("lose");
        }
    }, [timeLeft, gameStatus]);
    useEffect(() => {
        if (gameStatus !== "playing") return;

        if (foundCount >= TOTAL_DOCUMENTS) {
            setGameStatus("win");

            navigate("/unit3/level1/result", {
                state: {
                    found: foundCount,
                    wrong,
                    timeLeft,
                },
            });

            return;
        }

        if (wrong >= MAX_WRONG) {
            setGameStatus("lose");
        }
    }, [
        foundCount,
        wrong,
        timeLeft,
        gameStatus,
        navigate,
    ]);

    useEffect(() => {
        return () => {
            if (messageTimerRef.current) {
                window.clearTimeout(messageTimerRef.current);
            }
        };
    }, []);

    const showMessage = (text) => {
        setMessage(text);

        if (messageTimerRef.current) {
            window.clearTimeout(messageTimerRef.current);
        }

        messageTimerRef.current = window.setTimeout(() => {
            setMessage("");
        }, 1200);
    };

    const handleClickDoc = (doc) => {
        if (gameStatus !== "playing" || isPaused) return;

        if (doc.type === "good" && found.includes(doc.id)) {
            return;
        }

        if (doc.type === "good") {
            setFound((prev) => [...prev, doc.id]);
            showMessage(`พบ ${doc.label} แล้ว!`);
        } else {
            setWrong((prev) => prev + 1);
            showMessage("นี่ไม่ใช่เอกสารการเงิน");
        }
    };

    const restartGame = () => {
        if (messageTimerRef.current) {
            window.clearTimeout(messageTimerRef.current);
        }

        setDocuments(generateRound());
        setTimeLeft(INITIAL_TIME);
        setFound([]);
        setWrong(0);
        setMessage("");
        setGameStatus("playing");
        setIsPaused(false);
    };

    const handlePause = () => {
        if (gameStatus !== "playing") return;

        setIsPaused(true);
    };

    const handleResume = () => {
        setIsPaused(false);
    };

    const handleBackToMap = () => {
        navigate("/map");
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
            {/* Background */}
            <img
                src={bgGame1}
                alt=""
                className="absolute inset-0 z-0 h-full w-full object-cover"
            />

            {/* White Overlay */}
            <div className="absolute inset-0 z-0 bg-white/70" />

            <GameBoard>
                {/* Top UI */}
                <GameHeader
                    foundCount={foundCount}
                    totalDocuments={TOTAL_DOCUMENTS}
                    wrong={wrong}
                    maxWrong={MAX_WRONG}
                    timeLeft={timeLeft}
                    onPause={handlePause}
                    onExit={handleBackToMap}
                />

                {/* Documents */}
                {documents.map((doc) => {
                    const isFound = found.includes(doc.id);

                    return (
                        <DocumentCard
                            key={doc.id}
                            doc={doc}
                            isFound={isFound}
                            handleClickDoc={handleClickDoc}
                        />
                    );
                })}

                <TaskBox />

                {/* Pause Modal */}
                <PauseModal
                    isOpen={isPaused}
                    onResume={handleResume}
                    onRestart={restartGame}
                    onExit={handleBackToMap}
                />

                {/* Result Modal */}
                <ResultModel
                    gameStatus={gameStatus}
                    restartGame={restartGame}
                />
            </GameBoard>
        </div>
    );
}
