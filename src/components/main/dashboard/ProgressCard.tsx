import React from 'react';
import { CalendarClock } from 'lucide-react';
import { ProgresProgram } from '../../../types/dashboard';

interface ProgressCardProps {
    progres: ProgresProgram;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ progres }) => {
    return (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="bg-sky-100 rounded-lg p-2 w-min mb-4">
                <CalendarClock className="w-6 h-6 text-sky-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">
                {progres.sisa_hari} <span className="text-lg font-medium text-gray-500">hari</span>
            </h3>
            <p className="text-gray-600 text-sm font-medium">Sisa Waktu Program</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                    className="bg-sky-600 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progres.persentase_selesai}%` }}
                ></div>
            </div>
        </div>
    );
};

export default ProgressCard;
