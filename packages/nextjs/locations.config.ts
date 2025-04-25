import deployedContracts from "./contracts/deployedContracts";

export type Location = {
  id: number;
  position: { lat: number; lng: number };
  title: string;
  address: string;
  image: string;
};

export const locations: Location[] = [
  {
    id: 0,

    position: { lat: 50.822830042, lng: 4.3586652321 },
    // position: { lat: 50822830042, lng: 4358665232 },

    title: "Based Community Meetup - Brussels",
    address: deployedContracts[8453].Brussels.address,
    image: "/base-batches/europe.webp",
  },
  {
    id: 1,

    position: { lat: -18.179401293, lng: 31.627820559 },
    // position: { lat: -18179401293, lng: 31627820559 },

    title: "The Cool Down with UBU - A Based Meetup.",
    address: deployedContracts[8453].Gosho.address,
    image: "/base-batches/africa.webp",
  },
  {
    id: 2,
    position: { lat: -7.7970681111, lng: 110.37052911 },
    // position: { lat: -7797068111, lng: 110370529110 },

    title: "Based Community Meet-Up Yogyakarta",
    address: deployedContracts[8453].Yogyakarta.address,
    image: "/base-batches/apac.webp",
  },
  {
    id: 3,
    position: { lat: -3.3816595331, lng: 36.701730603 },
    // position: { lat: -3381659533, lng: 36701730603 },

    title: "BASE WORKSHOP. Building With BASE - Agent Edition.",
    address: deployedContracts[8453].Ndotohub.address,
    image: "/base-batches/africa.webp",
  },
  {
    id: 4,
    position: { lat: 34.040271481, lng: 72.458903443 },
    title: "BASE Community Meet-Up - Swabi",
    address: deployedContracts[8453].Swabi.address,
    image: "/base-batches/apac.webp",
  },
  {
    id: 5,
    position: { lat: 13.622775178, lng: 123.354691267 },
    title: "BASE Workshop - Camarines",
    address: deployedContracts[8453].Camarines.address,
    image: "/base-batches/apac.webp",
  },
  {
    id: 6,
    position: { lat: 18.520430196, lng: 73.854694366 },
    title: "BASE Community Meet-Up - Pune",
    address: deployedContracts[8453].Pune.address,
    image: "/base-batches/india.webp",
  },
  {
    id: 7,
    position: { lat: -1.292066069, lng: 36.82194519 },
    title: "BASE Workshop - Nairobi",
    address: deployedContracts[8453].Nairobi.address,
    image: "/base-batches/africa.webp",
  },
  {
    id: 8,
    position: { lat: 22.396428204, lng: 114.10949707 },
    title: "BASE Community Meet-Up - Hong Kong",
    address: deployedContracts[8453].HongKong.address,
    image: "/base-batches/apac.webp",
  },
  {
    id: 9,
    position: { lat: 5.56, lng: -0.2057825 },
    title: "BASE Workshop - Accra",
    address: deployedContracts[8453].Accra.address,
    image: "/base-batches/africa.webp",
  },
  {
    id: 10,
    position: { lat: 10.391, lng: -75.4794 },
    title: "BASE Community Meet-Up - Cartagena",
    address: deployedContracts[8453].Cartagena.address,
    image: "/base-batches/latam.webp",
  },
  {
    id: 11,
    position: { lat: 16.0544, lng: 108.2022 },
    title: "BASE Workshop - Da Nang",
    address: deployedContracts[8453].DaNang.address,
    image: "/base-batches/apac.webp",
  },
  {
    id: 12,
    position: { lat: 19.076, lng: 72.8777 },
    title: "BASE Community Meet-Up - Mumbai",
    address: deployedContracts[8453].Mumbai.address,
    image: "/base-batches/india.webp",
  },
  {
    id: 13,
    position: { lat: 12.9716, lng: 77.5946 },
    title: "BASE Workshop - Bangalore",
    address: deployedContracts[8453].Bangalore.address,
    image: "/base-batches/india.webp",
  },
  {
    id: 14,
    position: { lat: 40.7128, lng: -74.006 },
    title: "BASE Community Meet-Up - New York City",
    address: deployedContracts[8453].NewYorkCity.address,
    image: "/base-batches/na.webp",
  },
  {
    id: 15,
    position: { lat: -34.6037, lng: -58.3816 },
    title: "BASE Workshop - Buenos Aires",
    address: deployedContracts[8453].BuenosAires.address,
    image: "/base-batches/latam.webp",
  },
  {
    id: 16,
    position: { lat: 14.5995, lng: 120.9842 },
    title: "BASE Community Meet-Up - Manila",
    address: deployedContracts[8453].Manila.address,
    image: "/base-batches/apac.webp",
  },
  {
    id: 17,
    position: { lat: 25.2048, lng: 55.2708 },
    title: "BASE Workshop - Dubai",
    address: deployedContracts[8453].Dubai.address,
    image: "/base-batches/europe.webp",
  },
  {
    id: 18,
    position: { lat: -6.7924, lng: 39.2083 },
    title: "BASE Community Meet-Up - Dar Es Salaam",
    address: deployedContracts[8453].DarEsSalaam.address,
    image: "/base-batches/africa.webp",
  },
  {
    id: 19,
    position: { lat: -1.9706, lng: 30.1044 },
    title: "BASE Workshop - Kigali",
    address: deployedContracts[8453].Kigali.address,
    image: "/base-batches/africa.webp",
  },
];
