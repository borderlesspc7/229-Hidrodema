export type GeoPoint = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

export async function getCurrentGeoPoint(opts?: {
  timeoutMs?: number;
  enableHighAccuracy?: boolean;
}): Promise<GeoPoint> {
  const timeoutMs = opts?.timeoutMs ?? 15_000;
  const enableHighAccuracy = opts?.enableHighAccuracy ?? true;

  if (!("geolocation" in navigator)) {
    throw new Error("Geolocalização indisponível neste dispositivo/navegador.");
  }

  return await new Promise<GeoPoint>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        reject(
          new Error(
            err?.message || "Falha ao obter localização. Verifique permissões do navegador."
          )
        );
      },
      { enableHighAccuracy, timeout: timeoutMs, maximumAge: 0 }
    );
  });
}

