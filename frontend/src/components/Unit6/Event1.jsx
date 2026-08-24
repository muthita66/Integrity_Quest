import { FaThumbtack, FaExclamationTriangle } from "react-icons/fa";

export default function EventModal({ selectedEvent, onClose, onChoice }) {
    if (!selectedEvent) return null;

    return (
        <div className="event-overlay" onClick={onClose}>
            <div className="event-modal-wrap">
                <span className="pin pin-left"><FaThumbtack /></span>
                <span className="pin pin-right"><FaThumbtack /></span>
                <span className="urgent-stamp">ด่วน!</span>
                <div className="event-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="event-modal-head">
                        <span className="event-icon-badge"><FaExclamationTriangle /></span>
                        {selectedEvent.event.title}
                    </div>
                    <p className="event-desc">{selectedEvent.event.description}</p>
                    <div className="event-choices">
                        {selectedEvent.event.choices.map((choice) => (
                            <button
                                key={choice.id}
                                className="event-choice-btn"
                                onClick={() => onChoice(choice)}
                            >
                                {choice.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}