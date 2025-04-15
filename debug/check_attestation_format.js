// This script helps debug the format of EAS attestation data for location

const ethers = require('ethers');

// Update with your network details or use a provider from frontend
const RPC_URL = 'https://base-mainnet.g.alchemy.com/v2/your-api-key'; 
// Optional: replace with your actual key if needed

async function checkAttestation() {
  // Configure the provider
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  // EAS contract ABI (only the getAttestation function)
  const easABI = [
    "function getAttestation(bytes32 uid) external view returns ((bytes32 uid, bytes32 schema, uint64 time, uint64 expirationTime, uint64 revocationTime, bytes32 refUID, address attester, address recipient, bool revocable, bytes data))"
  ];
  
  // Update with your contract address
  const EAS_CONTRACT_ADDRESS = '0x4200000000000000000000000000000000000021';
  const eas = new ethers.Contract(EAS_CONTRACT_ADDRESS, easABI, provider);
  
  try {
    // Replace with the attestation UID you're trying to use
    const attestationUID = '0x221396b9a3c6222d4291d52839ca679a55b0b61437a7d8bfcc3770063f806345';
    const attestation = await eas.getAttestation(attestationUID);
    
    console.log('Attestation data:', attestation);
    
    // Decode the attestation data
    // The structure from your contract is:
    // (uint256, string, string, string, string[], bytes[], string[], string[], string)
    // Where the 4th element is the location
    
    // This is the way to decode the data field if it follows the structure in your contract
    // You might need to adjust the ABI encoding format
    const abiCoder = new ethers.AbiCoder();
    const decodedData = abiCoder.decode(
      ['uint256', 'string', 'string', 'string', 'string[]', 'bytes[]', 'string[]', 'string[]', 'string'],
      attestation.data
    );
    
    console.log('Decoded data:', {
      tokenId: decodedData[0],
      name: decodedData[1],
      description: decodedData[2],
      location: decodedData[3],
      // ...remaining fields
    });
    
    // Check the location format
    const location = decodedData[3];
    console.log('Location from attestation:', location);
    
    // Parse it to see if it's valid
    const [part1, part2] = location.split(',');
    console.log('First part (should be latitude):', part1);
    console.log('Second part (should be longitude):', part2);
    
    // Check ranges
    const lat = parseFloat(part1);
    const lon = parseFloat(part2);
    
    if (lat < -90 || lat > 90) {
      console.log('WARNING: If this is latitude, it is out of range (-90 to 90)');
    }
    
    if (lon < -180 || lon > 180) {
      console.log('WARNING: If this is longitude, it is out of range (-180 to 180)');
    }
    
    // Suggest fix
    console.log('\nIf your mint is failing with "Latitude too small" and you believe the format is (latitude,longitude),');
    console.log('the following changes would help:');
    console.log('1. Update the contract _parseLocation function to swap the parsing order (fix already applied)');
    console.log('2. OR ensure location string in attestation is formatted as "longitude,latitude" if using the original contract');
    
  } catch (error) {
    console.error('Error checking attestation:', error);
  }
}

// Instructions instead of auto-execution, as this requires setup
console.log('=== EAS Attestation Format Checker ===');
console.log('To use this script:');
console.log('1. Install ethers: npm install ethers');
console.log('2. Update RPC_URL with your actual RPC URL');
console.log('3. Update attestationUID with the attestation you want to check');
console.log('4. Run the script: node check_attestation_format.js');
console.log('\nNote: This script requires ethers.js v6 to be installed');

// Uncomment to run:
// checkAttestation().catch(console.error); 