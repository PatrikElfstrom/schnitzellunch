export const getLocale = () => {
  let locale = "en-US";

  if (typeof window !== "undefined" && "navigator" in window) {
    locale = navigator.language;
  }

  return locale;
};
