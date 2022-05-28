import { onMount } from "solid-js";
import { map as leafletMap, tileLayer } from "leaflet";
import "leaflet/dist/leaflet.css";
import { styled } from "solid-styled-components";

const Div = styled("div")(() => ({
  height: "100%",
}));

export const MapContainer = ({ attribution }: { attribution: string }) => {
  let mapRef!: HTMLDivElement;
  const url = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  onMount(() => {
    const map = leafletMap(mapRef, {
      center: [57.72269020114423, 11.973471718645394],
      zoom: 13,
    });

    tileLayer(url, { attribution }).addTo(map);
  });

  return <Div ref={mapRef} />;
};
