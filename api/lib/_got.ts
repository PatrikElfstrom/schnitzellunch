import got from "got";
import { CookieJar } from "tough-cookie";
import UserAgent from "user-agents";

const cookieJar = new CookieJar();

export const gotInstance = got.extend({
  cookieJar,
  retry: {
    limit: 2,
  },
  http2: false, // http2 doesn't work well with proxies
  headers: {
    "accept-encoding": "gzip, deflate",
    "accept-language": "en-US,en;q=0.5",
    "cache-control": "max-age=0",
    "upgrade-insecure-requests": "1",
    "user-agent": new UserAgent().toString(), // Use random user agent between sessions
  }, // Mimic browser environment
  hooks: {
    beforeRequest: [
      async (options) => {
        options.headers.host = options.url.host;
        options.headers.origin = options.url.origin;
        options.headers.referer = options.url.href;
      },
    ],
  },
  mutableDefaults: true, // Defines if config can be changed later
});
