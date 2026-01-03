import React, { useState, useEffect, useCallback, useMemo } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import {
  getParticipantAttendance,
  submitParticipantAttendance,
} from "../../api/apiService";
import IzinSakitModal from "./IzinSakitModal";

import { AttendanceProps, AttendanceRecord } from "../../types/attendance";
import { useGeolocation } from "../../hooks/useGeolocation";

import LocationStatusCard from "./attendance/LocationStatusCard";
import TodayAttendanceCard from "./attendance/TodayAttendanceCard";
import AttendanceHistoryList from "./attendance/AttendanceHistoryList";
import AttendanceStats from "./attendance/AttendanceStats";

const Attendance: React.FC<AttendanceProps> = ({ userData }) => {
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLeaveModalOpen, setLeaveModalOpen] = useState(false);

  const { locationStatus, checkLocation } = useGeolocation();

  const fetchAttendanceHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getParticipantAttendance();
      setHistory(response.data);
    } catch (err) {
      console.error("Gagal mengambil riwayat absensi:", err);
      setError("Gagal memuat riwayat absensi.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userData.profileComplete && userData.documentsComplete) {
      fetchAttendanceHistory();
      checkLocation();
    } else {
      setIsLoading(false);
    }
  }, [
    userData.profileComplete,
    userData.documentsComplete,
    fetchAttendanceHistory,
    checkLocation,
  ]);

  const handleAttendanceClick = async () => {
    const loadingToast = toast.loading("Memverifikasi ulang lokasi...");
    const isInRange = await checkLocation();
    if (!isInRange) {
      toast.error("Anda harus berada di dalam area BBPBAT untuk absen.", {
        id: loadingToast,
      });
      return;
    }
    toast.loading("Mengirim data absensi...", { id: loadingToast });
    setIsSubmitting(true);
    try {
      const response = await submitParticipantAttendance();
      toast.success(response.data.detail, { id: loadingToast });
      await fetchAttendanceHistory();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail || "Gagal melakukan absensi.";
      toast.error(errorMessage, { id: loadingToast });
      console.error("Error saat absen:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayString = new Date().toISOString().split("T")[0];
  const todayAttendance = useMemo(
    () => history.find((record) => record.tanggal === todayString),
    [history, todayString]
  );
  const isWeekend = useMemo(() => {
    const today = new Date();
    const day = today.getDay();
    return day === 0 || day === 6;
  }, []);
  const canCheckIn = !isWeekend && !todayAttendance;
  const canCheckOut =
    !isWeekend && todayAttendance?.jam_masuk && !todayAttendance?.jam_keluar;

  const { attendanceModifiers, attendanceModifiersStyles, stats } = useMemo(() => {
    const modifiers = {
      hadir: history
        .filter((d) => d.status === "hadir")
        .map((d) => new Date(d.tanggal + "T00:00:00")),
      izin: history
        .filter((d) => d.status === "izin")
        .map((d) => new Date(d.tanggal + "T00:00:00")),
      sakit: history
        .filter((d) => d.status === "sakit")
        .map((d) => new Date(d.tanggal + "T00:00:00")),
      alpha: history
        .filter((d) => d.status === "alpha")
        .map((d) => new Date(d.tanggal + "T00:00:00")),
    };
    const styles = {
      hadir: {
        backgroundColor: "#D1FAE5",
        color: "#065F46",
        borderRadius: "50%",
      },
      izin: {
        backgroundColor: "#FEF3C7",
        color: "#92400E",
        borderRadius: "50%",
      },
      sakit: {
        backgroundColor: "#FEE2E2",
        color: "#991B1B",
        borderRadius: "50%",
      },
      alpha: {
        backgroundColor: "#F3F4F6",
        color: "#374151",
        borderRadius: "50%",
      },
    };
    const totalHadir = modifiers.hadir.length;
    const totalDays = history.length;
    const calculatedStats = {
      totalHadir,
      totalIzin: modifiers.izin.length,
      totalSakit: modifiers.sakit.length,
      totalAlpha: modifiers.alpha.length,
      kehadiranPersen:
        totalDays > 0 ? Math.round((totalHadir / totalDays) * 100) : 0,
    };
    return {
      attendanceModifiers: modifiers,
      attendanceModifiersStyles: styles,
      stats: calculatedStats,
    };
  }, [history]);

  const formatDate = (dateString: string) =>
    new Date(dateString + "T00:00:00").toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (!userData.profileComplete || !userData.documentsComplete) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-orange-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-orange-800 mb-2">Akses Terbatas</h3>
            <p className="text-orange-700">
              Untuk mengakses fitur absensi, Anda harus melengkapi profil dan
              dokumen wajib terlebih dahulu.
            </p>
          </div>
        </div>
      </div>
    );
  }
  if (isLoading && history.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        <span className="ml-2">Memuat data...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center py-10 text-red-600 bg-red-50 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />
      <IzinSakitModal
        isOpen={isLeaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        onSuccess={() => {
          setLeaveModalOpen(false);
          fetchAttendanceHistory();
        }}
      />

      <div>
        <h1 className="text-2xl font-bold text-gray-800">Absensi Kehadiran</h1>
        <p className="text-gray-600">
          Lakukan absensi harian dan pantau riwayat kehadiran Anda.
        </p>
      </div>

      <LocationStatusCard
        locationStatus={locationStatus}
        onCheckLocation={checkLocation}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TodayAttendanceCard
            todayAttendance={todayAttendance}
            isWeekend={isWeekend}
            isSubmitting={isSubmitting}
            canCheckIn={canCheckIn}
            canCheckOut={!!canCheckOut}
            locationInRange={locationStatus.inRange}
            onAttendanceClick={handleAttendanceClick}
            onLeaveClick={() => setLeaveModalOpen(true)}
            formatDate={formatDate}
          />

          <AttendanceHistoryList history={history} formatDate={formatDate} />
        </div>

        <AttendanceStats
          stats={stats}
          attendanceModifiers={attendanceModifiers}
          attendanceModifiersStyles={attendanceModifiersStyles}
        />
      </div>
    </div>
  );
};

export default Attendance;
