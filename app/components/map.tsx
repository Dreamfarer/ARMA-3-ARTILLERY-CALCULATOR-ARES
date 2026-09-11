'use client';
import { useEffect, useRef } from 'react';
import { Map as MapLibreMap, setWorkerUrl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import styles from './map.module.css';
import { useMapContext } from '../context/map-context';
import { remToPx, vhToPx } from '@/lib/convert';
import { flattenRectangleLatLng } from '@/lib/geo/flatten-rectangle-lat-lng';
import { getMapBounds } from '@/lib/geo/get-map-bounds';

// Since v6 the worker has to be pointed at explicitly when bundled. Turbopack
// does emit it, but under a content-hashed name, which breaks the relative
// `./maplibre-gl-shared.mjs` import the worker starts with. `npm run build:worker`
// copies both files to `public/maplibre/` instead, where they stay side by side.
setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const { mapMetadata, setMapInstance, activeMap } = useMapContext();

  useEffect(() => {
    if (!mapContainer.current || !mapMetadata || !activeMap) return;

    const meta = mapMetadata[activeMap];
    const isDev = process.env.NODE_ENV === 'development';
    const tiles = isDev ? meta.devUrl : meta.prodUrl;
    const bounds = flattenRectangleLatLng(getMapBounds(meta));
    let wasMobile = mapContainer.current.offsetWidth < 768;

    const map = new MapLibreMap({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          gameMap: {
            type: 'raster',
            tiles: [tiles],
            tileSize: meta.tileSize,
            scheme: 'xyz',
            maxzoom: meta.maxZoom,
            bounds,
            attribution: meta.attribution,
          },
        },
        layers: [
          {
            id: 'gameMapLayer',
            type: 'raster',
            source: 'gameMap',
          },
        ],
      },
      zoom: meta.initZoom,
      minZoom: meta.minZoom,
      maxZoom: meta.maxOverscaledZoom,
      interactive: true,
      bearingSnap: 0,
      pitchWithRotate: false,
      dragRotate: false,
      renderWorldCopies: false,
      doubleClickZoom: false,
      attributionControl: false,
      transformRequest: (url) => ({ url }),
    });

    const centreForLayout = (mobile: boolean) => {
      requestAnimationFrame(() => {
        map.resize();
        const padding = mobile
          ? { top: 0, right: 0, bottom: vhToPx(40), left: 0 }
          : { top: 0, right: 0, bottom: 0, left: remToPx(26.25) };
        map.setPadding(padding);
        map.fitBounds(bounds, {
          maxZoom: meta.maxZoom,
          linear: true,
        });
      });
    };

    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      const isMobile = width < 768;
      if (isMobile !== wasMobile) {
        wasMobile = isMobile;
        centreForLayout(isMobile);
      }
    });

    map.touchZoomRotate.disableRotation();
    map.scrollZoom.enable();
    centreForLayout(wasMobile);
    ro.observe(mapContainer.current);
    setMapInstance(map);

    return () => {
      map.remove();
      ro.disconnect();
    };
  }, [setMapInstance, mapMetadata, activeMap]);

  return (
    <div className={styles.mapWrapper}>
      <div ref={mapContainer} className={styles.map} />
    </div>
  );
}
