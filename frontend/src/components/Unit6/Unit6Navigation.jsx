import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Unit6Navigation.css';

let paused = false;
export const isUnit6Paused = () => paused;

export default function Unit6Navigation() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        paused = open;
        return () => { paused = false; };
    }, [open]);
    useEffect(() => {
        if (!open) return;
        const onKey = (event) => {
            if (event.key === 'Escape') setOpen(false);
            if (event.key !== 'Tab') return;
            const buttons = document.querySelectorAll('.unit6-menu-panel button');
            const first = buttons[0], last = buttons[buttons.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open]);
    return <>
        <button type="button" className="unit6-menu-button" aria-label="เปิดเมนูบท 6" onClick={(event) => { event.stopPropagation(); setOpen(true); }}><span aria-hidden="true">☰</span></button>
        {open && <div className="unit6-menu-overlay" onClick={(event) => event.stopPropagation()}>
            <section className="unit6-menu-panel" role="dialog" aria-modal="true" aria-label="เมนูบท 6">
                <h2>พักการเล่น</h2>
                <button type="button" autoFocus onClick={() => setOpen(false)}>เล่นต่อ</button>
                <button type="button" onClick={() => navigate('/map')}>กลับหน้าหลัก</button>
            </section>
        </div>}
    </>;
}
