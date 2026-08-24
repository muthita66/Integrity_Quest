import TraitBar from "./TraitBar";

const TRAITS = [
    { key: "logic", label: "Logic · ตรรกะ" },
    { key: "empathy", label: "Empathy · ความเห็นใจ" },
    { key: "responsibility", label: "Responsibility · ความรับผิดชอบ" },
    { key: "consistency", label: "Consistency · ความสอดคล้อง" },
];

export default function ResultScreen({
    result,
    badge,
    error,
    restart,
}) {
    if (error || !result) {
        return (
            <div className="sm-screen">
                <div className="sm-result-head">
                    <p className="sm-eyebrow">ผลการสะท้อน</p>
                </div>

                <p className="sm-err">
                    {error || "กระจกขุ่นมัวชั่วคราว ลองมองเข้าไปอีกครั้ง"}
                </p>

                <div className="sm-again-wrap">
                    <button className="sm-btn" onClick={restart}>
                        ลองใหม่อีกครั้ง
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="sm-screen">
            <div className="sm-result-head">
                <p className="sm-eyebrow">ผลการสะท้อน</p>
            </div>

            {badge && (
                <>
                    <div className="sm-medallion">
                        <div className="sm-ring" />
                        <div className="sm-ring2" />
                    </div>
                    <p className="sm-badge-name">{badge.key}</p>
                    <p className="sm-badge-th">{badge.th}</p>
                </>
            )}

            <p className="sm-overall">{result.overall_reflection}</p>

            <div className="sm-traits">
                {TRAITS.map((t) => (
                    <TraitBar
                        key={t.key}
                        label={t.label}
                        score={Number(result[t.key]?.score) || 0}
                        note={result[t.key]?.note || ""}
                    />
                ))}
            </div>

            <div className="sm-shadow-msg">{result.shadow_message}</div>

            <div className="sm-again-wrap">
                <button className="sm-btn" onClick={restart}>
                    ลองใหม่อีกครั้ง
                </button>

                <button
                    className="sm-btn"
                    onClick={() => navigate("../map")}
                >
                    กลับหน้าหลัก
                </button>
            </div>
        </div>
    );
}