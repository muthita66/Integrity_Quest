import "../../../../styles/unit2/button/level1/button.css";

function FinishButton({ onClick, show }) {
    if (!show) return null;

    return (
        <button
            onClick={onClick}
            className="button-finish-game green">
            <span className="button-finish-game-top">เสร็จสิ้น</span>
            <span className="button-finish-game-bottom"></span>
            <span className="button-finish-game-base"></span>
        </button>
    );
}

export default FinishButton;
