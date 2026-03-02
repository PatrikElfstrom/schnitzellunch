import { Component, createEffect, For, Show } from "solid-js";

const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const UtensilsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
    <path d="M7 2v20"/>
    <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
  </svg>
);

export const RestaurantPanel: Component<{
  getRestaurants: any;
  setSelectedRestaurant: any;
  getSelectedRestaurant: any;
}> = ({ getRestaurants, setSelectedRestaurant, getSelectedRestaurant }) => {
  let refs: Record<string, HTMLDivElement> = {};

  createEffect(() => {
    const selectedRestaurant = getSelectedRestaurant();
    if (selectedRestaurant && refs[selectedRestaurant.id]) {
      refs[selectedRestaurant.id].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  });

  return (
    <>
      <Show when={getRestaurants.loading}>
        <div style={{
          display: "flex",
          "flex-direction": "column",
          "align-items": "center",
          "justify-content": "center",
          padding: "48px 0",
          gap: "12px",
        }}>
          <div style={{
            width: "32px",
            height: "32px",
            border: "2px solid rgba(255,255,255,0.1)",
            "border-top-color": "rgba(209, 130, 57, 0.8)",
            "border-radius": "50%",
            animation: "spin 0.6s linear infinite",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "rgba(255,255,255,0.4)", "font-size": "13px" }}>Laddar restauranger...</p>
        </div>
      </Show>

      <Show when={!getRestaurants.loading && getRestaurants()?.length === 0}>
        <div style={{
          display: "flex",
          "flex-direction": "column",
          "align-items": "center",
          "justify-content": "center",
          padding: "48px 0",
          "text-align": "center",
        }}>
          <p style={{
            color: "rgba(255,255,255,0.5)",
            "font-size": "14px",
            "line-height": "1.5",
          }}>
            Ingen schnitzel hittad idag
          </p>
          <p style={{
            color: "rgba(255,255,255,0.3)",
            "font-size": "13px",
            "margin-top": "4px",
          }}>
            Prova en annan dag
          </p>
        </div>
      </Show>

      <Show when={!getRestaurants.loading && getRestaurants()?.length > 0}>
        <div style={{
          display: "flex",
          "flex-direction": "column",
          gap: "8px",
        }}>
          <For each={getRestaurants()}>
            {(restaurant: any) => {
              const isSelected = () => restaurant === getSelectedRestaurant();

              return (
                <div
                  ref={(el: HTMLDivElement) => refs[restaurant.id] = el}
                  onClick={() => setSelectedRestaurant(restaurant)}
                  style={{
                    padding: "16px",
                    "border-radius": "12px",
                    background: isSelected()
                      ? "rgba(209, 130, 57, 0.12)"
                      : "rgba(255, 255, 255, 0.03)",
                    border: isSelected()
                      ? "1px solid rgba(209, 130, 57, 0.3)"
                      : "1px solid rgba(255, 255, 255, 0.05)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e: MouseEvent) => {
                    if (!isSelected()) {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255, 255, 255, 0.06)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255, 255, 255, 0.1)";
                    }
                  }}
                  onMouseLeave={(e: MouseEvent) => {
                    if (!isSelected()) {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255, 255, 255, 0.03)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255, 255, 255, 0.05)";
                    }
                  }}
                >
                  {/* Restaurant Name */}
                  <h3 style={{
                    "font-family": "'Space Grotesk', sans-serif",
                    "font-size": "15px",
                    "font-weight": "600",
                    color: "#ffffff",
                    "margin-bottom": "10px",
                    "line-height": "1.3",
                    "letter-spacing": "-0.01em",
                  }}>
                    {restaurant.title}
                  </h3>

                  {/* Info rows */}
                  <div style={{
                    display: "flex",
                    "flex-direction": "column",
                    gap: "6px",
                    "margin-bottom": "12px",
                  }}>
                    <div style={{
                      display: "flex",
                      "align-items": "center",
                      gap: "8px",
                      color: "rgba(255, 255, 255, 0.45)",
                      "font-size": "12px",
                    }}>
                      <MapPinIcon />
                      <span>{restaurant.address}</span>
                    </div>
                    <Show when={restaurant.phone}>
                      <div style={{
                        display: "flex",
                        "align-items": "center",
                        gap: "8px",
                        color: "rgba(255, 255, 255, 0.45)",
                        "font-size": "12px",
                      }}>
                        <PhoneIcon />
                        <span>{restaurant.phone}</span>
                      </div>
                    </Show>
                  </div>

                  {/* Menu Items */}
                  <div style={{
                    display: "flex",
                    "flex-direction": "column",
                    gap: "6px",
                  }}>
                    <div style={{
                      display: "flex",
                      "align-items": "center",
                      gap: "6px",
                      color: "rgba(209, 130, 57, 0.8)",
                      "font-size": "11px",
                      "font-weight": "600",
                      "text-transform": "uppercase",
                      "letter-spacing": "0.05em",
                      "margin-bottom": "2px",
                    }}>
                      <UtensilsIcon />
                      <span>Meny</span>
                    </div>
                    <For each={restaurant.menuItems}>
                      {(menuItem: any) => (
                        <p style={{
                          color: "rgba(255, 255, 255, 0.7)",
                          "font-size": "13px",
                          "line-height": "1.5",
                          "padding-left": "22px",
                        }}>
                          {menuItem.description}
                        </p>
                      )}
                    </For>
                  </div>
                </div>
              );
            }}
          </For>
        </div>
      </Show>
    </>
  );
};
