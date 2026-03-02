import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  on,
  onMount,
  Accessor,
} from "solid-js";
import {
  map as leafletMap,
  marker,
  tileLayer,
  Map,
  FeatureGroup,
  icon,
  LatLngTuple,
  divIcon,
  popup,
} from "leaflet";
import "leaflet/dist/leaflet.css";

const createCustomIcon = (isSelected: boolean) => {
  const size = isSelected ? 40 : 32;
  return divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size + 4],
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        filter: drop-shadow(0 2px 6px rgba(0,0,0,0.25));
        transition: transform 0.15s ease;
        cursor: pointer;
      ">
        <svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2C12.268 2 6 8.268 6 16c0 10 14 22 14 22s14-12 14-22c0-7.732-6.268-14-14-14z" fill="${isSelected ? '#D18239' : '#1a1a1a'}" stroke="${isSelected ? '#b06a28' : 'rgba(255,255,255,0.2)'}" stroke-width="1.5"/>
          <circle cx="20" cy="16" r="6" fill="${isSelected ? '#fff' : 'rgba(209,130,57,0.9)'}"/>
          <text x="20" y="19" text-anchor="middle" font-size="10" fill="${isSelected ? '#D18239' : '#1a1a1a'}" font-weight="bold">S</text>
        </svg>
      </div>
    `,
  });
};

const POPUP_STYLES = `
  .leaflet-popup-content-wrapper {
    background: rgba(26, 26, 26, 0.95) !important;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.08) !important;
    border-radius: 12px !important;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4) !important;
    padding: 0 !important;
    min-width: 200px;
  }
  .leaflet-popup-content {
    margin: 0 !important;
    padding: 14px 16px !important;
    font-family: 'Inter', system-ui, sans-serif !important;
    color: #fff !important;
    font-size: 13px !important;
    line-height: 1.5 !important;
  }
  .leaflet-popup-tip {
    background: rgba(26, 26, 26, 0.95) !important;
    border: 1px solid rgba(255,255,255,0.08) !important;
    box-shadow: none !important;
  }
  .leaflet-popup-close-button {
    color: rgba(255,255,255,0.4) !important;
    font-size: 18px !important;
    top: 8px !important;
    right: 10px !important;
  }
  .leaflet-popup-close-button:hover {
    color: #fff !important;
  }
  .popup-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 8px;
    letter-spacing: -0.01em;
    padding-right: 16px;
  }
  .popup-address {
    font-size: 12px;
    color: rgba(255,255,255,0.45);
    margin-bottom: 8px;
  }
  .popup-menu-label {
    font-size: 10px;
    font-weight: 600;
    color: rgba(209,130,57,0.8);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 4px;
  }
  .popup-menu-item {
    font-size: 12px;
    color: rgba(255,255,255,0.7);
    line-height: 1.5;
  }
  .leaflet-control-zoom {
    border: none !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
    border-radius: 10px !important;
    overflow: hidden;
  }
  .leaflet-control-zoom a {
    background: rgba(26, 26, 26, 0.88) !important;
    backdrop-filter: blur(12px) !important;
    -webkit-backdrop-filter: blur(12px) !important;
    color: #fff !important;
    border: none !important;
    width: 36px !important;
    height: 36px !important;
    line-height: 36px !important;
    font-size: 16px !important;
  }
  .leaflet-control-zoom a:hover {
    background: rgba(40, 40, 40, 0.95) !important;
  }
  .leaflet-control-zoom-in {
    border-bottom: 1px solid rgba(255,255,255,0.06) !important;
  }
  .leaflet-control-attribution {
    background: rgba(26, 26, 26, 0.7) !important;
    backdrop-filter: blur(8px) !important;
    -webkit-backdrop-filter: blur(8px) !important;
    color: rgba(255,255,255,0.35) !important;
    font-size: 10px !important;
    padding: 3px 8px !important;
    border-radius: 6px 0 0 0 !important;
  }
  .leaflet-control-attribution a {
    color: rgba(255,255,255,0.45) !important;
  }
