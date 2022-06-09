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
  icon,
} from "leaflet";
import "leaflet/dist/leaflet.css";
import { styled } from "solid-styled-components";
import markerIcon from "../../images/schnitzel-marker.png";

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
  const getIcon = createMemo(() =>
    icon({
      iconUrl: markerIcon,
      iconSize: [50, 34],
      iconAnchor: [25, 17],
      popupAnchor: [0, 0],
    })
  );

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
      const icon = getIcon();

      if (map && restaurants) {
        map.addLayer(layerGroup);
        layerGroup.clearLayers();

        for (const restaurant of restaurants) {
          if (restaurant.latitude && restaurant.longitude) {
            layerGroup.addLayer(
              marker([restaurant.latitude, restaurant.longitude], { icon })
            );
          }
        }
      }
    })
  );

  return <Div ref={mapRef} />;
};
