// custom-timezone.js - Developer-customizable script to add custom timezones to the chart
(function(window) {
  // Ensure the TimeZone module is loaded before registering
  if (!window.TimeZone) {
    console.error("🔌 [custom-timezone.js] TimeZone bundle not loaded yet.");
    return;
  }

  // 1. Registering developer custom timezones:
  window.TimeZone.registerTimezone('UTC', 'UTC');
  window.TimeZone.registerTimezone('Exchange', 'local');
  window.TimeZone.registerTimezone('New York', 'America/New_York');
  window.TimeZone.registerTimezone('London', 'Europe/London');
  window.TimeZone.registerTimezone('Tokyo', 'Asia/Tokyo');
  window.TimeZone.registerTimezone('Mumbai', 'Asia/Kolkata');
  window.TimeZone.registerTimezone('Sydney', 'Australia/Sydney');

  // Example: Add more timezone options here:
  // window.TimeZone.registerTimezone('Singapore', 'Asia/Singapore');
  // window.TimeZone.registerTimezone('Paris', 'Europe/Paris');

  // 2. Set the default timezone when the chart loads (e.g. 'UTC', 'local', 'America/New_York', etc.):
  window.TimeZone.defaultTimezone = 'UTC';

  console.log("🔌 [custom-timezone.js] Loaded custom developer timezones successfully.");
})(window);
