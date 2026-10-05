const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function setup({ units, levels, progress, user }) {
    const exports = {};
    const saved = [];
    const prisma = {
        units: { findMany: async () => units },
        level: { findMany: async () => levels },
        user_level_progress: { findMany: async () => progress },
        users: { findUnique: async () => user },
    };
    vm.runInNewContext(fs.readFileSync(require.resolve('../src/controllers/certificateController'), 'utf8'), {
        exports, console, require: (path) => path === '../lib/prisma' ? prisma : { updateLevelProgress: async (data) => saved.push(data) },
    });
    const res = { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
    return { exports, res, saved };
}

const fixture = () => ({
    units: [{ unit_id: 1 }, { unit_id: 6 }],
    levels: [{ level_id: 1, unit_id: 1 }, { level_id: 2, unit_id: 6 }],
    progress: [{ level_id: 1, status: 'PASS', completed_at: '2026-10-01T00:00:00Z' }, { level_id: 2, status: 'PERFECT', completed_at: '2026-10-03T08:00:00Z' }],
    user: { username: 'player', students: [{ first_name: 'สมชาย', last_name: 'ใจดี' }], teachers: [] },
});
test('certificate uses authenticated profile and recorded completion date', async () => {
    const { exports, res } = setup(fixture());
    await exports.getCertificate({ user: { id: 7 } }, res);
    assert.equal(res.code, 200);
    assert.equal(res.body.data.name, 'สมชาย ใจดี');
    assert.equal(res.body.data.completedAt, '2026-10-03T08:00:00.000Z');
});
test('blocks failed, unfinished, empty and missing chapters', async () => {
    for (const modify of [
        (f) => { f.progress[1].status = 'FAIL'; },
        (f) => { f.progress[1].completed_at = null; },
        (f) => { f.units.push({ unit_id: 3 }); },
        (f) => { f.progress = []; },
        (f) => { f.units = []; },
    ]) {
        const f = fixture(); modify(f);
        const { exports, res } = setup(f);
        await exports.getCertificate({ user: { id: 7 } }, res);
        assert.equal(res.code, 403);
    }
});
test('reflection requires six answers and prior passes', async () => {
    const f = fixture();
    f.levels = [1, 2, 3].map((n) => ({ level_id: n, unit_id: 6 }));
    const req = { user: { id: 7 }, body: { answers: Array.from({ length: 6 }, () => ({ answer: 'คำตอบ' })) } };
    const good = setup(f);
    await good.exports.completeReflection(req, good.res);
    assert.equal(good.res.code, 200);
    assert.equal(good.saved[0].levelId, 3);
    f.progress[1].status = 'FAIL';
    const locked = setup(f);
    await locked.exports.completeReflection(req, locked.res);
    assert.equal(locked.res.code, 403);
    assert.equal(locked.saved.length, 0);
    req.body.answers[0].answer = ' ';
    const empty = setup(f);
    await empty.exports.completeReflection(req, empty.res);
    assert.equal(empty.res.code, 400);
});
