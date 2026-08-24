// GameData2.jsx
// Two-branch "good network" map: นักเรียน (start) fans out into a
// parent/community branch and a teacher/school branch, and both
// branches merge at หน่วยงานรัฐ before the final ศาลยุติธรรม node.

export const MAX_LIVES = 3;
export const START_ID = "student";
export const GOAL_ID = "court";

// x/y are laid out on a 1536 x 1000 canvas, mirroring the reference
// composition: student on top, two symmetric branches fanning down and
// merging into a single stem that ends at the court.
export const NODES = [
    { id: "student", label: "นักเรียน", icon: "🧑‍🎓", x: 742, y: 130 },

    { id: "parent", label: "ผู้ปกครอง", icon: "👨‍👩‍👧", x: 278, y: 285 },
    { id: "teacher", label: "คุณครู", icon: "👩‍🏫", x: 1206, y: 285 },

    { id: "neighbor", label: "เพื่อนบ้าน", icon: "🏠", x: 140, y: 455 },
    { id: "schooladmin", label: "ฝ่ายบริหารโรงเรียน", icon: "🏢", x: 1344, y: 455 },

    { id: "community", label: "ชุมชน", icon: "👥", x: 290, y: 640 },
    { id: "schoolfriends", label: "เพื่อนในโรงเรียน", icon: "🧑‍🤝‍🧑", x: 1194, y: 640 },

    { id: "media", label: "สื่อ/ออนไลน์", icon: "📱", x: 505, y: 720 },
    { id: "otherschools", label: "โรงเรียนอื่น ๆ", icon: "🏫", x: 1030, y: 720 },

    { id: "govt", label: "หน่วยงานรัฐ", icon: "🏛️", x: 762, y: 645 },
    { id: "court", label: "ศาลยุติธรรม", icon: "⚖️", x: 762, y: 775 },
];

export const NODE_BY_ID = Object.fromEntries(
    NODES.map((n) => [n.id, n])
);

// Undirected connections; direction of play is always "away from student".
export const EDGES = [
    ["student", "parent"],
    ["student", "teacher"],

    ["parent", "neighbor"],
    ["teacher", "schooladmin"],

    ["neighbor", "community"],
    ["schooladmin", "schoolfriends"],

    ["community", "media"],
    ["schoolfriends", "otherschools"],

    ["media", "govt"],
    ["otherschools", "govt"],

    ["govt", "court"],
];

export function edgeKey(a, b) {
    return [a, b].sort().join("|");
}

export const EDGE_MAP = new Map(
    EDGES.map(([a, b]) => [edgeKey(a, b), { a, b }])
);

// Adjacency used to figure out which nodes are currently reachable.
export const NEIGHBORS = new Map(NODES.map((n) => [n.id, []]));
EDGES.forEach(([a, b]) => {
    NEIGHBORS.get(a).push(b);
    NEIGHBORS.get(b).push(a);
});

// Layer = shortest hop-count from the student, used for the progress bar.
export const LAYER = (() => {
    const dist = new Map([[START_ID, 0]]);
    const queue = [START_ID];
    while (queue.length) {
        const cur = queue.shift();
        const d = dist.get(cur);
        for (const next of NEIGHBORS.get(cur) || []) {
            if (!dist.has(next)) {
                dist.set(next, d + 1);
                queue.push(next);
            }
        }
    }
    return dist;
})();

export const MAX_LAYER = Math.max(...LAYER.values());

// Prerequisites for each node = its neighbors that sit on a lower layer.
// Most nodes have exactly one (a straight chain), but หน่วยงานรัฐ has two
// (media AND otherschools) — so both branches must be finished before it
// unlocks, and court in turn only unlocks after that.
export const PREREQS = new Map(
    NODES.map((n) => [
        n.id,
        (NEIGHBORS.get(n.id) || []).filter((nb) => LAYER.get(nb) < LAYER.get(n.id)),
    ])
);

// Curved bezier path between two nodes — a gentle single arc, bulging
// away from the vertical centerline so the two branches read as
// separate routes rather than overlapping straight lines.
export function curveFor(aId, bId) {
    const a = NODE_BY_ID[aId];
    const b = NODE_BY_ID[bId];
    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2;

    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const px = -dy / len;
    const py = dx / len;

    // Bulge direction: left-branch nodes arc left, right-branch arc
    // right, the shared stem (govt/court) stays essentially straight.
    const side = midX < 762 - 4 ? -1 : midX > 762 + 4 ? 1 : 0;
    const bulge = side * Math.min(46, len * 0.18);

    const cx = midX + px * bulge;
    const cy = midY + py * bulge;

    return {
        d: `M ${a.x} ${a.y} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x} ${b.y}`,
        mid: { x: cx, y: cy },
    };
}

