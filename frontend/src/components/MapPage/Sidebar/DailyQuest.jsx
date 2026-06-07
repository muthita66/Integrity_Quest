import { FaCheckCircle, FaBookOpen } from "react-icons/fa";

function DailyQuest() {
    const quests = [
        { text: "Complete 1 Lesson", completed: true },
        { text: "Get 3 Perfect Scores", completed: true },
        { text: "Get 10 Perfect Lesson", completed: true },
    ];

    return (
        <div className="panel">
            <div className="panel-header-container">
                <h3>Daily Quests</h3>
            </div>

            <div className="quests-list">
                {quests.map((quest, idx) => (
                    <div key={idx} className={`quest-item ${quest.completed ? 'completed' : ''}`}>
                        <span className="quest-text">{quest.text}</span>
                        <FaCheckCircle className="quest-check" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DailyQuest;