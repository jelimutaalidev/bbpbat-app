import React from 'react';
import { UserCheck } from 'lucide-react';

interface AttendanceCardProps {
    totalHadir: number;
}

const AttendanceCard: React.FC<AttendanceCardProps> = ({ totalHadir }) => {
    return (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="bg-green-100 rounded-lg p-2 w-min mb-4">
                <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">{totalHadir}</h3>
            <p className="text-gray-600 text-sm font-medium">Total Kehadiran</p>
        </div>
    );
};

export default AttendanceCard;
