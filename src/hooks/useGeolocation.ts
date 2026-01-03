import { useState, useCallback } from "react";
import { calculateDistance } from "../utils/geo";

export const BBPBAT_LOCATION = {
    lat: -6.20626,
    lng: 106.83023,
    name: "BBPBAT Sukabumi",
    radius: 150,
};

export interface LocationStatus {
    loading: boolean;
    allowed: boolean;
    inRange: boolean;
    distance: number | null;
    error: string | null;
    coordinates: { lat: number; lng: number } | null;
}

export const useGeolocation = () => {
    const [locationStatus, setLocationStatus] = useState<LocationStatus>({
        loading: true,
        allowed: false,
        inRange: false,
        distance: null,
        error: null,
        coordinates: null,
    });

    const checkLocation = useCallback(() => {
        setLocationStatus((prev) => ({ ...prev, loading: true, error: null }));
        return new Promise<boolean>((resolve) => {
            if (!navigator.geolocation) {
                setLocationStatus({
                    loading: false,
                    allowed: false,
                    inRange: false,
                    distance: null,
                    error: "Geolocation tidak didukung oleh browser ini.",
                    coordinates: null,
                });
                resolve(false);
                return;
            }

            const options: PositionOptions = {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            };

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const distance = calculateDistance(
                        latitude,
                        longitude,
                        BBPBAT_LOCATION.lat,
                        BBPBAT_LOCATION.lng
                    );
                    const inRange = distance <= BBPBAT_LOCATION.radius;

                    setLocationStatus({
                        loading: false,
                        allowed: true,
                        inRange,
                        distance: Math.round(distance),
                        error: null,
                        coordinates: { lat: latitude, lng: longitude },
                    });
                    resolve(inRange);
                },
                (err) => {
                    let errorMessage =
                        "Gagal mendapatkan lokasi. Pastikan GPS dan izin lokasi aktif.";
                    if (err.code === 1)
                        errorMessage =
                            "Akses lokasi ditolak. Mohon izinkan di pengaturan browser Anda.";
                    if (err.code === 3)
                        errorMessage =
                            "Waktu pengecekan lokasi habis, coba periksa ulang.";

                    setLocationStatus({
                        loading: false,
                        allowed: false,
                        inRange: false,
                        distance: null,
                        error: errorMessage,
                        coordinates: null,
                    });
                    resolve(false);
                },
                options
            );
        });
    }, []);

    return { locationStatus, checkLocation, BBPBAT_LOCATION };
};
