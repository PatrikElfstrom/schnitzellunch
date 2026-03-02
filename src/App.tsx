import { Component, createEffect, createMemo, createSignal } from "solid-js";
import { WeekDaySelector } from "./components/WeekDaySelector";
import { RestaurantPanel } from "./components/RestaurantPanel";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { MapContainer } from "./components/Map";
import { createTrpcQuery } from "./lib/trpc";
import { Restaurant } from "@prisma/client";

dayjs.extend(isoWeek);
dayjs.Ls.en.weekStart = 1;

const App: Component = () => {
  let mainRef!: HTMLDivElement;
  const week = createMemo(() => dayjs().isoWeek());
  const year = createMemo(() => dayjs().isoWeekYear());
  const [weekDay, setWeekDay] = createSignal(dayjs().isoWeekday());
  const [getSelectedRestaurant, _setSelectedRestaurant] =
    createSignal<Restaurant | null>(null);
  const [isPanelOpen, setIsPanelOpen] = createSignal(true);

  const [getRestaurants, { refetch }] = createTrpcQuery("restaurants", {
    year: year(),
    week: week(),
    weekDay: weekDay(),
  });

  createEffect(() => {
    refetch({ weekDay: weekDay(), week: week() });
  });

  const setSelectedRestaurant = (restaurant: Restaurant) => {
    _setSelectedRestaurant((prev: any) =>
      prev === restaurant ? null : restaurant
    );
  };

  const restaurantCount = createMemo(() => {
    const data = getRestaurants();
    return data ? data.length : 0;
  });

  return (
    <>
      <style>{`
        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html, body, #root {
          height: 100%;
          margin: 0;
          overflow: hidden;
        }

        body {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>

      <div style={{
        display: "flex",
        height: "100%",
        position: "relative",
      }}>
        {/* Side Panel */}
        <div
          ref={mainRef}
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            bottom: "0",
            width: isPanelOpen() ? "420px" : "0px",
            "z-index": "10",
            display: "flex",
            "flex-direction": "column",
            transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            overflow: "hidden",
          }}
        >
          <div style={{
            width: "420px",
            height: "100%",
            display: "flex",
            "flex-direction": "column",
            background: "rgba(26, 26, 26, 0.92)",
            "backdrop-filter": "blur(24px)",
            "-webkit-backdrop-filter": "blur(24px)",
            "border-right": "1px solid rgba(255, 255, 255, 0.06)",
          }}>
            {/* Header */}
            <div style={{
              padding: "24px 24px 0",
              "flex-shrink": "0",
            }}>
              <div style={{
                display: "flex",
                "align-items": "center",
                "justify-content": "space-between",
                "margin-bottom": "20px",
              }}>
                <div>
                  <h1 style={{
                    "font-family": "'Space Grotesk', sans-serif",
                    "font-size": "22px",
                    "font-weight": "700",
                    color: "#ffffff",
                    "letter-spacing": "-0.02em",
                    "line-height": "1",
                    "margin-bottom": "6px",
                  }}>
                    Schnitzellunch
                  </h1>
                  <p style={{
                    "font-size": "13px",
                    color: "rgba(255, 255, 255, 0.45)",
                    "font-weight": "400",
                  }}>
                    Vecka {week()} &middot; {restaurantCount()} {restaurantCount() === 1 ? 'restaurang' : 'restauranger'}
                  </p>
                </div>
              </div>

              <WeekDaySelector weekDay={weekDay} setWeekDay={setWeekDay} />
            </div>

            {/* Restaurant List */}
            <div style={{
              flex: "1",
              overflow: "auto",
              padding: "16px 24px 24px",
            }}>
              <RestaurantPanel
                getRestaurants={getRestaurants}
                getSelectedRestaurant={getSelectedRestaurant}
                setSelectedRestaurant={setSelectedRestaurant}
              />
            </div>
          </div>
        </div>

        {/* Panel toggle button */}
        <button
          onClick={() => setIsPanelOpen(!isPanelOpen())}
          style={{
            position: "absolute",
            top: "16px",
            left: isPanelOpen() ? "432px" : "16px",
            "z-index": "11",
            width: "40px",
            height: "40px",
            border: "none",
            "border-radius": "10px",
            background: "rgba(26, 26, 26, 0.88)",
            "backdrop-filter": "blur(12px)",
            "-webkit-backdrop-filter": "blur(12px)",
            color: "#ffffff",
            cursor: "pointer",
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.15s ease",
            "box-shadow": "0 2px 8px rgba(0,0,0,0.2)",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(40, 40, 40, 0.95)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(26, 26, 26, 0.88)"}
          aria-label={isPanelOpen() ? "Stäng panel" : "Öppna panel"}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            {isPanelOpen() ? (
              <path d="M11 4L6 9L11 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            ) : (
              <path d="M7 4L12 9L7 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            )}
          </svg>
        </button>

        {/* Map fills entire background */}
        <div style={{
          flex: "1",
          height: "100%",
        }}>
          <MapContainer
            getRestaurants={getRestaurants}
            mainRef={mainRef}
            getSelectedRestaurant={getSelectedRestaurant}
            setSelectedRestaurant={setSelectedRestaurant}
            isPanelOpen={isPanelOpen}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        </div>
      </div>
    </>
  );
};

export default App;
