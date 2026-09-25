import BossBubble from "../BossBubble";

export default function BossSection({
    levelId,
    playId,
    open,
    onFinish,
    onFail,
}) {
    if (!open) {
        return null;
    }

    return (
        <BossBubble
            levelId={levelId}
            playId={playId}
            onFinish={onFinish}
            onFail={onFail}
        />
    );
}
