const fs = require('fs');
const path = require('path');

// Extract location data from locations.config.ts
const locationsConfigPath = path.join(__dirname, 'packages/nextjs/locations.config.ts');
const locationsConfigContent = fs.readFileSync(locationsConfigPath, 'utf8');

// Extract locations array using regex
const locationsRegex = /export const locations: Location\[] = \[([\s\S]*?)\];/;
const locationsMatch = locationsConfigContent.match(locationsRegex);

if (!locationsMatch) {
  console.error('Could not find locations array in the config file');
  process.exit(1);
}

const locationsText = locationsMatch[1];

// Parse individual location objects
const locationObjects = [];
const locationObjectRegex = /\{\s*id:\s*(\d+),\s*position:\s*\{\s*lat:\s*(-?\d+\.\d+),\s*lng:\s*(-?\d+\.\d+)\s*\},\s*title:\s*"([^"]+)",\s*address:[^,]+,\s*image:[^,]+,\s*region:\s*"([^"]+)",\s*date:[^,]+,\s*venue:[^,]+(?:,\s*lumaLink:[^,}]+)?\s*\}/g;

let match;
while ((match = locationObjectRegex.exec(locationsText)) !== null) {
  const [_, id, lat, lng, title, region] = match;
  
  // Extract location name from title
  const titleParts = title.split(' - ');
  if (titleParts.length >= 2) {
    const locationName = titleParts[1].replace(/, [^,]+$/, ''); // Remove country suffix
    
    // Convert to a valid contract name (alphanumeric only, no spaces)
    const contractName = locationName.replace(/[^a-zA-Z0-9]/g, '');
    
    locationObjects.push({
      id: parseInt(id),
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      title,
      location: locationName,
      contractName,
      region
    });
  }
}

console.log(`Found ${locationObjects.length} locations`);

// Create contract template
const createContractTemplate = (location) => {
  // Convert lat and lng to nanodegrees (9 decimal places)
  const latNano = Math.round(location.lat * 1e9);
  const lngNano = Math.round(location.lng * 1e9);
  
  return `//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "../NFTBaseV1.sol";

contract ${location.contractName} is NFTBaseV1 {
    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI,
        address[] memory admins,
        address[] memory minters,
        address eas,
        bytes32 schemaUID
    )
        NFTBaseV1(
            name,
            symbol,
            baseURI,
            admins,
            minters,
            ${latNano}, // latitude in nanodegrees
            ${lngNano}, // longitude in nanodegrees
            eas,
            schemaUID
        )
    {}
}
`;
};

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, 'packages/foundry/contracts/events');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate contract files
locationObjects.forEach(location => {
  const contractPath = path.join(outputDir, `${location.contractName}.sol`);
  fs.writeFileSync(contractPath, createContractTemplate(location));
  console.log(`Created ${contractPath}`);
});

console.log('Done generating contract files'); 