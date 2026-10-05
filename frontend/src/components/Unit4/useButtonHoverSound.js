import { useEffect } from 'react';
import { useSound } from '../../hooks/useSound';
import useGameMuted from '../../hooks/useGameMuted';
import useBackgroundMusic from '../../hooks/useBackgroundMusic';
import hoverSound from '../../assets/sounds/Unit4/unit4-button-hover.mp3';
import level1Music from '../../assets/sounds/Unit4/unit4-level1-crime-reveal.mp3';

export default function useButtonHoverSound() {
    const [muted] = useGameMuted();
    useBackgroundMusic(level1Music, { volume: 0.15, muted });
    const { play, stop } = useSound(hoverSound, { volume: 0.35 });
    useEffect(() => {
        const onHover = (event) => {
            const button = event.target.closest?.('button');
            if (!muted && button && !button.contains(event.relatedTarget)) play();
        };
        document.addEventListener('mouseover', onHover);
        return () => { document.removeEventListener('mouseover', onHover); stop(); };
    }, [muted, play, stop]);
}
