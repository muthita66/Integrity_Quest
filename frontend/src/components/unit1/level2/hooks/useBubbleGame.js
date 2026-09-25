import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import bubble1 from "../../../../assets/unit1/level2/bubble1.jpg";
import bubble2 from "../../../../assets/unit1/level2/bubble2.jpg";
import bubblePopSound from "../../../../assets/sounds/bubble_pop.mp3";

import useParticles from "./useParticles";

// Game Constants
const SCORE_PER_BAD_BUBBLE = 5;

const bubbleImages = [
    bubble1,
    bubble2,
];


// Shuffle
const shuffleArray = (array) => {
    return [...array].sort(
        () => Math.random() - 0.5
    );
};


// Generate Bubble Positions
const generateBalancedPositions = () => {
    const grid = [
        {
            minX: 5,
            maxX: 20,
            minY: 15,
            maxY: 25,
        },

        {
            minX: 25,
            maxX: 35,
            minY: 20,
            maxY: 30,
        },

        {
            minX: 65,
            maxX: 75,
            minY: 20,
            maxY: 30,
        },

        {
            minX: 80,
            maxX: 90,
            minY: 15,
            maxY: 25,
        },

        {
            minX: 5,
            maxX: 20,
            minY: 40,
            maxY: 50,
        },

        {
            minX: 30,
            maxX: 45,
            minY: 45,
            maxY: 55,
        },

        {
            minX: 55,
            maxX: 70,
            minY: 45,
            maxY: 55,
        },

        {
            minX: 80,
            maxX: 90,
            minY: 40,
            maxY: 50,
        },

        {
            minX: 10,
            maxX: 25,
            minY: 65,
            maxY: 75,
        },

        {
            minX: 35,
            maxX: 45,
            minY: 70,
            maxY: 80,
        },

        {
            minX: 55,
            maxX: 65,
            minY: 70,
            maxY: 80,
        },

        {
            minX: 75,
            maxX: 85,
            minY: 65,
            maxY: 75,
        },
    ];

    const positions = grid.map((cell) => ({
        x:
            cell.minX +
            Math.random() *
            (cell.maxX - cell.minX),

        y:
            cell.minY +
            Math.random() *
            (cell.maxY - cell.minY),
    }));

    return shuffleArray(positions);
};

const formatBubbles = (baseBubbles) => {
    if (
        !baseBubbles || baseBubbles.length === 0
    ) {
        return [];
    }

    const positions = generateBalancedPositions();

    return baseBubbles.map(
        (bubble, index) => ({
            id: bubble.bubble_id,

            playBubbleId:
                bubble.play_bubble_id,

            text:
                bubble.bubble_text,

            type: String(
                bubble.bubble_type || ""
            )
                .trim()
                .toLowerCase(),

            // รูปภาพ
            image:
                bubbleImages[
                Math.floor(
                    Math.random() *
                    bubbleImages.length
                )
                ],

            // ตำแหน่ง
            x:
                positions[index]?.x ?? 50,

            y:
                positions[index]?.y ?? 50,

            // Animation
            moveX:
                (Math.random() - 0.5) *
                40,

            moveY:
                (Math.random() - 0.5) *
                40,

            duration:
                Math.random() * 2 + 3,
        })
    );
};

