const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

p.sceneMissionRules.findMany({
  select: { id: true, rule_id: true, title: true, image_path: true }
}).then(r => {
  console.log(JSON.stringify(r, null, 2));
  p.$disconnect();
}).catch(e => { console.error(e); p.$disconnect(); });
