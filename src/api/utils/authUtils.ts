/**
 * Fungsi logout terpusat.
 * Menghapus semua data sesi dan mengarahkan pengguna ke halaman utama.
 * Diekspor agar bisa digunakan di komponen lain jika perlu (misal: tombol logout).
 */
export const clearAuthStorage = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user'); // Pastikan data user juga dihapus
};

export const logoutAndRedirect = () => {
    console.error("Sesi tidak valid atau telah berakhir. Mengarahkan ke halaman utama.");
    clearAuthStorage();

    // Mengarahkan ke root (/) akan membuat App.tsx mengevaluasi ulang
    // status otentikasi dari awal, ini adalah cara paling bersih.
    window.location.href = '/';
};
