import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  on,
  onMount,
} from "solid-js";
import {
  map as leafletMap,
  marker,
  tileLayer,
  Map,
  LayerGroup,
  layerGroup,
} from "leaflet";
import "leaflet/dist/leaflet.css";
import { styled } from "solid-styled-components";
import { useRestaurants } from "../../lib/state";
// import { useRestaurants, useWeek, useWeekDay } from "../../lib/state";

const Div = styled("div")(() => ({
  height: "100%",
}));

export const MapContainer: Component<{
  getRestaurants: any;
  attribution: string;
}> = ({ getRestaurants, attribution }) => {
  let mapRef!: HTMLDivElement;
  const url = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const [getMap, setMap] = createSignal<Map>();
  const getLayerGroup = createMemo(() => new LayerGroup());

  onMount(() => {
    const map = leafletMap(mapRef, {
      center: [57.72269020114423, 11.973471718645394],
      zoom: 13,
    });

    tileLayer(url, { attribution }).addTo(map);

    setMap(map);
  });

  createEffect(
    on([getMap, getRestaurants], () => {
      const map = getMap();
      const restaurants = getRestaurants();
      const layerGroup = getLayerGroup();

      if (map && restaurants) {
        map.addLayer(layerGroup);
        layerGroup.clearLayers();

        for (const restaurant of restaurants) {
          if (restaurant.latitude && restaurant.longitude) {
            layerGroup.addLayer(
              marker([restaurant.latitude, restaurant.longitude])
            );
          }
        }
      }
    })
  );

  return <Div ref={mapRef} />;
};
