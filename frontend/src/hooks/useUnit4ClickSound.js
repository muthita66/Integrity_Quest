import { useEffect } from 'react';
import { useSound } from './useSound';
import useGameMuted from './useGameMuted';
import clickSound from '../assets/sounds/Unit4/unit4-button-click.mp3';

export default function useUnit4ClickSound(pathname) {
    const [muted] = useGameMuted();
    const { play, stop } = useSound(clickSound, { volume: 0.35 });
    useEffect(() => {
        const inUnit4 = pathname.startsWith('/unit4/') || pathname === '/unit/unit4';
        const onClick = (event) => {
            if (muted) return;
            const target = event.target.closest?.('button, a[href], [role="button"], [data-unit-id="4"]');
            if (!target || target.disabled || target.getAttribute('aria-disabled') === 'true') return;
            if (inUnit4 || target.getAttribute('data-unit-id') === '4') play();
        };
        document.addEventListener('click', onClick, true);
        return () => document.removeEventListener('click', onClick, true);
    }, [pathname, muted, play]);
    useEffect(() => { if (muted) stop(); }, [muted, stop]);
    useEffect(() => stop, [stop]);
}
