const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    const plays = await prisma.game_play_history.findMany({
        where: { level_id: 1 },
        orderBy: { play_id: "desc" },
        take: 1,
        include: { game_play_answers: true }
    });
    console.log(JSON.stringify(plays, null, 2));
}

main().finally(() => prisma.$disconnect());
