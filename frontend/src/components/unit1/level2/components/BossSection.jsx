import BossBubble from "../BossBubble";

export default function BossSection({
    open,
    onFinish,
    onFail,
}) {
    if (!open) {
        return null;
    }

    return (
        <BossBubble
            onFinish={onFinish}
            onFail={onFail}
        />
    );
}