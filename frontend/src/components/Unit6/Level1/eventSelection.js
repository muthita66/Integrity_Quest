// Use every available question before beginning another shuffled cycle.
export function selectNextEvent(locations, eventPool, occupied, seen, lastEventId, random = Math.random) {
    const candidates = locations.flatMap((location) =>
        occupied.has(location.id) ? [] : (eventPool[location.id] || []).map((event) => ({ location, event }))
    );
    if (!candidates.length) return null;
    let fresh = candidates.filter(({ event }) => !seen.has(event.event_id));
    if (!fresh.length) {
        const allSeen = Object.values(eventPool).flat().every((event) => seen.has(event.event_id));
        if (!allSeen) return null; // Wait for a location containing an unseen question to become free.
        seen.clear();
        fresh = candidates;
    }
    const different = fresh.filter(({ event }) => event.event_id !== lastEventId);
    const choices = different.length ? different : fresh;
    const chosen = choices[Math.floor(random() * choices.length)];
    seen.add(chosen.event.event_id);
    return chosen;
}
