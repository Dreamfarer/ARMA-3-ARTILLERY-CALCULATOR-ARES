import {
  Popup as PopupMapLibre,
  Map as MapMapLibre,
  MapLayerMouseEvent,
  MapGeoJSONFeature,
  MapSourceDataEvent,
} from 'maplibre-gl';
import { MapMetadataRecord } from '@/types/map-metadata';
import { RefObject, useEffect } from 'react';
import { Point } from 'geojson';
import { createRoot, Root } from 'react-dom/client';
import Popup from '../components/popup';
import { ArtilleryFeatureProperties } from '@/types/artillery-feature-properties';
import { TargetFeatureProperties } from '@/types/target-feature-properties';

type PopupWithRoot = PopupMapLibre & {
  root?: Root;
  featureId?: string;
};

export function useTogglePopup(
  map: MapMapLibre | null,
  sourceId: string,
  markerLayerId: string,
  mapMetadata: MapMetadataRecord | null,
  activeMap: string | null,
  popupsRef: RefObject<Map<string, PopupMapLibre>>
) {
  useEffect(() => {
    if (!map || !mapMetadata || !activeMap) return;
    const popups = popupsRef.current;
    if (!popups) return;

    const handleToggle = async (e: MapLayerMouseEvent) => {
      const feature = e.features?.[0] as MapGeoJSONFeature;
      if (!feature) return;

      const properties = feature.properties as
        | ArtilleryFeatureProperties
        | TargetFeatureProperties;
      const id = properties.id;

      if (popups.has(id)) {
        popups.get(id)!.remove();
        popups.delete(id);
        return;
      }

      const container = document.createElement('div');
      const root = createRoot(container);
      root.render(<Popup properties={properties} />);

      const popup = new PopupMapLibre({
        closeButton: false,
        className: 'unit-popup',
        offset: 25,
        closeOnClick: false,
      }) as PopupWithRoot;

      popup
        .setDOMContent(container)
        .setLngLat((feature.geometry as Point).coordinates as [number, number])
        .addTo(map);

      popup.root = root;
      popup.featureId = id;

      popup.on('close', () => {
        popup.root?.unmount();
        delete popup.root;
        delete popup.featureId;
        popups.delete(id);
      });

      popups.set(id, popup);
    };

    const handleSourceData = (e: MapSourceDataEvent) => {
      if (
        e.type !== 'sourcedata' ||
        e.sourceId !== sourceId ||
        e.dataType !== 'source'
      )
        return;

      for (const [id, p] of popups.entries()) {
        const popup = p as PopupWithRoot;

        const features = map.querySourceFeatures(sourceId, {
          filter: ['==', ['get', 'id'], id],
        }) as MapGeoJSONFeature[];

        const f = features?.[0];
        if (!f) {
          popup.remove();
          continue;
        }

        const properties =
          (f.properties as
            | ArtilleryFeatureProperties
            | TargetFeatureProperties) ?? {};
        if (popup.root) {
          popup.root.render(<Popup properties={properties} />);
        }
      }
    };

    map.on('click', markerLayerId, handleToggle);
    map.on('sourcedata', handleSourceData);

    return () => {
      map.off('click', markerLayerId, handleToggle);
      map.off('sourcedata', handleSourceData);
    };
  }, [map, sourceId, markerLayerId, mapMetadata, activeMap, popupsRef]);
}
