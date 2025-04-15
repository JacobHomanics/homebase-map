// Test location parsing with real-world examples

// Simulate the contract's coordinate parsing function (match latest contract implementation)
function parseCoordinate(str, startIndex, endIndex) {
  const strBytes = str.slice(startIndex, endIndex);
  let negative = false;
  let start = 0;
  let result = 0n;
  let decimals = 0;
  let decimalFound = false;

  // Skip leading spaces
  while (start < strBytes.length && [' ', '\t'].includes(strBytes[start])) {
    start++;
  }

  // Check for negative sign
  if (start < strBytes.length && strBytes[start] === '-') {
    negative = true;
    start++;
  }

  // Parse digits
  for (let i = start; i < strBytes.length; i++) {
    const c = strBytes.charCodeAt(i);

    if (c === 46) { // '.'
      // Decimal point
      if (decimalFound) {
        throw new Error("Multiple decimal points");
      }
      decimalFound = true;
      continue;
    }

    if (c >= 48 && c <= 57) { // '0' to '9'
      // Digits 0-9
      const digit = c - 48;
      if (decimalFound) {
        if (decimals < 18) {
          // Match scaling factor (scaled to 18 decimal places)
          decimals++;
          result = result * 10n + BigInt(digit);
        }
      } else {
        result = result * 10n + BigInt(digit);
      }
    } else if (c !== 32) { // not a space
      if (c !== 32 && c !== 9) { // not space or tab
        throw new Error("Invalid character in number");
      }
    }
  }

  // Scale up to match 18 decimal places
  while (decimals < 18) {
    result = result * 10n;
    decimals++;
  }

  if (negative) {
    result = -result;
  }

  return result;
}

// Valid coordinate ranges
const MIN_LAT = -90n * 10n**18n;
const MAX_LAT = 90n * 10n**18n;
const MIN_LONG = -180n * 10n**18n;
const MAX_LONG = 180n * 10n**18n;

function parseLocation(locationStr) {
  const commaIndex = locationStr.indexOf(',');
  if (commaIndex === -1) {
    throw new Error("No comma found in location string");
  }
  
  // Parse both values
  const value1 = parseCoordinate(locationStr, 0, commaIndex);
  const value2 = parseCoordinate(locationStr, commaIndex + 1, locationStr.length);
  
  // Check if values are valid for latitude/longitude
  const isValue1ValidLat = value1 >= MIN_LAT && value1 <= MAX_LAT;
  const isValue2ValidLong = value2 >= MIN_LONG && value2 <= MAX_LONG;
  const isValue1ValidLong = value1 >= MIN_LONG && value1 <= MAX_LONG;
  const isValue2ValidLat = value2 >= MIN_LAT && value2 <= MAX_LAT;
  
  let lat, long;
  
  // Try to intelligently determine if format is (lat,long) or (long,lat)
  if (isValue1ValidLat && isValue2ValidLong) {
    // Most likely (lat,long) format
    lat = value1;
    long = value2;
    return { format: "lat,long", latitude: lat, longitude: long };
  } else if (isValue1ValidLong && isValue2ValidLat) {
    // Most likely (long,lat) format
    long = value1;
    lat = value2;
    return { format: "long,lat", latitude: lat, longitude: long };
  } else {
    // If we can't determine the format or values are out of range
    if (!isValue1ValidLat) {
      throw new Error("First value not a valid latitude");
    }
    if (!isValue2ValidLong) {
      throw new Error("Second value not a valid longitude");
    }
    return null; // Should never reach here due to errors above
  }
}

// Real-world location examples to test
const locations = [
  // Major cities (lat,long format)
  "40.7128,-74.0060",      // New York
  "34.0522,-118.2437",     // Los Angeles
  "51.5074,-0.1278",       // London
  "35.6762,139.6503",      // Tokyo
  "1.3521,103.8198",       // Singapore
  "-33.8688,151.2093",     // Sydney
  
  // Same cities in (long,lat) format
  "-74.0060,40.7128",      // New York
  "-118.2437,34.0522",     // Los Angeles
  "-0.1278,51.5074",       // London
  "139.6503,35.6762",      // Tokyo
  "103.8198,1.3521",       // Singapore
  "151.2093,-33.8688",     // Sydney
  
  // Edge cases
  "90,180",                // North pole with max longitude
  "-90,-180",              // South pole with min longitude
  "0,0",                   // Null Island
  "180,90",                // Max longitude with max latitude
  
  // Add your problematic location here
  // "<your-actual-location>",
];

console.log("Testing location parsing with the smart contract's algorithm");
console.log("This simulates the updated contract that auto-detects format\n");

locations.forEach(loc => {
  console.log(`Location string: "${loc}"`);
  try {
    const result = parseLocation(loc);
    console.log(`  Detected format: ${result.format}`);
    console.log(`  Latitude: ${result.latitude} (${Number(result.latitude) / 10**18})`);
    console.log(`  Longitude: ${result.longitude} (${Number(result.longitude) / 10**18})`);
    console.log(`  Valid: ✅ (would work in contract)\n`);
  } catch (error) {
    console.log(`  Error: ${error.message}`);
    console.log(`  Valid: ❌ (would fail in contract)\n`);
  }
});

console.log("\nINSTRUCTIONS:");
console.log("1. Add your actual problematic location from the attestation");
console.log("2. Run this script to see if it can be parsed correctly");
console.log("3. If it fails, you'll need to fix the format in your attestation"); 