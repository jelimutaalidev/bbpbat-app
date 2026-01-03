// src/components/main/AttendanceSkeleton.tsx
import React from 'react';

const AttendanceSkeleton: React.FC = () => {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded-md w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
            <div className="bg-gray-100 rounded-lg p-6 h-48"></div>
            <div className="bg-gray-100 rounded-lg p-6 h-64"></div>
            <div className="bg-gray-100 rounded-lg p-6 h-40"></div>
            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gray-100 rounded-lg h-24"></div>
                <div className="bg-gray-100 rounded-lg h-24"></div>
                <div className="bg-gray-100 rounded-lg h-24"></div>
            </div>
        </div>
    );
};

export default AttendanceSkeleton;