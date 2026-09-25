const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.level.findFirst({ where: { unit_id: 3, order_no: 3 } })
  .then(async l => {
    if(!l) return console.log('No level found');
    const scenes = await p.introScene.findMany({
      where: { level_id: l.level_id },
      include: { sceneMission: { include: { sceneMissionRules: true } } }
    });
    console.log(JSON.stringify(scenes.filter(s => s.scene_type_id === 2), null, 2));
  })
  .finally(() => p.$disconnect());
