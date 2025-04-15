// Advanced script to diagnose location format issues in EAS attestations

// Simulate the contract's coordinate parsing function
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

// Function to analyze a location string
function analyzeLocation(locationStr) {
  console.log(`\nAnalyzing location string: "${locationStr}"`);
  
  if (!locationStr || typeof locationStr !== 'string') {
    console.log('ERROR: Invalid location string provided');
    return;
  }
  
  // Find comma
  const commaIndex = locationStr.indexOf(',');
  if (commaIndex === -1) {
    console.log('ERROR: No comma found in location string');
    return;
  }
  
  try {
    // Parse both values
    const value1 = parseCoordinate(locationStr, 0, commaIndex);
    const value2 = parseCoordinate(locationStr, commaIndex + 1, locationStr.length);
    
    console.log('Parsed values:');
    console.log(`  First value: ${value1} (${Number(value1) / 10**18})`);
    console.log(`  Second value: ${value2} (${Number(value2) / 10**18})`);
    
    // Check if values are valid for latitude/longitude
    const isValue1ValidLat = value1 >= MIN_LAT && value1 <= MAX_LAT;
    const isValue2ValidLong = value2 >= MIN_LONG && value2 <= MAX_LONG;
    const isValue1ValidLong = value1 >= MIN_LONG && value1 <= MAX_LONG;
    const isValue2ValidLat = value2 >= MIN_LAT && value2 <= MAX_LAT;
    
    console.log('\nFormat analysis:');
    
    // Option 1: format is (lat,long)
    console.log('If format is (latitude,longitude):');
    console.log(`  First value (latitude): ${isValue1ValidLat ? 'VALID' : 'INVALID'} (must be between -90 and 90)`);
    console.log(`  Second value (longitude): ${isValue2ValidLong ? 'VALID' : 'INVALID'} (must be between -180 and 180)`);
    
    // Option 2: format is (long,lat)
    console.log('If format is (longitude,latitude):');
    console.log(`  First value (longitude): ${isValue1ValidLong ? 'VALID' : 'INVALID'} (must be between -180 and 180)`);
    console.log(`  Second value (latitude): ${isValue2ValidLat ? 'VALID' : 'INVALID'} (must be between -90 and 90)`);
    
    // Result
    if (isValue1ValidLat && isValue2ValidLong) {
      console.log('\n✅ This location is valid as (latitude,longitude) format');
    } else if (isValue1ValidLong && isValue2ValidLat) {
      console.log('\n✅ This location is valid as (longitude,latitude) format');
    } else {
      console.log('\n❌ This location is not valid in either format');
      
      if (!isValue1ValidLat && !isValue1ValidLong) {
        console.log(`  - First value ${value1} is outside both valid latitude and longitude ranges`);
      }
      
      if (!isValue2ValidLat && !isValue2ValidLong) {
        console.log(`  - Second value ${value2} is outside both valid latitude and longitude ranges`);
      }
    }
    
  } catch (error) {
    console.log(`ERROR parsing location: ${error.message}`);
  }
}

// Test with different examples
console.log('===== LOCATION FORMAT DIAGNOSIS TOOL =====');
console.log('This tool helps determine if your location string is valid and in what format');

// Example locations to analyze
const examples = [
  // Valid examples
  "37.7749,-122.4194",  // San Francisco (lat,long)
  "-122.4194,37.7749",  // San Francisco (long,lat)
  "0,0",                // Null Island
  
  // Invalid examples
  "200,45",             // Invalid longitude (too big)
  "45,200",             // Invalid longitude (too big)
  "-95,45",             // Invalid latitude (too small)
  "45,-95",             // Invalid latitude (too small)
  
  // Your actual problematic location 
  // Replace this with the actual location from the attestation
  "???,???"             
];

examples.forEach(analyzeLocation);

console.log('\n===== INSTRUCTIONS =====');
console.log('1. Run this with your actual location value from the EAS attestation');
console.log('2. Check if the values are valid in either format');
console.log('3. If the location is invalid, you may need to correct it in your attestation');
console.log('4. The updated contract should automatically detect which format you\'re using if values are in valid ranges'); 