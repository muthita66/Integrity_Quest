import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSound } from '../../../hooks/useSound';
import useGameMuted from '../../../hooks/useGameMuted';
import constructionMusic from '../../../assets/sounds/Unit5/level3-construction.mp3';

export default function Level3Music() {
    const { pathname } = useLocation();
    const active = ['/unit5/game3', '/unit5/game3/intro', '/unit5/level3/game'].includes(pathname.replace(/\/$/, ''));
    const [muted] = useGameMuted();
    const { play, stop } = useSound(constructionMusic, { volume: 0.4, loop: true, retryOnInteract: true });
    useEffect(() => {
        if (active && !muted) play();
        else stop();
        return stop;
    }, [active, muted, play, stop]);
    return null;
}
