import { FaFire, FaUserCircle } from "react-icons/fa";
import elephant from "../../assets/elephant.png";

function Header() {
    return (
        <div className="header">
            <div className="logo">
                <img
                    src={elephant}
                    alt="Elephant"
                    style={{ width: "60px", height: "auto" }}
                />

                <span className="logo-text">
                    INTEGRITY QUEST
                    <style>{`
                    .logo-text {
                    font-size: 3rem;
                    font-weight: 900;
                    letter-spacing: 2px;

                    background: linear-gradient(
                        180deg,
                        #eceaf1ff 0%,
                        #ffcfffc8 30%,
                        #e3cdf9ff 65%,
                        #b5d7fbc9 100%
                    );
                    -webkit-text-stroke: 2px #1603037a;

                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;

                    filter:
                        drop-shadow(0 0 8px rgba(230, 198, 198, 0.8))
                        drop-shadow(0 0 20px rgba(198, 145, 255, 0.5));
                    }
                `}</style>
                </span>
            </div>

            <div className="header-right">
                <div>
                    <FaFire
                        style={{
                            color: "#f97316",
                            filter: "drop-shadow(0 0 4px rgba(249, 115, 22, 0.4))",
                        }}
                    />
                    <span>7 Day Streak</span>
                </div>

                <div>
                    <FaUserCircle style={{ color: "#38bdf8" }} />
                    <span>Student Name</span>
                </div>
            </div>
        </div>
    );
}

export default Header;