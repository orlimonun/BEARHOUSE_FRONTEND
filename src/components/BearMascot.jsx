import { useState, useRef, useEffect } from 'react';

function BearMascot({ tapado }) {
    const svgRef = useRef(null);
    const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (tapado) return; // no escuches el mouse mientras está tapado

        const RADIO_MAXIMO = 2.5;

        const handleMouseMove = (e) => {
            if (!svgRef.current) return;
            const rect = svgRef.current.getBoundingClientRect();
            const centroX = rect.left + rect.width / 2;
            const centroY = rect.top + rect.height / 2;

            const dx = e.clientX - centroX;
            const dy = e.clientY - centroY;
            const angulo = Math.atan2(dy, dx);

            setPupilOffset({
                x: Math.cos(angulo) * RADIO_MAXIMO,
                y: Math.sin(angulo) * RADIO_MAXIMO,
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [tapado]);

    return (
        <svg ref={svgRef} viewBox="0 0 200 200" className="w-24 h-24 mx-auto mb-3">
            {/* orejas */}
            <circle cx="55" cy="45" r="22" fill="#6b4226" />
            <circle cx="145" cy="45" r="22" fill="#6b4226" />
            <circle cx="55" cy="45" r="11" fill="#c98a52" />
            <circle cx="145" cy="45" r="11" fill="#c98a52" />

            {/* cuerpo, sentado */}
            <ellipse cx="100" cy="180" rx="68" ry="42" fill="#8a5a30" />

            {/* cabeza */}
            <circle cx="100" cy="100" r="65" fill="#8a5a30" />

            {/* hocico */}
            <ellipse cx="100" cy="122" rx="30" ry="22" fill="#c98a52" />
            <circle cx="100" cy="112" r="7" fill="#2a1a0f" />

            {tapado ? (
                <ellipse cx="100" cy="132" rx="10" ry="14" fill="#2a1a0f" />
            ) : (
                <path
                    d="M 85 130 Q 100 140 115 130"
                    stroke="#2a1a0f"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                />
            )}

            {tapado && (
                <>
                    <path d="M 68 72 Q 78 62 88 70" stroke="#2a1a0f" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                    <path d="M 112 70 Q 122 62 132 72" stroke="#2a1a0f" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                </>
            )}

            {/* ojos: base clara fija + pupila que sigue el mouse */}
            <circle cx="78" cy="90" r="9" fill="#1a1512" />
            <circle cx="122" cy="90" r="9" fill="#1a1512" />
            <circle
                cx={78 + (tapado ? 0 : pupilOffset.x)}
                cy={90 + (tapado ? 0 : pupilOffset.y)}
                r="6.5"
                fill="#f5ede1"
            />
            <circle
                cx={122 + (tapado ? 0 : pupilOffset.x)}
                cy={90 + (tapado ? 0 : pupilOffset.y)}
                r="7"
                fill="#f5ede1"
            />

            {/* patas que se deslizan para tapar los ojos */}
            <g
                style={{
                    transform: tapado ? 'translateY(0px)' : 'translateY(-75px)',
                    transition: 'transform 0.25s ease-out',
                }}
            >
                <ellipse cx="78" cy="90" rx="16" ry="14" fill="#8a5a30" stroke="#1a1512" strokeWidth="2.5" />
                <circle cx="67" cy="79" r="4.5" fill="#8a5a30" stroke="#1a1512" strokeWidth="2" />
                <circle cx="78" cy="76" r="4.5" fill="#8a5a30" stroke="#1a1512" strokeWidth="2" />
                <circle cx="89" cy="79" r="4.5" fill="#8a5a30" stroke="#1a1512" strokeWidth="2" />

                <ellipse cx="122" cy="90" rx="16" ry="14" fill="#8a5a30" stroke="#1a1512" strokeWidth="2.5" />
                <circle cx="111" cy="79" r="4.5" fill="#8a5a30" stroke="#1a1512" strokeWidth="2" />
                <circle cx="122" cy="76" r="4.5" fill="#8a5a30" stroke="#1a1512" strokeWidth="2" />
                <circle cx="133" cy="79" r="4.5" fill="#8a5a30" stroke="#1a1512" strokeWidth="2" />
            </g>
        </svg>
    );
}

export default BearMascot;