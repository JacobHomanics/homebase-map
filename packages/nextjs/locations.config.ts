export type Location = {
  id: number;
  position: { lat: number; lng: number };
  title: string;
  address: string;
};

export const locations: Location[] = [
  {
    id: 1,
    position: { lat: -3.3816595330236003, lng: 36.701730603710025 },
    title: "BASE WORKSHOP. Building With BASE - Agent Edition.",
    address: "0xff3a5e0fEDE6f2a421dBA4c6578443169Cb9B4DE",
  },
  {
    id: 2,

    position: { lat: -18.179401293882474, lng: 31.62782055952788 },
    title: "The Cool Down with UBU - A Based Meetup.",
    address: "0x6E9f98A2b7575b036172A531ddb61a71Fd441f30",
  },
  {
    id: 3,
    position: { lat: -7.797068, lng: 110.370529 },
    title: "Based Community Meet-Up Yogyakarta",
    address: "0x24BfCbf2dC7390f5c060Ae493bDF128565FBc9cF",
  },
  {
    id: 4,

    position: { lat: 50.822830042, lng: 4.358665232 },
    title: "Based Community Meetup - Brussels",
    address: "0x90a3515B31A1BE8b13554Cd398e6581e53B9F15B",
  },
  {
    id: 5,

    position: { lat: 40.4463428755682, lng: -80.0117817121559 },
    title: "Test Location",
    address: "0x90a3515B31A1BE8b13554Cd398e6581e53B9F15B",
  },
];
