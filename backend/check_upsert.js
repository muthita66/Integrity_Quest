const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
    await prisma.user_level_ip.upsert({
        where: { user_id_level_id: { user_id: 5, level_id: 1 } },
        update: {},
        create: { user_id: 5, level_id: 1, best_ip: 0 }
    });
    console.log("Upsert Success");
}
main().finally(() => prisma.$disconnect());
