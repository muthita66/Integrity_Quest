import { FaCrown } from "react-icons/fa";

function Leaderboard() {
    const list = [
        { rank: 1, name: "Student 1", score: 2324, color: "#eab308" }, // Gold
        { rank: 2, name: "Name 2", score: 1624, color: "#3b82f6" }, // Blue
        { rank: 3, name: "Name 3", score: 1120, color: "#ec4899" }, // Pink
        { rank: 4, name: "Naveet", score: 770, color: "#10b981" }, // Green
    ];

    const getRankIcon = (rank) => {
        if (rank === 1) return "🥇";
        if (rank === 2) return "🥈";
        if (rank === 3) return "🥉";
        return null;
    };

    return (
        <div className="panel">
            <div className="panel-header-container">
                <h3>Leaderboard</h3>
            </div>

            <div className="leaderboard-list">
                {list.map((player) => (
                    <div key={player.rank} className="leaderboard-item">
                        <div className="leaderboard-rank-info">
                            <span className={`rank-number ${player.rank <= 3 ? `rank-${player.rank}` : 'rank-normal'}`}>
                                {getRankIcon(player.rank) || player.rank}
                            </span>
                            <span className="player-name">{player.name}</span>
                        </div>

                        <span className="player-score">{player.score}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Leaderboard;