`;

export const MapContainer: Component<{
  getRestaurants: any;
  attribution: string;
  mainRef: any;
  getSelectedRestaurant: any;
  setSelectedRestaurant: any;
  isPanelOpen: Accessor<boolean>;
}> = ({
  getRestaurants,
  attribution,
  mainRef,
  getSelectedRestaurant,
  setSelectedRestaurant,
  isPanelOpen,
}) => {
  let mapRef!: HTMLDivElement;

  // Use a stylish light tile layer
  const url = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  const [getMap, setMap] = createSignal<Map>();
  const getFeatureGroup = createMemo(() => new FeatureGroup());
  const [markerMap, setMarkerMap] = createSignal<Record<string, any>>({});

  onMount(() => {
    // Inject popup styles
    const styleEl = document.createElement("style");
    styleEl.textContent = POPUP_STYLES;
    document.head.appendChild(styleEl);

    const map = leafletMap(mapRef, {
      center: [57.72269020114423, 11.973471718645394],
      zoom: 13,
      zoomControl: true,
    });

    // Move zoom control to top-right
    map.zoomControl.setPosition("topright");

    tileLayer(url, {
      attribution,
      maxZoom: 19,
    }).addTo(map);

    setMap(map);

    // Invalidate size after panel animation
    setTimeout(() => map.invalidateSize(), 350);
  });

  // Re-invalidate map size when panel opens/closes
  createEffect(() => {
    const panelOpen = isPanelOpen();
    const map = getMap();
    if (map) {
      setTimeout(() => map.invalidateSize(), 350);
    }
  });

  const showAllRestaurants = () => {
    const featureGroup = getFeatureGroup();
    const map = getMap();

    if (map && featureGroup) {
      try {
        const panelWidth = isPanelOpen() ? mainRef.clientWidth : 0;
        map.fitBounds(featureGroup.getBounds(), {
          paddingTopLeft: [panelWidth + 60, 60],
          paddingBottomRight: [60, 60],
          maxZoom: 15,
        });
      } catch (error) {
        // featureGroup may not be populated yet
      }
    }
  };

  // Handle selected restaurant changes - update icons
  createEffect(() => {
    const currentSelectedRestaurant = getSelectedRestaurant();
    const map = getMap();
    const markers = markerMap();

    if (map) {
      // Reset all markers to default icon
      Object.keys(markers).forEach((id) => {
        markers[id].setIcon(createCustomIcon(false));
        markers[id].setZIndexOffset(0);
      });

      if (currentSelectedRestaurant && markers[currentSelectedRestaurant.id]) {
        const selectedMarker = markers[currentSelectedRestaurant.id];
        selectedMarker.setIcon(createCustomIcon(true));
        selectedMarker.setZIndexOffset(1000);
        const location: LatLngTuple = [
          currentSelectedRestaurant.latitude,
          currentSelectedRestaurant.longitude,
        ];
        const panelWidth = isPanelOpen() ? mainRef.clientWidth : 0;
        map.setView(location, Math.max(map.getZoom(), 14), { animate: true });
      } else if (!currentSelectedRestaurant) {
        showAllRestaurants();
      }
    }
  });

  createEffect(
    on([getMap, getRestaurants], () => {
      const map = getMap();
      const restaurants = getRestaurants();
      const featureGroup = getFeatureGroup();

      if (map && restaurants) {
        featureGroup.addTo(map);
        featureGroup.clearLayers();

        const newMarkerMap: Record<string, any> = {};

        for (const restaurant of restaurants) {
          if (restaurant.latitude && restaurant.longitude) {
            const location: LatLngTuple = [
              restaurant.latitude,
              restaurant.longitude,
            ];

            const restaurantIcon = createCustomIcon(false);
            const restaurantMarker = marker(location, { icon: restaurantIcon });

            // Build popup content
            const menuItems = restaurant.menuItems
              .map((item: any) => `<div class="popup-menu-item">${item.description}</div>`)
              .join("");

            const popupContent = `
              <div class="popup-title">${restaurant.title}</div>
              <div class="popup-address">${restaurant.address}</div>
              ${menuItems ? `<div class="popup-menu-label">Meny</div>${menuItems}` : ""}
            `;

            restaurantMarker.bindPopup(popupContent, {
              closeButton: true,
              maxWidth: 280,
              minWidth: 200,
            });

            restaurantMarker.on("click", () =>
              setSelectedRestaurant(restaurant)
            );

            featureGroup.addLayer(restaurantMarker);
            newMarkerMap[restaurant.id] = restaurantMarker;
          }
        }

        setMarkerMap(newMarkerMap);
        showAllRestaurants();
      }
    })
  );

  return (
    <div
      ref={mapRef}
      style={{
        height: "100%",
        width: "100%",
      }}
    />
  );
};
