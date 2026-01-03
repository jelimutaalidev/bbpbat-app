import React from "react";
import { FileText, Loader2, CheckCircle, Clock } from "lucide-react";
import { AttendanceRecord } from "../../../types/attendance";

interface TodayAttendanceCardProps {
    todayAttendance?: AttendanceRecord;
    isWeekend: boolean;
    isSubmitting: boolean;
    canCheckIn: boolean;
    canCheckOut: boolean;
    locationInRange: boolean;
    onAttendanceClick: () => void;
    onLeaveClick: () => void;
    formatDate: (date: string) => string;
}

const TodayAttendanceCard: React.FC<TodayAttendanceCardProps> = ({
    todayAttendance,
    isWeekend,
    isSubmitting,
    canCheckIn,
    canCheckOut,
    locationInRange,
    onAttendanceClick,
    onLeaveClick,
    formatDate,
}) => {
    const todayString = new Date().toISOString().split("T")[0];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                    Absensi Hari Ini ({formatDate(todayString)})
                </h2>
                <button
                    onClick={onLeaveClick}
                    disabled={!!todayAttendance || isWeekend}
                    title={
                        todayAttendance
                            ? "Tidak dapat mengajukan karena sudah ada absensi hari ini."
                            : isWeekend
                                ? "Tidak dapat mengajukan di hari libur."
                                : "Ajukan Izin atau Sakit"
                    }
                    className="text-sm bg-yellow-50 text-yellow-800 font-medium px-3 py-1.5 rounded-lg hover:bg-yellow-100 flex items-center gap-2 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                    <FileText size={16} /> Ajukan Izin/Sakit
                </button>
            </div>

            {isWeekend ? (
                <div className="text-center p-4 bg-gray-100 rounded-md">
                    Hari ini libur, tidak ada absensi.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div>
                        <h3 className="font-medium text-gray-700 mb-2">Jam Masuk</h3>
                        {todayAttendance && todayAttendance.status !== "hadir" ? (
                            <div className="p-3 bg-gray-100 text-gray-800 rounded-lg font-bold text-center text-lg capitalize">
                                {todayAttendance.status}
                            </div>
                        ) : todayAttendance?.jam_masuk ? (
                            <div className="p-3 bg-green-50 text-green-800 rounded-lg font-bold text-center text-lg">
                                {todayAttendance.jam_masuk}
                            </div>
                        ) : (
                            <button
                                onClick={onAttendanceClick}
                                disabled={!locationInRange || isSubmitting || !canCheckIn}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                            >
                                {isSubmitting && canCheckIn ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <CheckCircle />
                                )}
                                Absen Masuk
                            </button>
                        )}
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-700 mb-2">Jam Keluar</h3>
                        {todayAttendance && todayAttendance.status !== "hadir" ? (
                            <div className="p-3 bg-gray-100 text-gray-800 rounded-lg font-bold text-center text-lg capitalize">
                                {todayAttendance.status}
                            </div>
                        ) : todayAttendance?.jam_keluar ? (
                            <div className="p-3 bg-indigo-50 text-indigo-800 rounded-lg font-bold text-center text-lg">
                                {todayAttendance.jam_keluar}
                            </div>
                        ) : (
                            <button
                                onClick={onAttendanceClick}
                                disabled={!locationInRange || isSubmitting || !canCheckOut}
                                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                            >
                                {isSubmitting && canCheckOut ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <Clock />
                                )}
                                Absen Keluar
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TodayAttendanceCard;
