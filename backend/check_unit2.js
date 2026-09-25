const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function checkData() {
  const levels = await p.level.findMany({ where: { unit_id: 2 } });
  console.log("Levels in Unit 2:", JSON.stringify(levels, null, 2));
}

checkData().finally(() => p.$disconnect());
