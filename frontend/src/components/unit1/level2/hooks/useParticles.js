import { useCallback, useEffect, useRef, useState } from "react";

const PARTICLE_AMOUNT = 6;
const PARTICLE_REMOVE_DELAY = 1500;

export default function useParticles() {
    const [particles, setParticles] = useState([]);
    const timeoutIdsRef = useRef([]);

    const createParticles = useCallback((bubble) => {
        const createdAt = Date.now();

        const newParticles = Array.from(
            { length: PARTICLE_AMOUNT },
            (_, index) => ({
                id: `${createdAt}-${index}-${Math.random()}`,
                x: bubble.x,
                y: bubble.y,
                size: Math.random() * 20 + 10,
                offsetX: (Math.random() - 0.5) * 100,
                duration: Math.random() * 0.5 + 0.5,
            })
        );

        setParticles((previousParticles) => [
            ...previousParticles,
            ...newParticles,
        ]);

        const particleIds = new Set(
            newParticles.map((particle) => particle.id)
        );

        const timeoutId = window.setTimeout(() => {
            setParticles((previousParticles) =>
                previousParticles.filter(
                    (particle) => !particleIds.has(particle.id)
                )
            );

            timeoutIdsRef.current =
                timeoutIdsRef.current.filter(
                    (savedTimeoutId) =>
                        savedTimeoutId !== timeoutId
                );
        }, PARTICLE_REMOVE_DELAY);

        timeoutIdsRef.current.push(timeoutId);
    }, []);

    const clearParticles = useCallback(() => {
        timeoutIdsRef.current.forEach((timeoutId) => {
            window.clearTimeout(timeoutId);
        });

        timeoutIdsRef.current = [];
        setParticles([]);
    }, []);

    useEffect(() => {
        return () => {
            timeoutIdsRef.current.forEach((timeoutId) => {
                window.clearTimeout(timeoutId);
            });
        };
    }, []);

    return {
        particles,
        createParticles,
        clearParticles,
    };
}