import { Accessor, Setter } from "solid-js";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import "dayjs/locale/sv";

dayjs.extend(isoWeek);
dayjs.Ls.en.weekStart = 1;

const DAY_LABELS: Record<number, string> = {
  1: "Mån",
  2: "Tis",
  3: "Ons",
  4: "Tor",
  5: "Fre",
  6: "Lör",
  7: "Sön",
};

export const WeekDaySelector = ({
  weekDay,
  setWeekDay,
}: {
  weekDay: Accessor<number>;
  setWeekDay: Setter<number>;
}) => {
  const weekDays = [1, 2, 3, 4, 5, 6, 7];
  const today = dayjs().isoWeekday();

  return (
    <div
      style={{
        display: "flex",
        gap: "4px",
        padding: "4px",
        background: "rgba(255, 255, 255, 0.04)",
        "border-radius": "12px",
        "margin-bottom": "8px",
      }}
      role="radiogroup"
      aria-label="Välj veckodag"
    >
      {weekDays.map((day) => {
        const isActive = () => day === weekDay();
        const isToday = day === today;

        return (
          <label
            style={{
              flex: "1",
              cursor: "pointer",
              position: "relative",
            }}
          >
            <input
              checked={isActive()}
              name="weekDays"
              type="radio"
              value={day}
              onInput={(event) =>
                setWeekDay(Number(event.currentTarget.value))
              }
              style={{ display: "none" }}
            />
            <div
              style={{
                padding: "8px 0",
                "text-align": "center",
                "border-radius": "8px",
                "font-size": "13px",
                "font-weight": isActive() ? "600" : "500",
                color: isActive()
                  ? "#ffffff"
                  : "rgba(255, 255, 255, 0.4)",
                background: isActive()
                  ? "rgba(209, 130, 57, 0.9)"
                  : "transparent",
                transition: "all 0.15s ease",
                "line-height": "1.2",
                "user-select": "none",
                position: "relative",
              }}
              onMouseEnter={(e: MouseEvent) => {
                if (!isActive()) {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255, 255, 255, 0.06)";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255, 255, 255, 0.7)";
                }
              }}
              onMouseLeave={(e: MouseEvent) => {
                if (!isActive()) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255, 255, 255, 0.4)";
                }
              }}
            >
              {DAY_LABELS[day]}
              {isToday && (
                <div
                  style={{
                    width: "3px",
                    height: "3px",
                    "border-radius": "50%",
                    background: isActive()
                      ? "#ffffff"
                      : "rgba(209, 130, 57, 0.8)",
                    margin: "3px auto 0",
                  }}
                />
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
};
