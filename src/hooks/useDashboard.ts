import { useState, useEffect, useCallback } from 'react';
import { getParticipantDashboard, getAnnouncementDetail } from '../api/apiService';
import { DashboardData, Pengumuman } from '../types/dashboard';

export const useDashboard = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getParticipantDashboard();
            setData(response.data);
        } catch (err) {
            console.error("Gagal mengambil data dashboard:", err);
            setError("Gagal memuat data dashboard.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return { data, loading, error, refetch: fetchDashboardData };
};

export const useAnnouncement = () => {
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Pengumuman | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAnnouncementDetail = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAnnouncementDetail(id);
            setSelectedAnnouncement(response.data);
        } catch (err) {
            console.error("Gagal mengambil detail pengumuman:", err);
            setError("Gagal memuat detail pengumuman.");
        } finally {
            setLoading(false);
        }
    }, []);

    const clearAnnouncement = useCallback(() => {
        setSelectedAnnouncement(null);
        setError(null);
    }, []);

    return {
        selectedAnnouncement,
        loading,
        error,
        fetchAnnouncementDetail,
        clearAnnouncement
    };
};
