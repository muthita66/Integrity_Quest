import { useEffect } from 'react';
import { useSound } from './useSound';
import useGameMuted from './useGameMuted';
import hoverSound from '../assets/sounds/Unit6/button-hover.mp3';

export default function useMapHoverSound() {
    const [muted] = useGameMuted();
    const { play, stop } = useSound(hoverSound, { volume: 0.35, preload: true });
    useEffect(() => {
        const onHover = (event) => {
            if (muted) return;
            const target = event.target.closest?.('button, a[href], [role="button"], [data-unit-id], .map-stone.clickable');
            if (!target || target.disabled || target.getAttribute('aria-disabled') === 'true' || target.classList.contains('locked')) return;
            if (event.relatedTarget instanceof Node && target.contains(event.relatedTarget)) return;
            play();
        };
        document.addEventListener('mouseover', onHover, true);
        return () => document.removeEventListener('mouseover', onHover, true);
    }, [muted, play]);
    useEffect(() => { if (muted) stop(); }, [muted, stop]);
    useEffect(() => stop, [stop]);
}
