/**
 * แถบหลักฐานด้านซ้าย — บอกว่ากำลังตรวจใบไหน ใบไหนผ่านแล้ว ใบไหนยังไม่ถึง
 * เป็นตัวแสดงสถานะอย่างเดียว กดไม่ได้ เพราะด่านนี้ตรวจเรียงทีละใบ
 */
export default function ExhibitStrip({ slips, index, answers }) {
    const resultOf = (id) => answers.find((a) => a.id === id);

    return (
        <div>
            <h3
                style={{
                    margin: "0 0 10px",
                    fontFamily: "var(--font-serif)",
                    fontSize: 17,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                }}
            >
                แฟ้มหลักฐาน
            </h3>

            <div className="exhibit-strip">
                {slips.map((slip, i) => {
                    const done = resultOf(slip.id);
                    const cls = [
                        "exhibit",
                        i === index ? "exhibit--now" : "",
                        done ? (done.correct ? "exhibit--ok" : "exhibit--no") : "",
                        !done && i !== index ? "exhibit--todo" : "",
                    ]
                        .filter(Boolean)
                        .join(" ");

                    return (
                        <div
                            key={slip.id}
                            className={cls}
                            title={done ? (done.correct ? "ตรวจถูก" : "ตรวจพลาด") : i === index ? "กำลังตรวจ" : "ยังไม่ถึงคิว"}
                        >
                            <img src={slip.image} alt="" aria-hidden="true" />
                            <span>#{slip.id}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}