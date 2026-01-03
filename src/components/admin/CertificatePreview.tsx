import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Upload, X, Eye } from 'lucide-react';

interface CertificatePreviewProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        nama: string;
        nomorSertifikat: string;
        institusi: string;
        penempatan: string;
        tanggalMulai: string;
        tanggalSelesai: string;
        tanggalTerbit: string;
    } | null;
}

const CertificatePreview: React.FC<CertificatePreviewProps> = ({ isOpen, onClose, data }) => {
    const certificateRef = useRef<HTMLDivElement>(null);
    const [templateImage, setTemplateImage] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    if (!isOpen || !data) return null;

    const handleTemplateUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setTemplateImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDownloadPDF = async () => {
        if (!certificateRef.current) return;
        setIsDownloading(true);

        try {
            const canvas = await html2canvas(certificateRef.current, {
                scale: 2, // Higher quality
                useCORS: true,
                logging: false,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height] // Match canvas dimensions
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`Sertifikat_${data.nama.replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            console.error("Gagal generate PDF:", error);
            alert("Gagal membuat PDF. Silakan coba lagi.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-indigo-600" />
                        Preview Sertifikat
                    </h2>
                    <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                            <Upload className="w-4 h-4" />
                            Upload Template Bersih
                            <input type="file" accept="image/*" className="hidden" onChange={handleTemplateUpload} />
                        </label>
                        <button
                            onClick={handleDownloadPDF}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-wait"
                            disabled={isDownloading}
                        >
                            {isDownloading ? 'Memproses...' : (
                                <>
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </>
                            )}
                        </button>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-auto p-8 bg-gray-100 flex items-center justify-center">
                    {/* Certificate Canvas */}
                    {/* Ukuran A4 Landscape aspect ratio approx 297mm x 210mm (1.414) */}
                    <div
                        ref={certificateRef}
                        className="relative bg-white shadow-lg mx-auto"
                        style={{
                            width: '1123px', // A4 at 96 DPI * scale factor approx
                            height: '794px',
                            backgroundImage: templateImage ? `url(${templateImage})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        {!templateImage && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-50 border-2 border-dashed border-gray-300 m-8 rounded-lg">
                                <Upload className="w-16 h-16 mb-4 opacity-50" />
                                <p className="text-lg font-medium">Silakan upload gambar template sertifikat yang bersih (tanpa teks)</p>
                                <p className="text-sm mt-2">Format: JPG atau PNG (Landscape)</p>
                            </div>
                        )}

                        {/* Overlay Text - Absolute Positioning based on Standard Layout */}
                        {/* Adjust these coordinates based on the actual template layout */}

                        {/* Nomor Sertifikat */}
                        <div className="absolute w-full text-center" style={{ top: '38%', left: 0 }}>
                            <p className="text-xl font-sans text-gray-800 tracking-wide font-medium">Nomor: {data.nomorSertifikat}</p>
                        </div>

                        {/* Nama Peserta */}
                        <div className="absolute w-full text-center px-20" style={{ top: '48%', left: 0 }}>
                            <h1 className="text-5xl font-serif font-bold text-gray-900 uppercase tracking-wider">{data.nama}</h1>
                        </div>

                        {/* Institusi */}
                        <div className="absolute w-full text-center" style={{ top: '56%', left: 0 }}>
                            <p className="text-2xl font-serif text-gray-700">{data.institusi}</p>
                        </div>

                        {/* Unit Penempatan */}
                        <div className="absolute w-full text-center" style={{ top: '63%', left: 0 }}>
                            <p className="text-xl font-sans text-gray-800 font-medium">
                                Unit Penempatan: <span className="uppercase">{data.penempatan}</span>
                            </p>
                        </div>

                        {/* Periode */}
                        <div className="absolute w-full text-center" style={{ top: '68%', left: 0 }}>
                            <p className="text-lg font-sans text-gray-600">
                                {data.tanggalMulai} - {data.tanggalSelesai}
                            </p>
                        </div>

                        {/* Tanggal Terbit (Kanan Bawah) */}
                        <div className="absolute text-left" style={{ bottom: '18%', right: '23%', width: '300px' }}>
                            <p className="text-lg font-sans text-gray-800">Sukabumi, {data.tanggalTerbit}</p>
                        </div>
                    </div>
                </div>

                {/* Footer info */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
                    <p>Pastikan template gambar beresolusi tinggi untuk hasil terbaik.</p>
                    <p>Sistem Sertifikat Hybrid v1.0</p>
                </div>
            </div>
        </div>
    );
};

export default CertificatePreview;
