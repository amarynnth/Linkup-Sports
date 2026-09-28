import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { CURRENT_USER } from '../data/mockData';

interface LocationState {
  lat: number;
  lng: number;
  source: 'gps' | 'fallback';
  requesting: boolean;
  requestLocation: () => void;
}

const LocationContext = createContext<LocationState | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [lat, setLat] = useState(CURRENT_USER.homeLat);
  const [lng, setLng] = useState(CURRENT_USER.homeLng);
  const [source, setSource] = useState<'gps' | 'fallback'>('fallback');
  const [requesting, setRequesting] = useState(false);

  const requestLocation = () => {
    if (!('geolocation' in navigator)) return;
    setRequesting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setSource('gps');
        setRequesting(false);
      },
      () => {
        setRequesting(false);
      },
      { timeout: 6000 }
    );
  };

  useEffect(() => {
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LocationContext.Provider value={{ lat, lng, source, requesting, requestLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
}