// useBubbleGame
export default function useBubbleGame(
    levelId
) {
    const [baseBubbles, setBaseBubbles] = useState([]);
    const [bubbles, setBubbles] = useState([]);
    const [playId, setPlayId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [score, setScore] = useState(0);
    const [gameStatus, setGameStatus] = useState("playing");
    const [showBoss, setShowBoss] = useState(false);
    const popSoundRef = useRef(null);

    // เก็บ play_id ล่าสุดไว้ใน ref ด้วย เพื่อให้ restartGame() อ่านค่า
    // ล่าสุดได้เสมอ ไม่ติด stale closure จาก useCallback([levelId])
    const playIdRef = useRef(null);

    // กันเรียก startGame ซ้ำซ้อน (React StrictMode เรียก effect 2 รอบ
    // ตอน dev, หรือกดปุ่ม Retry ถี่ ๆ) ซึ่งเคยทำให้ Backend สร้าง
    // game_play_history ซ้ำเป็น 2 แถวจาก request ที่ยิงพร้อมกัน
    const isStartingRef = useRef(false);

    const {
        particles,
        createParticles,
        clearParticles,
    } = useParticles();

    const getToken = () => {
        return localStorage.getItem("token");
    };

    // Start Game
    const startGame = useCallback(
        async (retryPlayId = null) => {

            if (!levelId) {
                return;
            }

            // ถ้ากำลังเริ่มเกมอยู่ ไม่ให้เรียกซ้ำ
            if (isStartingRef.current) {
                return;
            }

            isStartingRef.current = true;

            try {

                setIsLoading(true);
                setError(null);

                const token = getToken();

                if (!token) {
                    throw new Error(
                        "ไม่พบ Token กรุณา Login ใหม่"
                    );
                }

                const response =
                    await fetch(
                        "http://localhost:5000/api/game-play/start",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                Authorization:
                                    `Bearer ${token}`,
                            },

                            body: JSON.stringify({
                                level_id:
                                    levelId,

                                ...(retryPlayId
                                    ? { play_id: retryPlayId }
                                    : {}),
                            }),
                        }
                    );

                if (!response.ok) {

                    const errorData =
                        await response
                            .json()
                            .catch(
                                () => ({})
                            );

                    throw new Error(
                        errorData.message ||
                        `ไม่สามารถเริ่มเกมได้ (${response.status})`
                    );
                }

                const result =
                    await response.json();

                console.log(
                    "เริ่ม Game Play:",
                    result
                );

                const gameData =
                    result.data;

                if (
                    !gameData ||
                    !gameData.play_id
                ) {
                    throw new Error(
                        "ข้อมูล Game Play ไม่ถูกต้อง"
                    );
                }

                setPlayId(gameData.play_id);
                playIdRef.current = gameData.play_id;

                const serverBubbles = gameData.bubbles || [];

                if (
                    serverBubbles.length === 0
                ) {
                    throw new Error(
                        "ไม่พบ Bubble สำหรับเกมนี้"
                    );
                }

                console.log(
                    "Bubble จาก Game Play:",
                    serverBubbles
                );

                setBaseBubbles(
                    serverBubbles
                );

                const formattedBubbles = formatBubbles(serverBubbles);

                setBubbles(
                    formattedBubbles
                );

                setScore(0);
                setGameStatus("playing");
                setShowBoss(false);

            } catch (err) {
                console.error("เริ่มเกมไม่สำเร็จ:", err);
                setError(err.message || "ไม่สามารถเริ่มเกมได้");

            } finally {
                setIsLoading(false);
                isStartingRef.current = false;
            }
        },
        [levelId]
    );

    useEffect(() => {
        startGame();
    }, [startGame]);

    const playPopSound = useCallback(() => {
        if (
            !popSoundRef.current
        ) {
            popSoundRef.current =
                new Audio(
                    bubblePopSound
                );
        }

        const audio = popSoundRef.current;

        audio.currentTime = 0;

        audio.play().catch(
            (error) => {
                console.warn("ไม่สามารถเล่นเสียงฟองได้:", error);
            }
        );

    }, []);

    const handleShoot =
        useCallback(
            async (bubble) => {
                if (
                    gameStatus !== "playing"
                ) {
                    return;
                }

                if (showBoss) {
                    return;
                }

                if (
                    !bubble.playBubbleId
                ) {

                    console.error(
                        "ไม่พบ playBubbleId:",
                        bubble
                    );

                    return;
                }

                playPopSound();

                createParticles(
                    bubble
                );

                try {

                    const token =
                        getToken();

                    if (!token) {
                        throw new Error(
                            "ไม่พบ Token กรุณา Login ใหม่"
                        );
                    }

                    const response =
                        await fetch(
                            "http://localhost:5000/api/game-play/bubble/shoot",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json",

                                    Authorization:
                                        `Bearer ${token}`,
                                },

                                body:
                                    JSON.stringify({
                                        play_bubble_id:
                                            bubble.playBubbleId,
                                    }),
                            }
                        );

                    const result =
                        await response
                            .json();

                    console.log("ผลการยิง Bubble:", result);

                    if (
                        !response.ok
                    ) {

                        throw new Error(
                            result.message || "ไม่สามารถบันทึกการยิง Bubble ได้"
                        );
                    }

                    const data = result.data;

                    // ยิงผิด
                    if (
                        data.game_status === "FAILED"
                    ) {

                        setBubbles(
                            (previousBubbles) =>
                                previousBubbles.filter(
                                    (item) =>
                                        item.id !== bubble.id
                                )
                        );

                        setGameStatus("lose");
                        return;
                    }

                    // ยิงถูก
                    // หมายเหตุ: Level 2 ไม่มี Score แล้ว (Backend ส่ง
                    // score: 0 เสมอ) ตัว Bubble แค่หายไปจากจอ ไม่ต้อง
                    // อัปเดต setScore จาก data.score อีกต่อไป
                    if (
                        data.is_correct ===
                        true
                    ) {

                        // เอา Bubble ออกจากหน้าจอ
                        setBubbles(
                            (previousBubbles) =>
                                previousBubbles.filter(
                                    (item) =>
                                        item.id !==
                                        bubble.id
                                )
                        );
                    }

                } catch (err) {

                    console.error(
                        "ยิง Bubble ไม่สำเร็จ:",
                        err
                    );

                    // ถ้า API ล้มเหลว
                    // ไม่เอา Bubble ออกจากเกม
                    setError(
                        err.message ||
                        "ไม่สามารถบันทึกการยิง Bubble ได้"
                    );
                }

            },
            [
                gameStatus,
                showBoss,
                playPopSound,
                createParticles,
            ]
        );

    // Restart Game
    const restartGame =
        useCallback(
            async () => {
                clearParticles();
                setBubbles([]);
                setScore(0);
                setGameStatus(
                    "playing"
                );
                setShowBoss(false);
                setError(null);

                // Retry ใช้ play_id เดิม ไม่สร้าง Game Play ใหม่
                // อ่านจาก ref เพื่อกัน stale closure
                await startGame(playIdRef.current);

            },
            [
                clearParticles,
                startGame,
            ]
        );

    // Boss สำเร็จ
    const finishBoss =
        useCallback(() => {
            setShowBoss(false);
            setGameStatus(
                "win"
            );

        }, []);

    // Boss ไม่ผ่าน
    const failBoss =
        useCallback(() => {
            restartGame();
        }, [restartGame]);

    // ตรวจสอบ Bubble
    useEffect(() => {

        if (
            gameStatus !==
            "playing"
        ) {
            return;
        }

        if (showBoss) {
            return;
        }

        // เปิด Boss เมื่อยิง Bad Bubble ครบแล้ว
        // Good Bubble ที่เหลือไม่ต้องยิง เพราะถ้ายิงจะทำให้แพ้
        const hasBadBubbles = bubbles.some(
            (bubble) => bubble.type === "bad"
        );

        if (
            !hasBadBubbles &&
            baseBubbles.length > 0
        ) {
            setShowBoss(true);
        }

    }, [
        bubbles,
        baseBubbles,
        gameStatus,
        showBoss,
    ]);

    // Return
    return {
        bubbles,
        score,
        gameStatus,
        showBoss,
        particles,
        isLoading,
        error,
        playId,
        handleShoot,
        restartGame,
        finishBoss,
        failBoss,
        startGame,
    };
}