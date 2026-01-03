import React from 'react';

interface WelcomeSectionProps {
    name: string;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ name }) => {
    return (
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg p-6 text-white shadow-lg">
            <h1 className="text-2xl font-bold mb-2">
                Selamat Datang, {name || 'Peserta'}!
            </h1>
            <p className="opacity-90">
                Ringkasan progres dan informasi penting Anda selama program BIMTEK.
            </p>
        </div>
    );
};

export default WelcomeSection;
