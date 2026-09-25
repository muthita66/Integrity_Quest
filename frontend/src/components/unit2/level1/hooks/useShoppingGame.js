import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";
const LEVEL_ID = 5;

export default function useShoppingGame() {
    const navigate = useNavigate();

    const [poolItems, setPoolItems] = useState([]);
    const [needsBasket, setNeedsBasket] = useState([]);
    const [wantsBasket, setWantsBasket] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [playId, setPlayId] = useState(null);
    const hasStartedRef = useRef(false);

    const fetchItems = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `${API_URL}/api/levelItem/level/${LEVEL_ID}/items`
            );

            if (!response.ok) {
                throw new Error("ไม่สามารถโหลดข้อมูล Items ได้");
            }

            const data = await response.json();

            const formattedItems = data.map((item) => ({
                id: item.item_id,
                src: item.image,
                alt: item.name,
                name: item.name,
                type: item.item_type,
            }));

            setPoolItems(formattedItems);
            setTotalItems(formattedItems.length);
        } catch (error) {
            console.error("Error fetching level items:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const startGame = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("ไม่พบ Token กรุณาเข้าสู่ระบบใหม่");
            }

            const response = await fetch(
                `${API_URL}/api/game-play/start`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        level_id: LEVEL_ID,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "ไม่สามารถเริ่มเกมได้"
                );
            }

            setPlayId(data.data.play_id);

            return data.data.play_id;
        } catch (error) {
            console.error("Start Game Error:", error);
            setError(error.message);
            return null;
        }
    };

    useEffect(() => {
        fetchItems();

        if (hasStartedRef.current) {
            return;
        }

        hasStartedRef.current = true;
        startGame();
    }, []);

    const removeItemFromZone = (itemId, sourceZone) => {
        if (sourceZone === "pool") {
            setPoolItems((previousItems) =>
                previousItems.filter((item) => item.id !== itemId)
            );
        }

        if (sourceZone === "need") {
            setNeedsBasket((previousItems) =>
                previousItems.filter((item) => item.id !== itemId)
            );
        }

        if (sourceZone === "want") {
            setWantsBasket((previousItems) =>
                previousItems.filter((item) => item.id !== itemId)
            );
        }
    };

    const addItemToZone = (item, targetZone) => {
        if (targetZone === "pool") {
            setPoolItems((previousItems) => [
                ...previousItems,
                item,
            ]);
        }

        if (targetZone === "need") {
            setNeedsBasket((previousItems) => [
                ...previousItems,
                item,
            ]);
        }

        if (targetZone === "want") {
            setWantsBasket((previousItems) => [
                ...previousItems,
                item,
            ]);
        }
    };

    const moveItemBetweenZones = (
        item,
        sourceZone,
        targetZone
    ) => {
        if (!item || !sourceZone || !targetZone) return;
        if (sourceZone === targetZone) return;

        removeItemFromZone(item.id, sourceZone);
        addItemToZone(item, targetZone);
    };

    const checkAnswers = async () => {
        /*
         * เดิมฟังก์ชันนี้คำนวณ pass/score เองทั้งหมดที่ Frontend
         * (เทียบ item.type ตรง ๆ) แล้วส่งค่าที่คำนวณเองไปแสดงที่หน้า
         * Result ผ่าน router state โดยไม่เคยเช็คกับ DB เลยว่าตรงกัน
         * จริงไหม — ตอนนี้ตัดการคำนวณฝั่ง Frontend ออกทั้งหมด ส่งแค่
         * "ผู้เล่นเลือกอะไรลงตะกร้าไหน" ไปให้ Backend ตรวจ แล้วใช้ผล
         * ที่ Backend คำนวณจริง (ถูก/ผิด, PASS/FAIL, IP) ส่งต่อไปหน้า
         * Result เท่านั้น
         */
        try {
            const needsWithUserType = needsBasket.map((item) => ({
                ...item,
                userType: "need",
            }));

            const wantsWithUserType = wantsBasket.map((item) => ({
                ...item,
                userType: "want",
            }));

            const combinedItems = [
                ...needsWithUserType,
                ...wantsWithUserType,
            ];

            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error(
                    "ไม่พบ Token กรุณาเข้าสู่ระบบใหม่"
                );
            }

            if (!playId) {
                throw new Error("ไม่พบ play_id ของเกม");
            }

            const saveResponse = await fetch(
                `${API_URL}/api/game-play/need-want`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        play_id: playId,
                        items: combinedItems.map((item) => ({
                            item_id: item.id,
                            user_type: item.userType,
                        })),
                    }),
                }
            );

            const saveData = await saveResponse.json();

            if (!saveResponse.ok) {
                throw new Error(
                    saveData.message ||
                    "ไม่สามารถบันทึกคำตอบได้"
                );
            }

            const completeResponse = await fetch(
                `${API_URL}/api/game-play/complete`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        play_id: playId,
                    }),
                }
            );

            const completeData =
                await completeResponse.json();

            if (!completeResponse.ok) {
                throw new Error(
                    completeData.message ||
                    "ไม่สามารถจบเกมได้"
                );
            }

            navigate("/unit2/level1/result", {
                state: {
                    result: completeData.data,
                },
            });
        } catch (error) {
            console.error(
                "Check Answers Error:",
                error
            );
            setError(error.message);
        }
    };

    const resetGame = async () => {
        setNeedsBasket([]);
        setWantsBasket([]);

        await fetchItems();
        await startGame();
    };

    const isAllPlaced =
        !loading &&
        totalItems > 0 &&
        poolItems.length === 0;

    return {
        poolItems,
        needsBasket,
        wantsBasket,
        isAllPlaced,
        moveItemBetweenZones,
        checkAnswers,
        resetGame,
        loading,
        error,
        playId,
    };
}