export default function GameStyle() {
    return (
        <style
            dangerouslySetInnerHTML={{
                __html: `
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-8px); }
                        75% { transform: translateX(8px); }
                    }

                    .animate-shake {
                        animation: shake 0.2s ease-in-out 0s 2;
                    }
                `,
            }}
        />
    );
}