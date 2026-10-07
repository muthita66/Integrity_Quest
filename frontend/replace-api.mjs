import fs from "fs";
import path from "path";

const SRC = "./src";
const OLD = "http://localhost:5000";

function walk(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const p = path.join(dir, e.name);
        return e.isDirectory() ? walk(p) : [p];
    });
}

for (const file of walk(SRC)) {
    if (!/\.(js|jsx)$/.test(file) || file.endsWith("config.js")) continue;
    let text = fs.readFileSync(file, "utf8");
    if (!text.includes(OLD)) continue;

    text = text.replace(/(["'])http:\/\/localhost:5000([^"']*)\1/g, "`${BASE_URL}$2`");
    text = text.replace(/http:\/\/localhost:5000/g, "${BASE_URL}");

    const depth = path.relative(path.dirname(file), SRC).split(path.sep).filter(Boolean).length;
    const rel = (depth === 0 ? "./" : "../".repeat(depth)) + "config";
    text = `import { BASE_URL } from "${rel}";\n` + text;

    fs.writeFileSync(file, text);
    console.log("updated", file);
}