import Header from "../MapPage/Header";
import UnitNode from "../MapPage/GameMap/UnitNode";
import DailyQuest from "../MapPage/Sidebar/DailyQuest";
import Leaderboard from "../MapPage/Sidebar/Leaderboard";
import PrePost from "../MapPage/Sidebar/PrePost";
import units from "../MapPage/GameMap/Unitdata";
import bg from "../../assets/bg_game.png";
import Chest from "../MapPage/GameMap/Chest";
import FloatingStonePath from "../MapPage/GameMap/FloatingStonePath";

function MapPage() {
    return (
        <div
            className="map-page"
            style={{
                background: `linear-gradient(rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.3)), url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                fontFamily: "'Prompt', sans-serif"
            }}
        >
            <Header />

            <div className="content" style={{ display: "flex", flex: 1, overflow: "hidden" }}>

                {/* ── Game Map Board ── */}
                <div className="game-map" style={{ position: "relative", flex: 1 }}>
                    <FloatingStonePath />
                    {/* ── All Units (Unit 1-6) ── */}
                    {units.map((unit) => (
                        <div
                            key={unit.id}
                            style={{
                                position: "absolute",
                                left: unit.left,
                                top: unit.top,
                                transform: "translate(-50%, -50%) scale(1.15)", // สเกลขนาดป้อมให้สมดุล ไม่ใหญ่จนทับสายรุ้งมิด
                                zIndex: 10,
                            }}
                        >
                            <UnitNode unit={unit} />
                        </div>
                    ))}
                    <Chest left="90%" top="69%" />
                </div>

                {/* ── Sidebar (ฝั่งขวา) ── */}
                <div className="sidebar" style={{ width: "280px", padding: "20px", zIndex: 20 }}>
                    <DailyQuest />
                    <Leaderboard />
                    <PrePost completedUnits={4} totalUnits={6} />
                </div>

            </div>

            {/* ── Footer ── */}
            <div className="footer" style={{ height: "2vh", width: "19vw", left: "81.7%", zIndex: 20, position: "relative" }}>
                <a href="#about">About Project</a>
                <a href="#help">Help Center</a>
            </div>
        </div>
    );
}

export default MapPage;