import hamburguesaImg from '../assets/silueta de hamburguesa gris.png';

function BurgerLane({ direction, size, duration }) {
    const burgers = Array.from({ length: 10 });

    return (
        <div
            className="flex flex-col items-center"
            style={{
                animation: `${direction === 'up' ? 'scroll-up' : 'scroll-down'} ${duration}s linear infinite`,
            }}
        >
            {[0, 1].map((rep) => (
                <div key={rep} className="flex flex-col items-center">
                    {burgers.map((_, i) => (
                        <img
                            key={i}
                            src={hamburguesaImg}
                            alt=""
                            className="select-none block"
                            style={{
                                width: size,
                                opacity: 0.15,
                                marginBottom: '3rem',
                            }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

function FloatingBurgers() {
    const carriles = Array.from({ length: 9 }, (_, i) => ({
        direction: i % 2 === 0 ? 'up' : 'down',
        size: '100rem',
        duration: 20 + (i % 4) * 5,
    }));

    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div
                className="absolute flex justify-between"
                style={{
                    top: '-30%',
                    left: '-20%',
                    width: '140%',
                    height: '160%',
                    transform: 'rotate(-18deg)',
                }}
            >
                {carriles.map((carril, i) => (
                    <BurgerLane key={i} {...carril} />
                ))}
            </div>
        </div>
    );
}

export default FloatingBurgers;