import { useEffect } from 'react';
import { useSound } from './useSound';
import useGameMuted from './useGameMuted';
import clickSound from '../assets/sounds/Unit5/button-click.mp3';

export default function useUnit5ClickSound(pathname) {
    const [muted] = useGameMuted();
    const { play, stop } = useSound(clickSound, { volume: 0.35, preload: true });
    useEffect(() => {
        const inUnit5 = pathname.startsWith('/unit5/') || pathname === '/unit/unit5';
        const onClick = (event) => {
            if (muted) return;
            const target = event.target.closest?.('button, a[href], [role="button"], [data-unit-id="5"]');
            if (!target || target.disabled || target.getAttribute('aria-disabled') === 'true') return;
            if (inUnit5 || target.getAttribute('data-unit-id') === '5') play();
        };
        document.addEventListener('click', onClick, true);
        return () => document.removeEventListener('click', onClick, true);
    }, [pathname, muted, play]);
    useEffect(() => { if (muted) stop(); }, [muted, stop]);
    useEffect(() => stop, [stop]);
}
