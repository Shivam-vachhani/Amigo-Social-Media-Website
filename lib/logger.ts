const isProd =
  process.env.NODE_ENV === "production" ||
  process.env.VERCEL_ENV === "production";

type LogArgs = unknown[];

function log(...args: LogArgs) {
  if (!isProd) {
    console.log(...args);
  }
}

function info(...args: LogArgs) {
  if (!isProd) {
    console.info(...args);
  }
}

function warn(...args: LogArgs) {
  if (!isProd) {
    console.warn(...args);
  }
}

function error(...args: LogArgs) {
  console.error(...args);
}

export const logger = {
  log,
  info,
  warn,
  error,
};
