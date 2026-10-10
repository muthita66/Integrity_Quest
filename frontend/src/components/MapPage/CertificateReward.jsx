import { BASE_URL } from "../../config";
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import template from '../../assets/certificate.png';
import './CertificateReward.css';

export default function CertificateReward({ onClose }) {
    const navigate = useNavigate();
    const [needsPostTest, setNeedsPostTest] = useState(false);
    const [image, setImage] = useState('');
    const [error, setError] = useState('');
    const canvasRef = useRef(null);
    const [downloading, setDownloading] = useState(false);
    const closeRef = useRef(null);
    useEffect(() => {
        let active = true;
        const previousFocus = document.activeElement;
        closeRef.current?.focus();
        const keydown = (event) => {
            if (event.key === 'Escape') onClose();
            if (event.key === 'Tab') {
                const buttons = [...closeRef.current.closest('[role="dialog"]').querySelectorAll('button, a[href]')];
                const first = buttons[0], last = buttons.at(-1);
                if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
                if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
            }
        };
        document.addEventListener('keydown', keydown);
        (async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/user-progress/certificate`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                const payload = await response.json();
                if (payload.code === 'POST_TEST_REQUIRED') {
                    if (active) { setNeedsPostTest(true); setError(payload.message); }
                    return;
                }
                if (!response.ok) throw new Error(payload.message || 'โหลดเกียรติบัตรไม่สำเร็จ');
                await document.fonts.ready;
                await document.fonts.load('400 32px "Certificate Nunito"', '3 October 2026');
                let nameFamily = '"Anuparp Thai", sans-serif';
                try {
                    const faces = await document.fonts.load('400 70px "Anuparp Thai"', payload.data.name);
                    if (!faces.length) throw new Error('Missing name font');
                } catch {
                    nameFamily = '"Sarabun", sans-serif';
                    await document.fonts.load('400 70px "Sarabun"', payload.data.name);
                }
                const background = new Image();
                background.src = template;
                await background.decode();
                const canvas = document.createElement('canvas');
                canvas.width = background.naturalWidth;
                canvas.height = background.naturalHeight;
                const ctx = canvas.getContext('2d');
                const w = canvas.width, h = canvas.height;
                ctx.drawImage(background, 0, 0);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#535f99';
                let size = w * 0.038;
                ctx.font = `400 ${size}px ${nameFamily}`;
                while (ctx.measureText(payload.data.name).width > w * 0.70 && size > 12) {
                    ctx.font = `400 ${--size}px ${nameFamily}`;
                }
                // Center the visible letters, including Thai marks, within the blank name area.
                ctx.textBaseline = 'alphabetic';
                const nameMetrics = ctx.measureText(payload.data.name);
                const nameBaseline = h * 0.445 + (nameMetrics.actualBoundingBoxAscent - nameMetrics.actualBoundingBoxDescent) / 2;
                ctx.fillText(payload.data.name, w / 2, nameBaseline);
                ctx.fillStyle = '#222';
                const date = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Bangkok' }).format(new Date(payload.data.completedAt));
                ctx.font = `400 ${w * 0.017}px "Certificate Nunito", sans-serif`;
                const dateMetrics = ctx.measureText(date);
                const dateBaseline = h * 0.602 + (dateMetrics.actualBoundingBoxAscent - dateMetrics.actualBoundingBoxDescent) / 2;
                ctx.fillText(date, w / 2, dateBaseline);
                if (active) {
                    canvasRef.current = canvas;
                    setImage(canvas.toDataURL('image/png'));
                }
            } catch (err) {
                if (active) setError(err.message);
            }
        })();
        return () => { active = false; document.removeEventListener('keydown', keydown); previousFocus?.focus(); };
    }, [onClose]);
    const downloadPdf = async () => {
        if (!canvasRef.current || downloading) return;
        setDownloading(true);
        try {
            const { jsPDF } = await import('jspdf');
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const canvas = canvasRef.current;
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const scale = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
            const width = canvas.width * scale;
            const height = canvas.height * scale;
            pdf.addImage(canvas, 'PNG', (pageWidth - width) / 2, (pageHeight - height) / 2, width, height);
            pdf.save('Integrity-Quest-Certificate.pdf');
        } catch {
            setError('ดาวน์โหลด PDF ไม่สำเร็จ กรุณาปิดแล้วลองใหม่');
        } finally {
            setDownloading(false);
        }
    };
    return <div className="certificate-backdrop" onClick={onClose}>
        <section className="certificate-dialog" role="dialog" aria-modal="true" aria-labelledby="certificate-title" onClick={(e) => e.stopPropagation()}>
            <div className="certificate-heading"><h2 id="certificate-title">รางวัลเกียรติบัตร</h2><button ref={closeRef} onClick={onClose} aria-label="ปิดเกียรติบัตร">✕</button></div>
            {error ? <><p role="alert">{error}</p>{needsPostTest && <div className="certificate-actions"><button className="certificate-download" onClick={() => navigate('/posttest')}>ไปทำ Post-test</button></div>}</> : image ? <>
                <div className="certificate-preview"><img src={image} alt="เกียรติบัตร Integrity Quest พร้อมชื่อผู้เล่นและวันที่เล่นจบ" /></div>
                <div className="certificate-actions"><button className="certificate-download" onClick={downloadPdf} disabled={downloading}>{downloading ? 'กำลังสร้าง PDF...' : 'ดาวน์โหลด PDF'}</button></div>
            </> : <p role="status">กำลังเตรียมเกียรติบัตร...</p>}
        </section>
    </div>;
}
