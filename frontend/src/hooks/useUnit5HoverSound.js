import { useEffect } from 'react';
import { useSound } from './useSound';
import useGameMuted from './useGameMuted';
import hoverSound from '../assets/sounds/Unit5/button-hover.mp3';

export default function useUnit5HoverSound(pathname) {
    const [muted] = useGameMuted();
    const { play, stop } = useSound(hoverSound, { volume: 0.3, preload: true });
    useEffect(() => {
        if (pathname.replace(/\/$/, '') === '/map') return;
        const inUnit5 = pathname.startsWith('/unit5/') || pathname === '/unit/unit5';
        const onHover = (event) => {
            if (muted) return;
            const target = event.target.closest?.('button, a[href], [role="button"], [data-unit-id="5"]');
            if (!target || target.disabled || target.getAttribute('aria-disabled') === 'true') return;
            if (event.relatedTarget instanceof Node && target.contains(event.relatedTarget)) return;
            if (inUnit5 || target.getAttribute('data-unit-id') === '5') play();
        };
        document.addEventListener('mouseover', onHover, true);
        return () => document.removeEventListener('mouseover', onHover, true);
    }, [pathname, muted, play]);
    useEffect(() => { if (muted) stop(); }, [muted, stop]);
    useEffect(() => stop, [stop]);
}
