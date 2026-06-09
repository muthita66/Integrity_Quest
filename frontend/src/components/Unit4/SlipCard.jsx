export default function SlipCard({
    bank,
    sender,
    receiver,
    amount,
    date,
    time,
    transaction,
    fake,
    selected,
    onClick,
}) {
    return (
        <div
            onClick={onClick}
            style={{
                width: "290px",
                background: "#fff",
                borderRadius: "20px",
                overflow: "hidden",
                cursor: "pointer",

                border: selected
                    ? "4px solid #ef4444"
                    : "3px solid transparent",

                transform: selected
                    ? "scale(1.04)"
                    : "scale(1)",

                transition: "0.25s",

                boxShadow:
                    "0 10px 25px rgba(0,0,0,0.18)",

                fontFamily:
                    "'Segoe UI', sans-serif",
            }}
        >
            {/* Header */}
            <div
                style={{
                    background:
                        "linear-gradient(135deg,#4338CA,#6366F1)",

                    color: "white",

                    textAlign: "center",

                    padding: "14px",

                    fontWeight: "bold",

                    fontSize: "18px",
                }}
            >
                {bank} Mobile Banking
            </div>

            {/* Success */}
            <div
                style={{
                    textAlign: "center",
                    paddingTop: "15px",
                }}
            >
                <div
                    style={{
                        width: "55px",
                        height: "55px",

                        borderRadius: "50%",

                        background: "#22c55e",

                        color: "white",

                        margin: "auto",

                        fontSize: "30px",

                        lineHeight: "55px",

                        fontWeight: "bold",
                    }}
                >
                    ✓
                </div>

                <div
                    style={{
                        color: "#22c55e",

                        fontWeight: "bold",

                        marginTop: "8px",
                    }}
                >
                    โอนเงินสำเร็จ
                </div>
            </div>

            {/* Amount */}
            <div
                style={{
                    textAlign: "center",

                    fontSize: "30px",

                    fontWeight: "700",

                    marginTop: "10px",
                }}
            >
                {amount}
            </div>

            <hr />

            {/* Details */}
            <div
                style={{
                    padding: "15px",

                    fontSize: "14px",

                    color: "#333",
                }}
            >
                <p>
                    <b>ผู้โอน</b>
                    <br />
                    {sender}
                </p>

                <p>
                    <b>ผู้รับ</b>
                    <br />
                    {receiver}
                </p>

                <p>
                    <b>วันที่</b>
                    <br />
                    {date}
                </p>

                <p>
                    <b>เวลา</b>
                    <br />
                    <span
                        style={{
                            color: "#111827",
                            fontWeight: "700",
                        }}
                    >
                        {time}
                    </span>
                </p>

                <p>
                    <b>Transaction ID</b>
                    <br />
                    {transaction}
                </p>

                {/* QR */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "15px",
                    }}
                >
                    {fake ? (
                        <div
                            style={{
                                width: "90px",
                                height: "90px",
                                background:
                                    "repeating-linear-gradient(45deg,#ddd,#ddd 8px,#aaa 8px,#aaa 16px)",
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                width: "90px",
                                height: "90px",

                                background:
                                    "repeating-linear-gradient(90deg,#000,#000 4px,#fff 4px,#fff 8px)",
                            }}
                        />
                    )}
                </div>
            </div>
        </div >
    );
}