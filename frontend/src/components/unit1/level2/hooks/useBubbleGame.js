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

const TOTAL_BUBBLES = 12;
const MIN_GOOD_BUBBLES = 4;
const MAX_GOOD_BUBBLES = 6;
const SCORE_PER_BAD_BUBBLE = 5;
const MINIMUM_BOSS_SCORE = 20;

const bubbleImages = [
    bubble1,
    bubble2,
];

const baseBubbles = [
    {
        id: 1,
        text: "ใครๆ ก็ทำกัน",
        type: "bad",
    },
    {
        id: 2,
        text: "ยืมก่อนเดี๋ยวคืน",
        type: "bad",
    },
    {
        id: 3,
        text: "ไม่มีใครรู้หรอก",
        type: "bad",
    },
    {
        id: 4,
        text: "ช่วยเพื่อนเฉยๆ",
        type: "bad",
    },
    {
        id: 5,
        text: "โกงนิดเดียวไม่เป็นไร",
        type: "bad",
    },
    {
        id: 6,
        text: "ครั้งเดียวเอง",
        type: "bad",
    },
    {
        id: 7,
        text: "คะแนนสำคัญกว่า",
        type: "bad",
    },
    {
        id: 8,
        text: "อาจารย์ไม่ตรวจหรอก",
        type: "bad",
    },
    {
        id: 9,
        text: "เพื่อนก็ลอกกันหมด",
        type: "bad",
    },
    {
        id: 10,
        text: "แค่ช่วยตอบคำถาม",
        type: "bad",
    },
    {
        id: 11,
        text: "เอาเปรียบนิดหน่อยเอง",
        type: "bad",
    },
    {
        id: 12,
        text: "ไม่มีคนเสียหาย",
        type: "bad",
    },
    {
        id: 13,
        text: "เรื่องเล็กน่า",
        type: "bad",
    },
    {
        id: 14,
        text: "ไม่โดนจับก็ไม่ผิด",
        type: "bad",
    },
    {
        id: 15,
        text: "ซื่อสัตย์ไว้ดีกว่า",
        type: "good",
    },
    {
        id: 16,
        text: "ทำถูกแม้ไม่มีคนเห็น",
        type: "good",
    },
    {
        id: 17,
        text: "ยอมเสียเปรียบดีกว่าโกง",
        type: "good",
    },
    {
        id: 18,
        text: "ความไว้วางใจสำคัญกว่า",
        type: "good",
    },
    {
        id: 19,
        text: "กล้ายอมรับความจริง",
        type: "good",
    },
    {
        id: 20,
        text: "ทำสิ่งที่ถูกต้องเสมอ",
        type: "good",
    },
];

const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
};

const generateBalancedPositions = () => {
    const grid = [
        // แถวบน
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

        // แถวกลาง
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

        // แถวล่าง
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
            Math.random() * (cell.maxX - cell.minX),
        y:
            cell.minY +
            Math.random() * (cell.maxY - cell.minY),
    }));

    return shuffleArray(positions);
};

const generateBubbles = () => {
    const goodBubbles = shuffleArray(
        baseBubbles.filter(
            (bubble) => bubble.type === "good"
        )
    );

    const badBubbles = shuffleArray(
        baseBubbles.filter(
            (bubble) => bubble.type === "bad"
        )
    );

    const goodRange =
        MAX_GOOD_BUBBLES - MIN_GOOD_BUBBLES + 1;

    const numberOfGoodBubbles =
        Math.floor(Math.random() * goodRange) +
        MIN_GOOD_BUBBLES;

    const numberOfBadBubbles =
        TOTAL_BUBBLES - numberOfGoodBubbles;

    const selectedBubbles = shuffleArray([
        ...goodBubbles.slice(0, numberOfGoodBubbles),
        ...badBubbles.slice(0, numberOfBadBubbles),
    ]);

    const positions = generateBalancedPositions();

    return selectedBubbles.map((bubble, index) => ({
        ...bubble,

        image:
            bubbleImages[
            Math.floor(
                Math.random() * bubbleImages.length
            )
            ],

        x: positions[index].x,
        y: positions[index].y,

        moveX: (Math.random() - 0.5) * 40,
        moveY: (Math.random() - 0.5) * 40,

        duration: Math.random() * 2 + 3,
    }));
};

export default function useBubbleGame() {
    const [bubbles, setBubbles] = useState(
        () => generateBubbles()
    );

    const [score, setScore] = useState(0);

    const [gameStatus, setGameStatus] =
        useState("playing");

    const [showBoss, setShowBoss] =
        useState(false);

    const popSoundRef = useRef(null);

    const {
        particles,
        createParticles,
        clearParticles,
    } = useParticles();

    const playPopSound = useCallback(() => {
        if (!popSoundRef.current) {
            popSoundRef.current =
                new Audio(bubblePopSound);
        }

        const audio = popSoundRef.current;

        audio.currentTime = 0;

        audio.play().catch((error) => {
            console.warn(
                "ไม่สามารถเล่นเสียงฟองได้:",
                error
            );
        });
    }, []);

    const handleShoot = useCallback(
        (bubble) => {
            if (gameStatus !== "playing") {
                return;
            }

            if (showBoss) {
                return;
            }

            playPopSound();
            createParticles(bubble);

            // ยิงแนวคิดที่ถูกต้องจะถือว่าแพ้
            if (bubble.type === "good") {
                setGameStatus("lose");
                return;
            }

            // ยิงฟองข้ออ้างสำเร็จ
            setScore(
                (previousScore) =>
                    previousScore +
                    SCORE_PER_BAD_BUBBLE
            );

            setBubbles((previousBubbles) =>
                previousBubbles.filter(
                    (item) => item.id !== bubble.id
                )
            );
        },
        [
            createParticles,
            gameStatus,
            playPopSound,
            showBoss,
        ]
    );

    const restartGame = useCallback(() => {
        clearParticles();

        setBubbles(generateBubbles());
        setScore(0);
        setGameStatus("playing");
        setShowBoss(false);
    }, [clearParticles]);

    const finishBoss = useCallback(() => {
        setShowBoss(false);
        setGameStatus("win");
    }, []);

    const failBoss = useCallback(() => {
        restartGame();
    }, [restartGame]);

    useEffect(() => {
        if (gameStatus !== "playing") {
            return;
        }

        if (showBoss) {
            return;
        }

        const remainingBadBubbles =
            bubbles.filter(
                (bubble) => bubble.type === "bad"
            );

        if (
            remainingBadBubbles.length === 0 &&
            score >= MINIMUM_BOSS_SCORE
        ) {
            setShowBoss(true);
        }
    }, [
        bubbles,
        gameStatus,
        score,
        showBoss,
    ]);

    return {
        bubbles,
        score,
        gameStatus,
        showBoss,
        particles,

        handleShoot,
        restartGame,
        finishBoss,
        failBoss,
    };
}