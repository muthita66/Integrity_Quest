const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

// GET /api/hintMinigame/:minigameId
router.get("/:minigameId", async (req, res) => {
    try {
        const minigameId = Number(req.params.minigameId);

        if (Number.isNaN(minigameId)) {
            return res.status(400).json({
                message: "Invalid minigameId",
            });
        }

        // ดึงข้อมูล Mini-game
        const minigame = await prisma.hint_minigames.findUnique({
            where: {
                id: minigameId,
            },
        });

        if (!minigame) {
            return res.status(404).json({
                message: "Mini-game not found",
            });
        }

        // ดึง Scenario ของ Mini-game
        const scenarios = await prisma.hint_minigame_scenarios.findMany({
            where: {
                minigame_id: minigameId,
            },
            orderBy: {
                month_no: "asc",
            },
        });

        // ดึง Options ของแต่ละ Scenario
        const scenarioIds = scenarios.map((scenario) => scenario.id);

        let scenarioOptions = [];

        if (scenarioIds.length > 0) {
            scenarioOptions =
                await prisma.hint_minigame_scenario_options.findMany({
                    where: {
                        scenario_id: {
                            in: scenarioIds,
                        },
                    },
                    orderBy: {
                        order_no: "asc",
                    },
                });
        }

        // ดึง Item ของ Scenario ที่มี item_id
        const itemIds = scenarios
            .map((scenario) => scenario.item_id)
            .filter((id) => id !== null && id !== undefined);

        let items = [];

        if (itemIds.length > 0) {
            items = await prisma.items.findMany({
                where: {
                    items_id: {
                        in: itemIds,
                    },
                },
                select: {
                    items_id: true,
                    name: true,
                    description: true,
                    image: true,
                    category: true,
                },
            });
        }

        // ดึง Options ของ Mini-game โดยตรง
        const minigameOptions =
            await prisma.hint_minigame_options.findMany({
                where: {
                    minigame_id: minigameId,
                },
                orderBy: {
                    order_no: "asc",
                },
            });

        // รวมข้อมูล Scenario + Options + Item
        const formattedScenarios = scenarios.map((scenario) => {
            const item = items.find(
                (item) => item.items_id === scenario.item_id
            );

            const options = scenarioOptions.filter(
                (option) => option.scenario_id === scenario.id
            );

            return {
                id: scenario.id,
                minigame_id: scenario.minigame_id,
                month_no: scenario.month_no,
                budget: scenario.budget,
                scenario_text: scenario.scenario_text,
                item: item || null,
                options,
            };
        });

        res.json({
            id: minigame.id,
            game_type: minigame.game_type,
            title: minigame.title,
            description: minigame.description,
            target_value: minigame.target_value,
            is_active: minigame.is_active,
            options: minigameOptions,
            scenarios: formattedScenarios,
        });
    } catch (error) {
        console.error("Error fetching hint mini-game:", error);

        res.status(500).json({
            message: "Failed to fetch hint mini-game",
            error: error.message,
        });
    }
});

module.exports = router;