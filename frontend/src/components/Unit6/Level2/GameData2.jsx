export const MAX_LIVES = 3;
export const START_ID = "student";
export const GOAL_ID = "court";

export const NODES = [
    { id: "student", label: "นักเรียน", icon: "🧑‍🎓", x: 768, y: 150 },

    { id: "parent", label: "ผู้ปกครอง", icon: "👨‍👩‍👧", x: 533, y: 226 },
    { id: "teacher", label: "คุณครู", icon: "👩‍🏫", x: 1003, y: 226 },

    { id: "neighbor", label: "เพื่อนบ้าน", icon: "🏠", x: 388, y: 426 },
    { id: "schooladmin", label: "ฝ่ายบริหารโรงเรียน", icon: "🏢", x: 1148, y: 426 },

    { id: "community", label: "ชุมชน", icon: "👥", x: 388, y: 674 },
    { id: "schoolfriends", label: "เพื่อนในโรงเรียน", icon: "🧑‍🤝‍🧑", x: 1148, y: 674 },

    { id: "media", label: "สื่อ/ออนไลน์", icon: "📱", x: 533, y: 874 },
    { id: "otherschools", label: "โรงเรียนอื่น ๆ", icon: "🏫", x: 1003, y: 874 },

    { id: "govt", label: "หน่วยงานรัฐ", icon: "🏛️", x: 768, y: 950 },
    { id: "court", label: "ศาลยุติธรรม", icon: "⚖️", x: 768, y: 550 },
];

export const NODE_BY_ID = Object.fromEntries(
    NODES.map((n) => [n.id, n])
);

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

export const PREREQS = new Map(
    NODES.map((n) => [
        n.id,
        (NEIGHBORS.get(n.id) || []).filter((nb) => LAYER.get(nb) < LAYER.get(n.id)),
    ])
);

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

    const side = midX < 768 - 4 ? -1 : midX > 768 + 4 ? 1 : 0;
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

export const MISSION_ORDER = [
    "parent",
    "teacher",
    "neighbor",
    "schooladmin",
    "community",
    "schoolfriends",
    "media",
    "otherschools",
    "govt",
    "court",
];
