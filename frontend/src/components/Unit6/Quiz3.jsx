export default function QuizScreen({
    q,
    current,
    questions,
    answers,
    textareaRef,
    updateAnswer,
    nextQuestion,
    nextDisabled,
}) {
    return (
        <div className="sm-screen">
            <div className="sm-mirror">
                <svg
                    className="sm-crack"
                    viewBox="0 0 400 260"
                    preserveAspectRatio="none"
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        pointerEvents: "none",
                    }}
                >
                    <line
                        x1="200"
                        y1="0"
                        x2="180"
                        y2="90"
                        stroke="var(--hairline-strong)"
                        strokeWidth="1"
                        style={{ opacity: current > 0 ? 1 : 0 }}
                    />

                    <line
                        x1="180"
                        y1="90"
                        x2="230"
                        y2="150"
                        stroke="var(--hairline-strong)"
                        strokeWidth="1"
                        style={{ opacity: current > 1 ? 1 : 0 }}
                    />

                    <line
                        x1="180"
                        y1="90"
                        x2="120"
                        y2="130"
                        stroke="var(--hairline-strong)"
                        strokeWidth="1"
                        style={{ opacity: current > 2 ? 1 : 0 }}
                    />

                    <line
                        x1="230"
                        y1="150"
                        x2="260"
                        y2="230"
                        stroke="var(--hairline-strong)"
                        strokeWidth="1"
                        style={{ opacity: current > 3 ? 1 : 0 }}
                    />

                    <line
                        x1="230"
                        y1="150"
                        x2="180"
                        y2="220"
                        stroke="var(--hairline-strong)"
                        strokeWidth="1"
                        style={{ opacity: current > 4 ? 1 : 0 }}
                    />
                </svg>

                <p className="sm-q-tag">{q.tag}</p>
                <p className="sm-q-text">{q.text}</p>

                <textarea
                    ref={textareaRef}
                    className="sm-textarea"
                    placeholder="พิมพ์สิ่งที่อยู่ในใจคุณ..."
                    value={answers[current]}
                    onChange={(e) => updateAnswer(e.target.value)}
                />
            </div>

            <div className="sm-frame-rules">
                {questions.map((_, i) => (
                    <div
                        key={i}
                        className={
                            "sm-shard" +
                            (i < current
                                ? " done"
                                : i === current
                                    ? " now"
                                    : "")
                        }
                    />
                ))}
            </div>

            <div className="sm-row">
                <span className="sm-hint">
                    เงาไม่ตัดสิน มันแค่ฟัง
                </span>

                <button
                    className="sm-btn"
                    onClick={nextQuestion}
                    disabled={nextDisabled}
                >
                    {current === questions.length - 1
                        ? "ดูผลสะท้อน"
                        : "ถัดไป"}
                </button>
            </div>
        </div>
    );
}