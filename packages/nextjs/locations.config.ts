import deployedContracts from "./contracts/deployedContracts";

export type Location = {
  id: number;
  position: { lat: number; lng: number };
  title: string;
  address: string;
};

export const locations: Location[] = [
  {
    id: 0,
    position: { lat: -3.3816595330236003, lng: 36.701730603710025 },
    title: "BASE WORKSHOP. Building With BASE - Agent Edition.",
    address: deployedContracts[8453].Brussels.address,
  },
  {
    id: 1,

    position: { lat: -18.179401293882474, lng: 31.62782055952788 },
    title: "The Cool Down with UBU - A Based Meetup.",
    address: deployedContracts[8453].Gosho.address,
  },
  {
    id: 2,
    position: { lat: -7.797068, lng: 110.370529 },
    title: "Based Community Meet-Up Yogyakarta",
    address: deployedContracts[8453].Yogyakarta.address,
  },
  {
    id: 3,

    position: { lat: 50.822830042, lng: 4.358665232 },
    title: "Based Community Meetup - Brussels",
    address: deployedContracts[8453].Ndotohub.address,
  },
  {
    id: 4,

    position: { lat: 40.4463428755682, lng: -80.0117817121559 },
    title: "Test Location",
    address: deployedContracts[8453].Ndotohub.address,
  },
];
