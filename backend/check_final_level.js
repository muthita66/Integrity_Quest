const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function checkData() {
  const levels = await p.level.findMany({ where: { unit_id: 1 } });
  console.log("Levels in Unit 1:", levels);

  const finalLevel = levels.find(l => l.is_final);
  if (!finalLevel) {
    console.log("No final level found");
    return;
  }

  const scenes = await p.introScene.findMany({
    where: { level_id: finalLevel.level_id },
    include: { sceneMission: true }
  });
  
  console.log("Scenes for final level:", JSON.stringify(scenes, null, 2));
}

checkData().finally(() => p.$disconnect());
