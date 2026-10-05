import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Unit5Navigation.css';

let paused = false;
export const isUnit5Paused = () => paused;

export default function Unit5Navigation() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const isGame = /^\/unit5\/(game[23]?|level[123]\/game)\/?$/.test(pathname);
    useEffect(() => { paused = open; return () => { paused = false; }; }, [open]);
    useEffect(() => {
        if (!open) return;
        const onKey = (event) => {
            if (event.key === 'Escape') setOpen(false);
            if (event.key !== 'Tab') return;
            const buttons = document.querySelectorAll('.unit5-menu-panel button');
            const first = buttons[0], last = buttons[buttons.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open]);
    return <>
        <div className={isGame ? 'unit5-controls unit5-controls-game' : 'unit5-controls'}>
        <button type="button" className="unit5-menu-button" aria-label="เปิดเมนูเกม" onClick={(e) => { e.stopPropagation(); setOpen(true); }}>{isGame ? <span aria-hidden="true">☰</span> : '☰ เมนู'}</button>
        </div>
        {open && <div className="unit5-menu-overlay" onClick={(e) => e.stopPropagation()}>
            <section role="dialog" aria-modal="true" aria-label="เมนูบท 5" className="unit5-menu-panel">
                <h2>พักการเล่น</h2>
                <button type="button" autoFocus onClick={() => setOpen(false)}>เล่นต่อ</button>
                <button type="button" onClick={() => navigate('/map')}>กลับหน้าแมพ</button>
            </section>
        </div>}
    </>;
}
