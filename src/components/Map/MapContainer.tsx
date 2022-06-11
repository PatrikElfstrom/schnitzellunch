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
  FeatureGroup,
  bounds,
  point,
  LatLngTuple,
  popup,
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
  mainRef: any;
  getSelectedRestaurant: any;
  setSelectedRestaurant: any;
}> = ({
  getRestaurants,
  attribution,
  mainRef,
  getSelectedRestaurant,
  setSelectedRestaurant,
}) => {
  let mapRef!: HTMLDivElement;
  const url = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const [getMap, setMap] = createSignal<Map>();
  const getFeatureGroup = createMemo(() => new FeatureGroup());
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

  const showAllRestaurants = () => {
    const featureGroup = getFeatureGroup();
    const map = getMap();

    if (map && featureGroup) {
      try {
        map.fitBounds(featureGroup.getBounds(), {
          paddingTopLeft: [mainRef.clientWidth, 0],
        });
      } catch (error) {
        // This will error on first load
        // because featureGroup is not yet populated
        // console.log("error", error);
      }
    }
  };

  createEffect(() => {
    const map = getMap();
    const featureGroup = getFeatureGroup();
    const currentSelectedRestaurant = getSelectedRestaurant();

    if (map) {
      if (currentSelectedRestaurant) {
        const location: LatLngTuple = [
          currentSelectedRestaurant.latitude,
          currentSelectedRestaurant.longitude,
        ];
        map.setView(location, 15);
      } else {
        showAllRestaurants();
      }
    }
  });

  createEffect(
    on([getMap, getRestaurants], () => {
      const map = getMap();
      const restaurants = getRestaurants();
      const featureGroup = getFeatureGroup();
      const icon = getIcon();

      if (map && restaurants) {
        featureGroup.addTo(map);
        featureGroup.clearLayers();

        for (const restaurant of restaurants) {
          if (restaurant.latitude && restaurant.longitude) {
            const location: LatLngTuple = [
              restaurant.latitude,
              restaurant.longitude,
            ];

            const restaurantMarker = marker(location, { icon });

            restaurantMarker.on("click", () =>
              setSelectedRestaurant(restaurant)
            );

            featureGroup.addLayer(restaurantMarker);
          }
        }

        showAllRestaurants();
      }
    })
  );

  return <Div ref={mapRef} />;
};
