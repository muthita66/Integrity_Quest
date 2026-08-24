import "../../../../styles/unit2/button/level1/button.css";

function FinishButton({ onClick, show }) {
    if (!show) return null;

    return (
        <button
            onClick={onClick}
            className="button_start_game_level1"
        >
            เสร็จสิ้น
        </button>
    );
}

export default FinishButton;
