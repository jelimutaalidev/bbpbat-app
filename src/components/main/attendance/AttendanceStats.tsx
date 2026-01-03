import React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { id as indonesiaLocale } from "date-fns/locale";
import { AttendanceStats as StatsType } from "../../../types/attendance";

interface AttendanceStatsProps {
    stats: StatsType;
    attendanceModifiers: any;
    attendanceModifiersStyles: any;
}

const AttendanceStats: React.FC<AttendanceStatsProps> = ({
    stats,
    attendanceModifiers,
    attendanceModifiersStyles,
}) => {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex justify-center">
                <DayPicker
                    mode="single"
                    selected={new Date()}
                    locale={indonesiaLocale}
                    modifiers={attendanceModifiers}
                    modifiersStyles={attendanceModifiersStyles}
                    footer={
                        <p className="text-xs text-center text-gray-500 pt-2">
                            Riwayat kehadiran Anda.
                        </p>
                    }
                />
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-3">Ringkasan Total</h3>
                <div className="space-y-2 text-sm">
                    <p className="flex justify-between">
                        <span>Persentase Hadir:</span>{" "}
                        <strong className="text-green-600">{stats.kehadiranPersen}%</strong>
                    </p>
                    <p className="flex justify-between">
                        <span>Total Hadir:</span> <strong>{stats.totalHadir} hari</strong>
                    </p>
                    <p className="flex justify-between">
                        <span>Total Izin:</span> <strong>{stats.totalIzin} hari</strong>
                    </p>
                    <p className="flex justify-between">
                        <span>Total Sakit:</span> <strong>{stats.totalSakit} hari</strong>
                    </p>
                    <p className="flex justify-between">
                        <span>Total Alpha:</span> <strong>{stats.totalAlpha} hari</strong>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AttendanceStats;
