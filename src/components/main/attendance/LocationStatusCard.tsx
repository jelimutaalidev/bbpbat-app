import React from "react";
import { MapPin, Loader2, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { LocationStatus, BBPBAT_LOCATION } from "../../../hooks/useGeolocation";

// Fix leaflet icon
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LocationStatusCardProps {
    locationStatus: LocationStatus;
    onCheckLocation: () => void;
}

const LocationStatusCard: React.FC<LocationStatusCardProps> = ({
    locationStatus,
    onCheckLocation,
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Status Lokasi
                </h2>
                <button
                    onClick={onCheckLocation}
                    disabled={locationStatus.loading}
                    className="text-sm bg-blue-50 text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {locationStatus.loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Memeriksa...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="w-4 h-4" /> Periksa Ulang
                        </>
                    )}
                </button>
            </div>

            {locationStatus.loading && (
                <div className="text-center py-4 text-gray-500 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Mendapatkan koordinat
                    akurat Anda...
                </div>
            )}
            {locationStatus.error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                    <p className="font-bold">Gagal Mendapatkan Lokasi</p>
                    <p className="text-sm">{locationStatus.error}</p>
                </div>
            )}
            {locationStatus.allowed && !locationStatus.error && (
                <div
                    className={`p-4 rounded-lg border ${locationStatus.inRange
                        ? "bg-green-50 border-green-200"
                        : "bg-yellow-50 border-yellow-200"
                        }`}
                >
                    <div className="flex items-center gap-3 mb-3">
                        {locationStatus.inRange ? (
                            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                        )}
                        <p
                            className={`text-lg font-bold ${locationStatus.inRange ? "text-green-800" : "text-yellow-800"
                                }`}
                        >
                            {locationStatus.inRange
                                ? "Di Dalam Area Absensi"
                                : "Di Luar Area Absensi"}
                        </p>
                    </div>
                    <div className="pl-9 text-sm space-y-2 text-gray-600 border-t pt-3 mt-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Jarak dari Lokasi</span>
                            <strong className="font-mono">
                                {locationStatus.distance} meter (Batas: {BBPBAT_LOCATION.radius}{" "}
                                m)
                            </strong>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Koordinat Anda</span>
                            <strong className="font-mono">
                                {locationStatus.coordinates?.lat.toFixed(5)},{" "}
                                {locationStatus.coordinates?.lng.toFixed(5)}
                            </strong>
                        </div>
                    </div>
                </div>
            )}

            {/* Peta Lokasi */}
            <div className="h-72 w-full rounded-lg overflow-hidden border">
                <MapContainer
                    center={[BBPBAT_LOCATION.lat, BBPBAT_LOCATION.lng]}
                    zoom={16}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                    />
                    <Marker position={[BBPBAT_LOCATION.lat, BBPBAT_LOCATION.lng]}>
                        <Popup>{BBPBAT_LOCATION.name}</Popup>
                    </Marker>
                    <Circle
                        center={[BBPBAT_LOCATION.lat, BBPBAT_LOCATION.lng]}
                        radius={BBPBAT_LOCATION.radius}
                        pathOptions={{ color: "blue", fillOpacity: 0.1 }}
                    />
                    {locationStatus.coordinates && (
                        <Marker
                            position={[
                                locationStatus.coordinates.lat,
                                locationStatus.coordinates.lng,
                            ]}
                        >
                            <Popup>Posisi Anda</Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>
        </div>
    );
};

export default LocationStatusCard;
