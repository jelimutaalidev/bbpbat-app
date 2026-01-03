import React from "react";
import { MessageSquare } from "lucide-react";
import { AttendanceRecord } from "../../../types/attendance";

interface AttendanceHistoryListProps {
    history: AttendanceRecord[];
    formatDate: (date: string) => string;
}

const AttendanceHistoryList: React.FC<AttendanceHistoryListProps> = ({
    history,
    formatDate,
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 p-6 border-b">
                Daftar Riwayat
            </h2>
            <div className="space-y-1 p-6 max-h-96 overflow-y-auto">
                {history.length > 0 ? (
                    [...history].reverse().map((record) => (
                        <div
                            key={record.id}
                            className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-md"
                        >
                            <div>
                                <p className="font-medium">{formatDate(record.tanggal)}</p>
                                <p className="text-sm text-gray-500">
                                    Masuk: {record.jam_masuk || "-"} | Keluar:{" "}
                                    {record.jam_keluar || "-"}
                                </p>
                                {record.keterangan && (
                                    <div className="mt-1.5 flex items-start gap-2 text-sm text-gray-600">
                                        <MessageSquare
                                            size={14}
                                            className="flex-shrink-0 mt-0.5 text-gray-400"
                                        />
                                        <p className="italic">"{record.keterangan}"</p>
                                    </div>
                                )}
                            </div>
                            <span
                                className={`text-xs px-2 py-1 rounded-full font-semibold ${record.status === "hadir"
                                        ? "bg-green-100 text-green-800"
                                        : record.status === "izin"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : record.status === "sakit"
                                                ? "bg-red-100 text-red-800"
                                                : "bg-gray-100 text-gray-800"
                                    }`}
                            >
                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-8">
                        Belum ada riwayat absensi.
                    </p>
                )}
            </div>
        </div>
    );
};

export default AttendanceHistoryList;
