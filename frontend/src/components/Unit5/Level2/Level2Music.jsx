import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSound } from '../../../hooks/useSound';
import useGameMuted from '../../../hooks/useGameMuted';
import gameMusic from '../../../assets/sounds/Unit5/level2-corporate-calm.mp3';

export default function Level2Music() {
    const { pathname } = useLocation();
    const active = ['/unit5/game2', '/unit5/level2/game', '/unit5/result'].includes(pathname.replace(/\/$/, ''));
    const [muted] = useGameMuted();
    const { play, stop } = useSound(gameMusic, { volume: 0.4, loop: true, retryOnInteract: true });
    useEffect(() => {
        if (active && !muted) play();
        else stop();
        return stop;
    }, [active, muted, play, stop]);
    return null;
}
