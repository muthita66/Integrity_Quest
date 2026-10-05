import { useEffect } from 'react';
import { useSound } from './useSound';
import useGameMuted from './useGameMuted';
import clickSound from '../assets/sounds/Unit6/button-click.mp3';

export default function useUnit6ClickSound(pathname) {
    const [muted] = useGameMuted();
    const { play, stop } = useSound(clickSound, { volume: 0.6, preload: true });
    useEffect(() => {
        const inUnit6 = pathname.startsWith('/unit6/') || pathname === '/unit6' || pathname === '/unit/unit6';
        const onClick = (event) => {
            if (muted) return;
            const target = event.target.closest?.('button, a[href], [role="button"], [data-unit-id="6"]');
            if (!target || target.disabled || target.getAttribute('aria-disabled') === 'true') return;
            if (inUnit6 || target.getAttribute('data-unit-id') === '6') play();
        };
        document.addEventListener('click', onClick, true);
        return () => document.removeEventListener('click', onClick, true);
    }, [pathname, muted, play]);
    useEffect(() => { if (muted) stop(); }, [muted, stop]);
    useEffect(() => stop, [stop]);
}
