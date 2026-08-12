import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import type { ForwardedRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Stop } from '../types';

// MapBox GL requires an access token (even for third-party tiles like MapTiler)
// Get free token from: https://account.mapbox.com/auth/signup/
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiZGVtbyIsImEiOiJjbGV4YW1wbGUifQ.demo-token';

interface MapProps {
  stops: Stop[];
  selectedStop: Stop | null;
  onStopClick: (stop: Stop) => void;
}

export interface MapRef {
  centerOnStop: (stop: Stop) => void;
}

// Map styles fallback
const MAPTILER_STYLE_URL = 'https://api.maptiler.com/maps/019d0d02-359b-7f4b-a797-bdeabca9dce3/style.json?key=7TQErbyvEqFlis3QMmSl';
const FALLBACK_STYLE_URL = 'https://demotiles.maplibre.org/style.json';
const DEFAULT_STYLE_URL = import.meta.env.VITE_MAPBOX_STYLE_URL || MAPTILER_STYLE_URL;
const GRENOBLE_CENTER: [number, number] = [5.74892, 45.18501];

const MapComponentBase = ({ stops, selectedStop, onStopClick }: MapProps, ref: ForwardedRef<MapRef>) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Expose map methods to parent component
  useImperativeHandle(ref, () => ({
    centerOnStop: (stop: Stop) => {
      if (map.current) {
        map.current.flyTo({
          center: [stop.lon, stop.lat],
          zoom: 16,
          duration: 1000,
          essential: true
        });
      }
    }
  }));

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    let mounted = true;

    const initMap = () => {
      try {
        console.log('Starting map initialization...');
        console.log('MapBox GL version:', mapboxgl.version || 'unknown');
        console.log('MapBox GL available:', !!mapboxgl);
        console.log('MapBox GL Map class:', typeof mapboxgl.Map);

        if (!mapContainer.current) {
          const err = 'Map container not available';
          console.error(err);
          if (mounted) setError(err);
          return;
        }

        // Create map instance
        const styleUrl = DEFAULT_STYLE_URL || FALLBACK_STYLE_URL;
        const mapConfig: mapboxgl.MapboxOptions = {
          container: mapContainer.current,
          style: styleUrl,
          center: GRENOBLE_CENTER,
          zoom: 12.1,
          pitch: 0,
          bearing: 0,
        };

        console.log('Creating map with config:', { center: GRENOBLE_CENTER, zoom: 12.1, style: MAPTILER_STYLE_URL.substring(0, 50) + '...' });
        
        try {
          map.current = new mapboxgl.Map(mapConfig);
          console.log('Map instance created successfully');
        } catch (mapErr) {
          console.error('Failed to create Map instance:', mapErr);
          throw mapErr;
        }

        map.current.on('load', () => {
          console.log('Map loaded successfully');
          if (mounted) setIsLoading(false);
        });

        map.current.on('error', (e: any) => {
          console.error('Map error event:', e?.message || e?.type);
          const errorMsg = e?.message || e?.type || 'Unknown error';
          if (mounted) setError(`Map error: ${errorMsg}`);
        });

        map.current.on('style.load', () => {
          console.log('Map style loaded');
        });

        console.log('Map event listeners registered');
      } catch (err: any) {
        const errorMessage = err?.message || String(err);
        console.error('Error initializing map:', err);
        console.error('Error details:', {
          message: errorMessage,
          stack: err?.stack,
          type: typeof err,
          name: err?.name,
          toString: String(err),
        });
        if (mounted) setError(`Failed to initialize map: ${errorMessage}`);
      }
    };

    initMap();

    return () => {
      mounted = false;
      if (map.current) {
        try {
          map.current.remove();
        } catch (e) {
          console.error('Error removing map:', e);
        }
      }
    };
  }, []);

  // Store callback in ref to avoid dependency issues
  const onStopClickRef = useRef(onStopClick);
  useEffect(() => {
    onStopClickRef.current = onStopClick;
  }, [onStopClick]);

  // Update markers when stops or selected stop changes
  useEffect(() => {
    if (!map.current) {
      console.log('Map not ready yet');
      return;
    }

    if (isLoading) {
      console.log('Map still loading...');
      return;
    }

    // Wait for map to be fully loaded
    if (!map.current.isStyleLoaded()) {
      console.log('Map style not loaded yet, waiting...');
      map.current.once('style.load', () => {
        console.log('Map style loaded, now creating layers');
      });
      return;
    }

    if (!stops || stops.length === 0) {
      console.warn('No stops available to display');
      return;
    }

    console.log(`Creating ${stops.length} stops visualization with native layers`);

    const createStopsLayers = () => {
      try {
        // Create GeoJSON features from stops
        const normalizeId = (id: string): string => {
          if (!id) return id;
          if (id.startsWith('SEM:')) return id;
          return `SEM:${id}`;
        };

        const selectedId = selectedStop ? normalizeId(selectedStop.id) : null;

        const areSameStop = (stopId: string, selectedId: string | null): boolean => {
          if (!selectedId || !stopId) return false;
          const normStop = normalizeId(stopId);
          return normStop === selectedId;
        };

        const features = stops.map((stop) => ({
          type: 'Feature' as const,
          properties: {
            id: stop.id,
            name: stop.name,
            city: stop.city,
            isSelected: areSameStop(stop.id, selectedId),
          },
          geometry: {
            type: 'Point' as const,
            coordinates: [stop.lon, stop.lat],
          },
        }));

        const geojson = {
          type: 'FeatureCollection' as const,
          features,
        };

        console.log(`✓ Created ${features.length} GeoJSON features`);

        // Remove existing source and layers if they exist
        if (map.current.getSource('stops')) {
          // Remove layers first
          if (map.current.getLayer('stops-circle')) map.current.removeLayer('stops-circle');
          if (map.current.getLayer('stops-label')) map.current.removeLayer('stops-label');
          
          // Then remove source
          map.current.removeSource('stops');
        }

        // Add source
        map.current.addSource('stops', {
          type: 'geojson',
          data: geojson as any,
        });

        console.log('✓ GeoJSON source added with', features.length, 'features');
        console.log('✓ map.current exists?', !!map.current);

        // Add all stops layer
        map.current.addLayer({
          id: 'stops-circle',
          type: 'circle',
          source: 'stops',
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10,
              6,
              15,
              12,
            ],
            'circle-color': [
              'case',
              ['get', 'isSelected'],
              '#6B7280',
              '#facc15'
            ],
            'circle-stroke-width': [
              'case',
              ['get', 'isSelected'],
              3,
              2
            ],
            'circle-stroke-color': '#ffffff',
            'circle-opacity': [
              'case',
              ['get', 'isSelected'],
              1,
              0.8
            ],
          },
        });

        console.log('✓ stops-circle layer added successfully');

        // Skip labels for now - will add them later after fixing events
        // TODO: Add symbol layer with text labels when font issues resolved

        // Add click handler
        const handleClickStop = (e: any) => {
          console.log('🖱️ Click event fired on stops layer:', e.features?.length);
          if (e.features && e.features.length > 0 && e.features[0]) {
            const stopId = e.features[0].properties.id;
            console.log('Found feature with ID:', stopId);
            const stop = stops.find((s) => s.id === stopId);
            if (stop) {
              console.log(`✓ Clicked stop: ${stop.name}`);
              onStopClickRef.current(stop);
            } else {
              console.warn('Stop not found for ID:', stopId);
            }
          }
        };

        // Change cursor on hover
        const handleMouseEnter = () => {
          map.current.getCanvas().style.cursor = 'pointer';
        };

        const handleMouseLeave = () => {
          map.current.getCanvas().style.cursor = '';
        };

        console.log('Attaching click listener to stops-circle layer...');
        map.current.on('click', 'stops-circle', handleClickStop);
        map.current.on('mouseenter', 'stops-circle', handleMouseEnter);
        map.current.on('mouseleave', 'stops-circle', handleMouseLeave);
        console.log('✓ Component: All event listeners attached');

        console.log(`✓ Event listeners attached to 'stops-circle' layer`);
        console.log(`✓ All ${stops.length} stops rendered as native layers`);
      } catch (err) {
        console.error('Error creating stops layers:', err);
      }
    };

    createStopsLayers();
  }, [stops, selectedStop, isLoading]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50">
        <div className="text-center p-6">
          <h3 className="text-lg font-bold text-red-900 mb-2">Error Loading Map</h3>
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapContainer}
      className="w-full h-full bg-gray-100"
      style={{ minHeight: '100vh' }}
    />
  );
};

export const Map = forwardRef<MapRef, MapProps>(MapComponentBase);

