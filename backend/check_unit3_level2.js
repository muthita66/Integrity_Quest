const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function checkData() {
  const levels = await p.level.findMany({ where: { unit_id: 3 } });
  const level2 = levels.find(l => l.order_no === 2);
  
  if (!level2) {
      console.log("No level 2 found for unit 3");
      return;
  }
  
  const scenes = await p.introScene.findMany({
    where: { level_id: level2.level_id },
    include: { 
        sceneMission: {
            include: {
                sceneMissionRules: true
            }
        } 
    }
  });
  console.log(JSON.stringify(scenes, null, 2));
}

checkData().finally(() => p.$disconnect());
