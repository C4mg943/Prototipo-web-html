import { useEffect, useMemo, useRef, useState } from 'react';

type LatLngLiteral = { lat: number; lng: number };

type MarkerPoint = {
  nombre: string;
  lat: number;
  lng: number;
};

type MapInstance = object;

interface MarkerInstance {
  addListener: (eventName: 'click', handler: () => void) => void;
}

interface InfoWindowInstance {
  open: (map: MapInstance, anchor: MarkerInstance) => void;
}

interface MapsApi {
  Map: new (
    element: HTMLElement,
    options: {
      zoom: number;
      center: LatLngLiteral;
      mapTypeId: string;
    },
  ) => MapInstance;
  Marker: new (options: { position: LatLngLiteral; map: MapInstance; title: string }) => MarkerInstance;
  InfoWindow: new (options: { content: string }) => InfoWindowInstance;
}

interface GoogleNamespace {
  maps: MapsApi;
}

declare global {
  interface Window {
    google?: GoogleNamespace;
    gm_authFailure?: () => void;
    __unideportesGoogleMapsLoader?: Promise<void>;
  }
}

const MAP_CENTER: LatLngLiteral = { lat: 11.22769, lng: -74.18696 };

const MARKERS: MarkerPoint[] = [
  { nombre: 'Cancha 1', lat: 11.227645, lng: -74.187154 },
  { nombre: 'Cancha 2', lat: 11.227718, lng: -74.186705 },
  { nombre: 'Cancha 3', lat: 11.227754, lng: -74.186298 },
  { nombre: 'Cancha 4', lat: 11.227907, lng: -74.185939 },
  { nombre: 'Cancha 5', lat: 11.227134, lng: -74.185691 },
  { nombre: 'Cancha 8', lat: 11.22798, lng: -74.185704 },
  { nombre: 'Cancha 6', lat: 11.227516, lng: -74.184646 },
  { nombre: 'Cancha 7', lat: 11.225953, lng: -74.184287 },
];

function getMapsApi(): MapsApi | null {
  return window.google?.maps ?? null;
}

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  const mapsApi = getMapsApi();

  if (mapsApi) {
    return Promise.resolve();
  }

  if (window.__unideportesGoogleMapsLoader) {
    return window.__unideportesGoogleMapsLoader;
  }

  window.__unideportesGoogleMapsLoader = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar Google Maps.'));
    document.head.appendChild(script);
  });

  return window.__unideportesGoogleMapsLoader;
}

export function LocationSection() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [mapError, setMapError] = useState('');
  const mapsApiKey = useMemo(() => import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '', []);
  const missingKeyMessage = 'Mapa no disponible temporalmente. Configura VITE_GOOGLE_MAPS_API_KEY en frontend/.env.';
  const effectiveMapError = mapsApiKey ? mapError : missingKeyMessage;

  useEffect(() => {
    if (!mapsApiKey) {
      return;
    }

    if (!mapRef.current) {
      return;
    }

    let active = true;

    window.gm_authFailure = () => {
      if (active) {
        setMapError('Autenticación inválida. Verifica la clave de Google Maps.');
      }
    };

    void loadGoogleMapsScript(mapsApiKey)
      .then(() => {
        if (!active || !mapRef.current) {
          return;
        }

        const mapsApi = getMapsApi();

        if (!mapsApi) {
          setMapError('No fue posible inicializar el mapa.');
          return;
        }

        const map = new mapsApi.Map(mapRef.current, {
          zoom: 17,
          center: MAP_CENTER,
          mapTypeId: 'satellite',
        });

        MARKERS.forEach((point) => {
          const marker = new mapsApi.Marker({
            position: { lat: point.lat, lng: point.lng },
            map,
            title: point.nombre,
          });

          const infoWindow = new mapsApi.InfoWindow({
            content: `<strong>${point.nombre}</strong>`,
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });
        });
      })
      .catch((error: unknown) => {
        if (!(error instanceof Error)) {
          setMapError('Error inesperado cargando el mapa.');
          return;
        }

        setMapError(error.message);
      });

    return () => {
      active = false;
      if (window.gm_authFailure) {
        delete window.gm_authFailure;
      }
    };
  }, [mapsApiKey]);

  return (
    <section id="ubicacion" className="location-section">
      <div className="location-info">
        <div className="location-icon-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256">
            <path d="M128,16a88.1,88.1,0,0,0-88,88c0,75.3,80,132.17,83.41,134.55a8,8,0,0,0,9.18,0C136,236.17,216,179.3,216,104A88.1,88.1,0,0,0,128,16Zm0,56a32,32,0,1,1-32,32A32,32,0,0,1,128,72Z"></path>
          </svg>
        </div>
        <h2 className="location-title">Nuestra ubicación</h2>
        <div className="location-address-box">
          <p><strong>Universidad del Magdalena</strong></p>
          <p>Carrera 32 No 22-08</p>
          <p>Santa Marta, Magdalena 470004</p>
        </div>
        <a
          href="https://maps.app.goo.gl/iuD1MHD24KqgGoSbA"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-mapa"
        >
          <span>Abrir en Google Maps</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M224.49,136.49l-72,72a12,12,0,0,1-17-17L187,140H40a12,12,0,0,1,0-24H187L135.51,64.48a12,12,0,0,1,17-17l72,72A12,12,0,0,1,224.49,136.49Z"></path></svg>
        </a>
      </div>

      <div className="map-container">
        {effectiveMapError ? (
          <div className="map-disabled-message">{effectiveMapError}</div>
        ) : (
          <div id="google-map" className="map-canvas" ref={mapRef} />
        )}
      </div>
    </section>
  );
}
