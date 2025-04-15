// This script simulates how locations are parsed in the NFTBaseV1 contract
// to help debug the "Latitude too small" error

function parseCoordinate(str, startIndex, endIndex) {
  const strBytes = str.slice(startIndex, endIndex);
  let negative = false;
  let start = 0;
  let result = 0;
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
          // Match scaling factor (scaled to 18 decimals)
          decimals++;
          result = result * 10 + digit;
        }
      } else {
        result = result * 10 + digit;
      }
    } else if (c !== 32) { // not a space
      if (c !== 32 && c !== 9) { // not space or tab
        throw new Error("Invalid character in number");
      }
    }
  }

  // Scale up to match 18 decimal places
  while (decimals < 18) {
    result = result * 10;
    decimals++;
  }

  if (negative) {
    result = -result;
  }

  return result;
}

function parseLocation(location) {
  if (!location || location.length > 50) {
    throw new Error("Invalid location format");
  }

  // Find the comma separator
  const commaIndex = location.indexOf(',');
  if (commaIndex === -1) {
    throw new Error("Invalid location format: no comma found");
  }

  // Parse coordinates - NOTE: in the contract, longitude comes first, latitude second
  const longitude = parseCoordinate(location, 0, commaIndex);
  const latitude = parseCoordinate(location, commaIndex + 1, location.length);

  return { longitude, latitude };
}

// Valid latitude range: -90 to 90 (in base 10^18)
const MIN_LAT = -90n * 10n**18n;
const MAX_LAT = 90n * 10n**18n;

// Test cases
const testLocations = [
  "10.12345,20.67890", // long,lat format
  "20.67890,10.12345", // lat,long format
  "-91.0,45.0",        // Invalid longitude (out of range)
  "45.0,-91.0",        // Invalid latitude (out of range)
  "-180.1,45.0",       // Invalid longitude (out of range)
  "45.0,-180.1",       // Invalid latitude (out of range)
  "180.1,45.0",        // Invalid longitude (out of range)
  "45.0,180.1",        // Invalid latitude (out of range)
  "-180.0,45.0",       // Valid longitude at boundary
  "45.0,-180.0",       // Valid latitude at boundary (actually not valid, should be -90.0)
  "180.0,45.0",        // Valid longitude at boundary
  "45.0,180.0",        // Valid latitude at boundary (actually not valid, should be 90.0)
];

console.log("Testing location parsing according to NFTBaseV1 contract logic:");
console.log("Note: In the contract, location format is 'longitude,latitude'");
console.log("Valid latitude range: -90 to 90 (scaled by 10^18)\n");

testLocations.forEach(location => {
  console.log(`Location string: "${location}"`);
  try {
    const { longitude, latitude } = parseLocation(location);
    console.log(`  Parsed longitude: ${longitude}`);
    console.log(`  Parsed latitude: ${latitude}`);
    
    // Check if latitude is in valid range
    const isLatValid = latitude >= MIN_LAT && latitude <= MAX_LAT;
    console.log(`  Is latitude valid: ${isLatValid}`);
    if (!isLatValid) {
      console.log(`  ERROR: Latitude too ${latitude < MIN_LAT ? 'small' : 'big'}`);
    }
    
    console.log();
  } catch (error) {
    console.log(`  Error: ${error.message}\n`);
  }
}); 