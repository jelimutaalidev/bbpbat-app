import React, { useState } from 'react';
// FIX 1: Menambahkan 'ArrowLeft' ke dalam import
import { LogIn, AlertCircle, Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { loginUser } from '../api/apiService';
import { useNavigate } from 'react-router-dom';

// Interface dan tipe data tetap sama
import type { NavigationState } from '../App';

interface LoginPageProps {
    onNavigate: (page: NavigationState) => void; // Deprecated but kept for type compatibility if needed
    onLogin: (isLoggedIn: boolean) => void;
}

// Komponen logo untuk ditempatkan di sisi kiri
const BrandLogo = () => (
    <div className="text-white text-center">
        <div className="bg-white/20 backdrop-blur-sm rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 border-2 border-white/30">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 15.5V8.5C2 7.64286 2.5 7 3.5 7H14.5C15.5 7 16 7.64286 16 8.5V15.5C16 16.3571 15.5 17 14.5 17H3.5C2.5 17 2 16.3571 2 15.5Z" stroke="white" strokeWidth="2" />
                <path d="M16 11H22L19 14H16" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                <path d="M5 14C6.10457 14 7 13.1046 7 12C7 10.8954 6.10457 10 5 10C3.89543 10 3 10.8954 3 12C3 13.1046 3.89543 14 5 14Z" stroke="white" strokeWidth="2" />
            </svg>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">BIMTEK BBPBAT</h1>
        <p className="mt-2 text-white/80">Platform Bimbingan Teknis Terintegrasi</p>
    </div>
);


const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const navigate = useNavigate();
    // Semua state dan logika handleLogin tetap sama
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!email || !password) {
            setError('Email dan Password wajib diisi.');
            return;
        }
        setLoading(true);
        try {
            const response = await loginUser(email, password);
            // Simpan token dengan key yang konsisten (untuk API & pengecekan refresh)
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            localStorage.setItem('authToken', response.data.access); // Untuk konsistensi API
            localStorage.setItem('refreshToken', response.data.refresh); // Untuk konsistensi API
            // Simpan userType ke localStorage (ambil dari response jika ada, fallback ke pelajar)
            if (response.data.userType) {
                localStorage.setItem('userType', response.data.userType);
            } else {
                localStorage.setItem('userType', 'pelajar'); // Default jika tidak ada
            }
            onLogin(true);
            navigate('/dashboard');
        } catch (err: any) {
            console.error("Login failed:", err);
            if (err.response && err.response.status === 401) {
                setError("Login gagal. Periksa kembali email dan password Anda.");
            } else {
                setError("Terjadi kesalahan pada server. Silakan coba lagi nanti.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
            {/* Kolom Kiri: Branding & Visual */}
            <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800 p-8">
                <BrandLogo />
            </div>

            {/* Kolom Kanan: Form Login */}
            <div className="flex flex-col items-center justify-center bg-gray-50 p-6 relative">
                <button
                    onClick={() => navigate('/')}
                    className="absolute top-6 left-6 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali
                </button>

                <div className="max-w-sm w-full">
                    <div className="text-center mb-8 lg:hidden">
                        <h1 className="text-2xl font-bold text-gray-800">Login Peserta</h1>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                        <div className="text-left mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">Selamat Datang!</h2>
                            <p className="text-gray-500 mt-1">Silakan masuk untuk melanjutkan.</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg flex items-center gap-3">
                                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </span>
                                    <input
                                        type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                        placeholder="contoh@email.com" required
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </span>
                                    <input
                                        type={showPassword ? 'text' : 'password'} id="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                        placeholder="••••••••" required
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700">
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-3">
                                <button type="submit" disabled={loading}
                                    className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Memverifikasi...</span>
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="w-5 h-5" />
                                            <span>Login</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-600">
                            Login sebagai Admin? <button onClick={() => navigate('/admin/login')} className="font-medium text-blue-600 hover:underline">Klik di sini</button>
                        </p>
                    </div>
                </div>
            </div>
        </div> // <-- FIX 2: Menambahkan tag penutup '</div>' yang hilang
    );
};

export default LoginPage;