import { useEffect, useState } from "react";

import { getLeaderboard } from "../../services/profileService";

// ============================================================
// Leaderboard (ดึงจาก DB ผ่าน /api/profile/leaderboard)
// ------------------------------------------------------------
// - Top 5 นิสิต เรียงตาม Integrity Points
// - แถวของตัวเองไฮไลต์
// - ถ้าไม่ติด Top 5 → แสดงแถว "คุณ" ต่อท้าย
// ใช้ class เดิมใน index.css (.panel / .leaderboard-item / .rank-*)
// ============================================================

const MEDALS = { 1: "🥇", 2: "🥈", 3: "🥉" };

const RANK_CLASS = { 1: "rank-1", 2: "rank-2", 3: "rank-3" };

const ME_STYLE = {
    background: "rgba(59, 130, 246, 0.12)",
    border: "1px solid rgba(59, 130, 246, 0.35)",
};

function LeaderboardRow({ row, isMeRow = false }) {
    return (
        <div
            className="leaderboard-item"
            style={row.is_me ? ME_STYLE : undefined}
            title={`ผ่าน ${row.passed_levels} ด่าน`}
        >
            <div className="leaderboard-rank-info" style={{ minWidth: 0 }}>
                <span
                    className={`rank-number ${RANK_CLASS[row.rank] || "rank-normal"}`}
                    style={{ flexShrink: 0 }}
                >
                    {MEDALS[row.rank] || row.rank}
                </span>

                <span
                    className="player-name"
                    style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        color: row.is_me ? "#1d4ed8" : undefined,
                    }}
                >
                    {isMeRow ? `คุณ · ${row.name}` : row.name}
                    {row.is_me && !isMeRow && " (คุณ)"}
                </span>
            </div>

            <span className="player-score">{row.score}</span>
        </div>
    );
}

function Leaderboard() {
    const [board, setBoard] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        getLeaderboard()
            .then((data) => {
                if (isMounted) setBoard(data);
            })
            .catch((error) => {
                console.error("Load leaderboard error:", error);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const top = board?.top || [];

    return (
        <div className="panel">
            <div className="panel-header-container">
                <h3>Leaderboard</h3>
            </div>

            {loading && (
                <p style={{ textAlign: "center", fontSize: 13, padding: "8px 0" }}>
                    กำลังโหลด...
                </p>
            )}

            {!loading && top.length === 0 && (
                <p style={{ textAlign: "center", fontSize: 13, padding: "8px 0" }}>
                    ยังไม่มีผู้เล่นที่มีคะแนน
                </p>
            )}

            {top.map((row) => (
                <LeaderboardRow key={row.user_id} row={row} />
            ))}

            {/* ไม่ติด Top 5 → แสดงอันดับของตัวเอง */}
            {board?.me && (
                <>
                    <div
                        style={{
                            textAlign: "center",
                            color: "#b08968",
                            fontWeight: 800,
                            lineHeight: 1,
                            margin: "2px 0 6px",
                        }}
                    >
                        ⋯
                    </div>
                    <LeaderboardRow row={board.me} isMeRow />
                </>
            )}
        </div>
    );
}

export default Leaderboard;