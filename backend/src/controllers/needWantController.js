const prisma = require("../lib/prisma");

const LEVEL_ID = 5;

exports.saveNeedWant = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            play_id,
            items,
        } = req.body;

        // ================= ตรวจข้อมูลเบื้องต้น =================
        if (!play_id) {
            return res.status(400).json({
                message: "กรุณาระบุ play_id",
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "กรุณาระบุ items",
            });
        }

        const playId = Number(play_id);

        if (!Number.isInteger(playId) || playId <= 0) {
            return res.status(400).json({
                message: "play_id ไม่ถูกต้อง",
            });
        }

        // ================= ตรวจรูปแบบ user_type =================
        for (const item of items) {
            if (!item.item_id || !item.user_type) {
                return res.status(400).json({
                    message:
                        "ทุก Item ต้องมี item_id และ user_type",
                });
            }

            if (
                item.user_type !== "need" &&
                item.user_type !== "want"
            ) {
                return res.status(400).json({
                    message:
                        "user_type ต้องเป็น need หรือ want เท่านั้น",
                });
            }
        }

        // ================= ตรวจสอบ Play History =================
        const play = await prisma.game_play_history.findUnique({
            where: {
                play_id: playId,
            },
        });

        if (!play) {
            return res.status(404).json({
                message: "ไม่พบประวัติการเล่นนี้",
            });
        }

        // ================= ตรวจสอบเจ้าของการเล่น =================
        if (play.user_id !== userId) {
            return res.status(403).json({
                message:
                    "คุณไม่มีสิทธิ์เข้าถึงการเล่นนี้",
            });
        }

        // ================= ตรวจสอบ Level =================
        if (play.level_id !== LEVEL_ID) {
            return res.status(400).json({
                message:
                    "play_id นี้ไม่ใช่การเล่น Unit 2 Level 1",
            });
        }

        // ================= ตรวจสอบว่าเกมจบแล้วหรือยัง =================
        if (play.completed_at) {
            return res.status(400).json({
                message:
                    "การเล่นนี้จบแล้ว ไม่สามารถบันทึกข้อมูลเพิ่มได้",
            });
        }

        // ================= แปลง Item ID =================
        const itemIds = items.map((item) =>
            Number(item.item_id)
        );

        const invalidItemId = itemIds.some(
            (itemId) =>
                !Number.isInteger(itemId) ||
                itemId <= 0
        );

        if (invalidItemId) {
            return res.status(400).json({
                message:
                    "item_id ต้องเป็นจำนวนเต็มที่ถูกต้อง",
            });
        }

        // ================= ป้องกัน Item ซ้ำ =================
        const uniqueItemIds = [...new Set(itemIds)];

        if (
            uniqueItemIds.length !== itemIds.length
        ) {
            return res.status(400).json({
                message:
                    "ไม่สามารถส่ง Item เดิมซ้ำกันได้",
            });
        }

        // ================= ดึง Items ของ Level 1 =================
        const levelItems =
            await prisma.level_items.findMany({
                where: {
                    level_id: LEVEL_ID,
                    item_id: {
                        in: uniqueItemIds,
                    },
                },
                include: {
                    items: {
                        select: {
                            items_id: true,
                            name: true,
                            image: true,
                        },
                    },
                    item_types: {
                        select: {
                            id: true,
                            code: true,
                            name: true,
                        },
                    },
                },
            });

        // ================= ตรวจ Item ที่ไม่อยู่ใน Level 1 =================
        if (
            levelItems.length !==
            uniqueItemIds.length
        ) {
            const foundItemIds =
                levelItems.map(
                    (item) => item.item_id
                );

            const invalidLevelItemIds =
                uniqueItemIds.filter(
                    (itemId) =>
                        !foundItemIds.includes(
                            itemId
                        )
                );

            return res.status(400).json({
                message:
                    "พบ Item ที่ไม่อยู่ใน Unit 2 Level 1",
                invalid_item_ids:
                    invalidLevelItemIds,
            });
        }

        // ================= ดึงจำนวน Item ทั้งหมด =================
        const totalLevelItems =
            await prisma.level_items.count({
                where: {
                    level_id: LEVEL_ID,
                },
            });

        // ================= ต้องตอบครบทุก Item =================
        if (
            items.length !== totalLevelItems
        ) {
            return res.status(400).json({
                message:
                    "กรุณาจัดหมวดหมู่ Item ให้ครบทุกชิ้น",
                answered:
                    items.length,
                total:
                    totalLevelItems,
            });
        }

        // ================= สร้างข้อมูลคำตอบ =================
        const records = items.map((item) => {
            const levelItem =
                levelItems.find(
                    (levelItem) =>
                        levelItem.item_id ===
                        Number(item.item_id)
                );

            const correctType =
                levelItem.item_types.code;

            const userType =
                item.user_type;

            return {
                play_id: playId,
                item_id: Number(
                    item.item_id
                ),
                user_type: userType,
                is_correct:
                    correctType ===
                    userType,
                answered_at: new Date(),
            };
        });

        // ================= ลบข้อมูลเดิมของรอบนี้ =================
        await prisma.game_play_need_want.deleteMany({
            where: {
                play_id: playId,
            },
        });

        // ================= บันทึกคำตอบ =================
        await prisma.game_play_need_want.createMany({
            data: records,
        });

        // ================= คำนวณคะแนน =================
        const correctCount =
            records.filter(
                (record) =>
                    record.is_correct
            ).length;

        const maxScore =
            totalLevelItems;

        // ================= อัปเดต Game Play History =================
        await prisma.game_play_history.update({
            where: {
                play_id: playId,
            },
            data: {
                score: correctCount,
                max_score: maxScore,
            },
        });

        // ================= Response =================
        return res.status(201).json({
            message:
                "บันทึกคำตอบ Need / Want สำเร็จ",
            data: {
                play_id: playId,
                user_id: userId,
                level_id: LEVEL_ID,
                score: correctCount,
                max_score: maxScore,
                total_items:
                    records.length,
                correct:
                    correctCount,
                incorrect:
                    records.length -
                    correctCount,
                answers: records,
            },
        });
    } catch (error) {
        console.error(
            "Save Need / Want Error:",
            error
        );

        return res.status(500).json({
            message:
                "ไม่สามารถบันทึกคำตอบ Need / Want ได้",
            error: error.message,
        });
    }
};