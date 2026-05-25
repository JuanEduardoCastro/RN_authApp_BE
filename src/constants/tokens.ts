export const EXPIRY = {
  TEMP_TOKEN: 300, // 5 minutes
  REFRESH_TOKEN: 2592000, // 30 days
  ACCESS_TOKEN: 900, // 15 minutes
} as const;

/* Constans EXPIRY times for testing */
// export const EXPIRY = {
//   TEMP_TOKEN: 300, // 5 minutes
//   REFRESH_TOKEN: 60, // 1 minutes
//   ACCESS_TOKEN: 10, // 10 seconds
// } as const;
