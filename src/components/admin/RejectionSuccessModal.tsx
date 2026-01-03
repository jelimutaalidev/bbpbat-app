import React from 'react';
import { X } from 'lucide-react';

// Interface untuk data yang akan ditampilkan di modal
interface RejectionData {
  name: string;
  phone: string;
  message: string;
  reason: string;
}

interface Props {
  data: RejectionData;
  onClose: () => void;
}

// Icon WhatsApp
const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.902-.539-5.625-1.546l-6.303 1.659v-.001zM7.472 21.012l.341.202c1.482.883 3.16.136 4.798.136 5.424 0 9.818-4.394 9.819-9.818.001-2.684-1.03-5.201-2.888-7.058-1.859-1.859-4.375-2.888-7.059-2.888-5.422 0-9.817 4.395-9.817 9.818 0 2.078.61 4.047 1.742 5.768l.223.362-1.142 4.162 4.25-1.117zM12.01 7.234c-.453 0-.823.37-.823.824v5.353c0 .453.37.823.823.823h5.353c.453 0 .823-.37.823-.823v-1.646c0-.453-.37-.824-.823-.824h-2.884V8.058c0-.454-.37-.824-.823-.824z"/>
    </svg>
);

const RejectionSuccessModal: React.FC<Props> = ({ data, onClose }) => {
  const { name, phone, message, reason } = data;

  const handleSendWhatsApp = () => {
    const formattedPhone = phone.replace(/\D/g, '').startsWith('0') 
      ? `62${phone.replace(/\D/g, '').substring(1)}` 
      : phone.replace(/\D/g, '');
    
    // Template pesan penolakan yang sopan
    const waMessage = `Yth. ${name},\n\nDengan berat hati kami informasikan bahwa pendaftaran Anda di BBPBAT Sukabumi belum dapat kami setujui saat ini.\n\nAlasan: ${reason}\n\nTerima kasih atas minat Anda. Anda dapat mencoba mendaftar kembali di lain waktu jika kesempatan tersedia.`;

    const encodedMessage = encodeURIComponent(waMessage);
    const waUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[60]">
      <div className="bg-white rounded-lg p-8 shadow-2xl max-w-md w-full m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Notifikasi Penolakan</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6"/></button>
        </div>
        <p className="mb-6 text-gray-600">{message}</p>
        
        <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-6">
            <p className="font-semibold text-red-800">Alasan Penolakan:</p>
            <p className="text-red-700 italic">"{reason}"</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition order-2 sm:order-1"
          >
            Tutup
          </button>
          <button
            onClick={handleSendWhatsApp}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition flex items-center justify-center order-1 sm:order-2"
          >
            <WhatsAppIcon />
            Kirim Notifikasi WA
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectionSuccessModal;