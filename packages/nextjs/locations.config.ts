export type Location = {
  id: number;
  position: { lat: number; lng: number };
  title: string;
  address: string;
};

export const locations: Location[] = [
  {
    id: 1,
    position: { lat: 39.78597, lng: -101.58847 },
    title: "United States",
    address: "0xff3a5e0fEDE6f2a421dBA4c6578443169Cb9B4DE",
  },
  {
    id: 2,
    position: { lat: 20.59, lng: 78.96 },
    title: "India",
    address: "0x6E9f98A2b7575b036172A531ddb61a71Fd441f30",
  },
  {
    id: 3,
    position: { lat: 2.218, lng: 115.6628 },
    title: "Southeast Asia",
    address: "0x24BfCbf2dC7390f5c060Ae493bDF128565FBc9cF",
  },
  {
    id: 4,
    position: { lat: 8.7832, lng: 34.5085 },
    title: "Africa",
    address: "0x90a3515B31A1BE8b13554Cd398e6581e53B9F15B",
  },
  {
    id: 5,
    position: { lat: -10.235, lng: 304.0747 },
    title: "Latin America",
    address: "0x886AD197A4e319CdEf4071E5eF7276ebBca95247",
  },
  {
    id: 6,
    position: { lat: 53, lng: 9 },
    title: "Europe",
    address: "0xe45c84c5b9f9835befbc79297b1a91c3cea14636",
  },
];
