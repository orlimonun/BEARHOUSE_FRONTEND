import { useState, useRef, useEffect } from 'react';
import BearMascot from '../components/BearMascot';
import { useAuth } from '../context/useAuth';
import FloatingBurgers from '../components/FloatingBurgers';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const [escribiendoPassword, setEscribiendoPassword] = useState(false);
    const debounceRef = useRef(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);

        try {
            await login(usuario, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Usuario o contraseña incorrectos');
            console.error(err);
        } finally {
            setCargando(false);
        }
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setEscribiendoPassword(true);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            setEscribiendoPassword(false);
        }, 500);
    };

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-bear-black relative overflow-hidden">
            <FloatingBurgers />
            {/* Cinta superior dorada */}
            <div
                className="absolute top-0 left-0 w-full h-20 flex items-center justify-end pr-10 z-20"
                style={{
                    backgroundColor: 'var(--color-bear-gold)',
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
                    boxShadow: '0 0 30px rgba(244,183,49,0.5)',
                }}
            >
  <span className="font-extrabold text-bear-black text-lg tracking-wide">
    BEAR HOUSE
  </span>
            </div>

            {/* Cinta inferior rosa neón */}
            <div
                className="absolute bottom-0 left-0 w-full h-20 flex items-center pl-10 z-20"
                style={{
                    backgroundColor: 'var(--color-bear-pink)',
                    clipPath: 'polygon(0 0, 100% 100%, 0 100%)',
                    boxShadow: '0 0 30px rgba(233,30,99,0.65)',
                }}
            >
  <span className="font-semibold text-white text-xs tracking-wide">
    © {new Date().getFullYear()} BEAR HOUSE BURGER — Propiedad intelectual de OrlimonunProjects
  </span>
            </div>
            <form
                onSubmit={handleSubmit}
                className="relative z-10 bg-bear-dark p-8 rounded-2xl shadow-2xl shadow-black/50 w-full max-w-sm border border-bear-gold/20"
            >
                <BearMascot tapado={escribiendoPassword} />
                <h1 className="text-4xl font-extrabold text-bear-gold mb-1 text-center tracking-wide"
                    style={{ textShadow: '0 0 20px rgba(244,183,49,0.4)' }}>
                    BEAR HOUSE
                </h1>
                <p className="text-bear-pink text-center text-sm font-semibold mb-6 tracking-widest">
                    BURGER
                </p>

                <div className="mb-4">
                    <label className="block text-neutral-300 mb-1 text-sm">Usuario</label>
                    <input
                        type="text"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-black/40 text-white outline-none border border-bear-gold/20 focus:border-bear-gold focus:ring-1 focus:ring-bear-gold transition"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-neutral-300 mb-1 text-sm">Contraseña</label>
                    <input
                        type="password"
                        value={password}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 rounded-lg bg-black/40 text-white outline-none border border-bear-gold/20 focus:border-bear-gold focus:ring-1 focus:ring-bear-gold transition"
                        required
                    />
                </div>

                {error && (
                    <p className="text-bear-red text-sm mb-4">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={cargando}
                    className="w-full bg-bear-gold hover:bg-bear-amber text-bear-black font-bold py-2 rounded-lg transition disabled:opacity-50"
                >
                    {cargando ? 'Ingresando...' : 'Ingresar'}
                </button>
            </form>
        </div>
    );
}

export default LoginPage;