export const EDGE_CURVES = new Map(
    EDGES.map(([a, b]) => [edgeKey(a, b), curveFor(a, b)])
);

// Roughly how many people a checkpoint's story reaches — purely a
// flavor number for the running "คะแนนรวม" counter, nothing mechanical
// depends on it.
export const REACH = {
    parent: 4000,
    teacher: 4000,
    neighbor: 6000,
    schooladmin: 7000,
    community: 12000,
    schoolfriends: 9000,
    media: 30000,
    otherschools: 11000,
    govt: 20000,
    court: 40000,
};

export const MISSIONS = {
    parent: {
        q: "ลูกเล่าให้ฟังว่าสงสัยว่าโรงเรียนมีการทุจริตเงินค่าอาหารกลางวันของนักเรียน ผู้ปกครองควรทำอย่างไร?",
        options: [
            "รับฟังลูกอย่างจริงจัง แล้วช่วยกันหาช่องทางแจ้งเรื่องที่ถูกต้อง",
            "ดุลูกว่าเรื่องมากไป อย่าไปยุ่งเรื่องของโรงเรียน",
            "บอกให้ลูกอดทนไปเงียบ ๆ จนจบปีการศึกษา",
        ],
        correct: 0,
        explain: "ผู้ปกครองที่รับฟังและพาลูกไปแจ้งเรื่องอย่างถูกวิธี คือจุดเริ่มต้นสำคัญของเครือข่ายความดี",
    },
    teacher: {
        q: "นักเรียนคนหนึ่งมาเล่าให้ครูฟังว่าสงสัยว่ามีการทุจริตเงินค่าอาหารกลางวันของนักเรียน ครูควรทำอย่างไร?",
        options: [
            "แกล้งไม่รู้ไม่เห็น เพราะกลัวมีปัญหากับผู้บริหาร",
            "รวบรวมข้อมูลให้ชัดเจนแล้วแจ้งต่อฝ่ายบริหารโรงเรียน",
            "เล่าให้นักเรียนทั้งห้องฟังก่อนตรวจสอบข้อเท็จจริง",
        ],
        correct: 1,
        explain: "ครูควรตรวจสอบข้อมูลให้ชัดเจนก่อน แล้วส่งต่อผ่านช่องทางที่ถูกต้องภายในโรงเรียน",
    },
    neighbor: {
        q: "เพื่อนบ้านได้ยินผู้ปกครองพูดถึงเรื่องทุจริตเงินค่าอาหารกลางวันที่โรงเรียน เพื่อนบ้านควรทำอย่างไร?",
        options: [
            "ช่วยยืนยันข้อเท็จจริงและสนับสนุนให้เรื่องไปถึงชุมชน",
            "นินทาต่อ ๆ กันไปโดยไม่ตรวจสอบ",
            "ขู่ให้ครอบครัวที่ร้องเรียนเงียบไปเอง",
        ],
        correct: 0,
        explain: "เพื่อนบ้านที่ช่วยยืนยันข้อมูลอย่างมีเหตุผล ทำให้เรื่องเดินหน้าไปถึงระดับชุมชนได้อย่างน่าเชื่อถือ",
    },
    schooladmin: {
        q: "ครูนำเรื่องทุจริตเงินค่าอาหารกลางวันไปรายงานต่อฝ่ายบริหารโรงเรียน ฝ่ายบริหารควรมีมาตรการอะไรบ้าง?",
        options: [
            "ตั้งคณะกรรมการตรวจสอบและเปิดเผยผลอย่างโปร่งใส",
            "ปิดเรื่องไว้ภายใน ไม่ให้ใครรู้",
            "ย้ายครูที่แจ้งเบาะแสออกจากโรงเรียนแทน",
        ],
        correct: 0,
        explain: "การตั้งคณะกรรมการตรวจสอบและเปิดเผยผลลัพธ์คือมาตรฐานที่ทำให้ทุกฝ่ายมั่นใจในความโปร่งใส",
    },
    community: {
        q: "เรื่องทุจริตเงินค่าอาหารกลางวันแพร่ไปทั่วชุมชนผ่านปากต่อปาก ชุมชนจะช่วยกันสร้างการเปลี่ยนแปลงได้อย่างไร?",
        options: [
            "รวมตัวกันรวบรวมหลักฐานแล้วส่งต่อให้สื่อหรือหน่วยงานที่เกี่ยวข้อง",
            "เฉยไว้ เพราะคิดว่าไม่ใช่เรื่องของตัวเอง",
            "ใช้กำลังกดดันโรงเรียนโดยตรง",
        ],
        correct: 0,
        explain: "การรวมตัวกันแจ้งเบาะแสอย่างมีหลักฐาน ช่วยให้เรื่องไปถึงสื่อและหน่วยงานที่ตรวจสอบได้จริง",
    },
    schoolfriends: {
        q: "เพื่อนนักเรียนรู้ว่ามีคนไปแจ้งเรื่องทุจริตเงินค่าอาหารกลางวันของโรงเรียน เพื่อน ๆ จะร่วมสร้างวัฒนธรรมที่ดีได้อย่างไร?",
        options: [
            "ช่วยกันให้กำลังใจเพื่อนที่กล้าพูดความจริง และไม่ล้อเลียน",
            "แกล้งเพื่อนที่ไปแจ้งเรื่องว่าเป็นคนขี้ฟ้อง",
            "ทำเป็นไม่รู้เรื่องอะไรเลย",
        ],
        correct: 0,
        explain: "เพื่อนที่สนับสนุนกันแทนการล้อเลียน ช่วยให้เรื่องดี ๆ ขยายไปถึงโรงเรียนอื่นได้ต่อ",
    },
    media: {
        q: "ชุมชนส่งเรื่องทุจริตเงินค่าอาหารกลางวันไปถึงสื่อ ก่อนนำเสนอข่าวนี้สื่อควรทำอย่างไร?",
        options: [
            "ตรวจสอบข้อเท็จจริงให้รอบด้านก่อนนำเสนอข่าว",
            "รีบเผยแพร่ทันทีเพื่อความรวดเร็ว โดยไม่ตรวจสอบ",
            "ขายข่าวให้ฝ่ายที่ถูกกล่าวหาแทน",
        ],
        correct: 0,
        explain: "สื่อที่ตรวจสอบข้อเท็จจริงก่อนเผยแพร่ ช่วยให้เรื่องน่าเชื่อถือและกดดันให้เกิดการแก้ไขจริง",
    },
    otherschools: {
        q: "โรงเรียนอื่นได้ยินว่าโรงเรียนนี้จัดการเรื่องทุจริตเงินค่าอาหารกลางวันได้สำเร็จ จะขยายแนวคิดนี้ไปยังโรงเรียนอื่นได้อย่างไร?",
        options: [
            "แบ่งปันแนวทางแจ้งเบาะแสและผลลัพธ์ให้โรงเรียนอื่นเรียนรู้",
            "เก็บไว้เป็นความลับของโรงเรียนเดียว",
            "รอให้หน่วยงานรัฐบังคับใช้เองทั้งหมด",
        ],
        correct: 0,
        explain: "การแบ่งปันบทเรียนระหว่างโรงเรียน ช่วยให้เครือข่ายความโปร่งใสขยายกว้างขึ้นทั่วทั้งระบบ",
    },
    govt: {
        q: "ทั้งสื่อและเครือข่ายโรงเรียนต่างส่งเรื่องทุจริตเงินค่าอาหารกลางวันไปถึงหน่วยงานรัฐ หน่วยงานรัฐควรดำเนินการอย่างไรเมื่อได้รับเรื่อง?",
        options: [
            "ตรวจสอบข้อเท็จจริงอย่างจริงจังและมีมาตรการคุ้มครองผู้แจ้งเบาะแส",
            "รับเรื่องไว้เฉย ๆ แล้วไม่ดำเนินการต่อ",
            "เปิดเผยชื่อผู้แจ้งเบาะแสต่อสาธารณะทันที",
        ],
        correct: 0,
        explain: "หน่วยงานรัฐมีหน้าที่ตรวจสอบอย่างจริงจังและคุ้มครองผู้แจ้งเบาะแส เพื่อให้กระบวนการยุติธรรมเดินหน้าได้อย่างปลอดภัย",
    },
    court: {
        q: "หน่วยงานรัฐส่งสำนวนคดีทุจริตเงินค่าอาหารกลางวันเข้าสู่ศาล ศาลจะพิจารณาและตัดสินอย่างไร?",
        options: [
            "พิจารณาจากหลักฐานอย่างเป็นธรรมและตัดสินตามกฎหมาย",
            "ตัดสินตามกระแสสังคมโดยไม่ดูหลักฐาน",
            "เลื่อนคดีออกไปเรื่อย ๆ จนไม่มีใครติดตาม",
        ],
        correct: 0,
        explain: "ศาลตัดสินบนหลักฐานและกระบวนการที่เป็นธรรม คือปลายทางที่ทำให้เครือข่ายความดีที่ทุกคนช่วยกันสร้างมามีความหมาย",
    },
};