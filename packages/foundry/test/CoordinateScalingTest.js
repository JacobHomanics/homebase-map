// Simple test script to verify coordinate scaling in NFTBaseV1 contract

// Example coordinates from contract
const testCoordinates = {
  latitude: "-3.3816595330236003",
  longitude: "36.701730603710025", 
  locationString: "36.701730603710025, -3.3816595330236003"
};

// Function that simulates _stringToInt in the contract
function stringToInt(str) {
  let negative = false;
  let start = 0;
  let result = 0n;
  let decimalFound = false;
  let decimals = 0;

  // Check for negative sign
  if (str[0] === "-") {
    negative = true;
    start = 1;
  }

  for (let i = start; i < str.length; i++) {
    const c = str.charCodeAt(i);

    if (c === 46) { // decimal point '.'
      decimalFound = true;
      continue;
    }

    if (c >= 48 && c <= 57) { // digits 0-9
      result = result * 10n + BigInt(c - 48);
      if (decimalFound) {
        decimals++;
      }
    }
  }

  // Apply negative sign if necessary
  if (negative) {
    result = -result;
  }

  // Scale to 18 decimals
  if (decimals > 0) {
    // If we have less than 18 decimal places, multiply to reach 18
    if (decimals < 18) {
      result = result * (10n ** BigInt(18 - decimals));
    }
    // If we have more than 18 decimal places, divide to reach 18
    else if (decimals > 18) {
      result = result / (10n ** BigInt(decimals - 18));
    }
  } else {
    // No decimals found, scale to 18 decimal places
    result = result * (10n ** 18n);
  }

  // Validation: ensure the result has exactly 18 decimal places
  const scale = 10n ** 18n;
  const absResult = result < 0n ? -result : result;
  
  // If result has 17 decimal places (common issue), add one more zero
  if (absResult > 0n && absResult < scale / 10n && absResult >= scale / 100n) {
    result *= 10n;
  }

  return result;
}

// Test the function
function runTest() {
  const latValue = stringToInt(testCoordinates.latitude);
  const longValue = stringToInt(testCoordinates.longitude);
  
  console.log("Original latitude:", testCoordinates.latitude);
  console.log("Parsed latitude:", latValue.toString());
  console.log("Number of digits in parsed lat:", latValue.toString().replace("-", "").length);
  
  console.log("\nOriginal longitude:", testCoordinates.longitude);
  console.log("Parsed longitude:", longValue.toString());
  console.log("Number of digits in parsed long:", longValue.toString().replace("-", "").length);
  
  // Expected values with 18 decimal places
  const expectedLatDigits = 19; // 1 digit before decimal + 18 after for our test value
  const expectedLongDigits = 20; // 2 digits before decimal + 18 after for our test value
  
  console.log("\nTests:");
  console.log("Latitude has 18 decimal places:", 
    latValue.toString().replace("-", "").length === expectedLatDigits ? "PASS" : "FAIL");
  console.log("Longitude has 18 decimal places:", 
    longValue.toString().replace("-", "").length === expectedLongDigits ? "PASS" : "FAIL");
}

// Run the test
runTest();

// To run this test:
// node CoordinateScalingTest.js 