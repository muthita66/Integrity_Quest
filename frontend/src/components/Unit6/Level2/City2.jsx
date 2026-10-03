// City.jsx

function seededRandom(seed) {
    let s = seed;

    return () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
    };
}

function buildCity() {
    const rnd = seededRandom(42);

    const buildingCount = 16;
    const viewWidth = 1620;
    const baseY = 680;

    const buildings = [];

    let windowId = 0;

    for (let i = 0; i < buildingCount; i++) {
        const width = 60 + rnd() * 35;
        const height = 50 + rnd() * 90;

        const x = i * (viewWidth / buildingCount) + 6;
        const y = baseY - height;

        const windows = [];

        const cols = Math.floor(width / 15);
        const rows = Math.floor(height / 16);

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                windows.push({
                    id: windowId++,
                    x: x + 8 + c * 15,
                    y: y + 8 + r * 16,
                });
            }
        }

        buildings.push({
            x,
            y,
            w: width,
            h: height + 30,
            windows,
        });
    }

    return buildings;
}

export const CITY = buildCity();

export const ALL_WINDOWS = CITY.flatMap(
    (building) => building.windows
);