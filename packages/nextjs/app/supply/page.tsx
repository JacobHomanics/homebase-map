"use client";

import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const NFTCollections = [
  { name: "Bangkok", contractName: "Bangkok" },
  { name: "New York City", contractName: "NewYorkCity" },
  { name: "Zanzibar", contractName: "Zanzibar" },
  { name: "Zug", contractName: "Zug" },
  { name: "Yogyakarta", contractName: "Yogyakarta" },
  { name: "Swabi", contractName: "Swabi" },
  { name: "São Paulo", contractName: "SaoPaulo" },
  { name: "Seoul", contractName: "Seoul" },
  { name: "Singapore", contractName: "Singapore" },
  { name: "Rome", contractName: "Rome" },
  { name: "Panabu City", contractName: "PanabuCity" },
  { name: "Pune", contractName: "Pune" },
  { name: "Mumbai", contractName: "Mumbai" },
  { name: "Naga City", contractName: "NagaCity" },
  { name: "Nairobi", contractName: "Nairobi" },
  { name: "Makati City", contractName: "MakatiCity" },
  { name: "Malolos City", contractName: "MalolosCity" },
  { name: "Manila", contractName: "Manila" },
  { name: "Mexico City", contractName: "MexicoCity" },
  { name: "Lagos", contractName: "Lagos" },
  { name: "Legazpie City", contractName: "LegazpieCity" },
  { name: "Lisbon", contractName: "Lisbon" },
  { name: "Kampala", contractName: "Kampala" },
  { name: "Kigali", contractName: "Kigali" },
  { name: "Kisumu", contractName: "Kisumu" },
  { name: "Kyiv", contractName: "Kyiv" },
  { name: "Hong Kong", contractName: "HongKong" },
  { name: "Istanbul", contractName: "Istanbul" },
  { name: "Jakarta", contractName: "Jakarta" },
  { name: "Delhi", contractName: "Delhi" },
  { name: "Enugu", contractName: "Enugu" },
  { name: "Haripur", contractName: "Haripur" },
  { name: "Dar Es Salaam", contractName: "DarEsSalaam" },
  { name: "Dasmariñas", contractName: "Dasmarias" },
  { name: "Davao City", contractName: "DavaoCity" },
  { name: "Cebu 2", contractName: "Cebu2" },
  { name: "Cebu 3", contractName: "Cebu3" },
  { name: "Cebu", contractName: "Cebu" },
  { name: "Da Nang", contractName: "DaNang" },
  { name: "Buenos Aires", contractName: "BuenosAires" },
  { name: "Camarines", contractName: "Camarines" },
  { name: "Cartagena", contractName: "Cartagena" },
  { name: "Bangalore", contractName: "Bangalore" },
  { name: "Budapest", contractName: "Budapest" },
  { name: "Angeles City", contractName: "AngelesCity" },
  { name: "Austin", contractName: "Austin" },
  { name: "Balanga City", contractName: "BalangaCity" },
  { name: "Addis Ababa", contractName: "AddisAbaba" },
  { name: "Accra", contractName: "Accra" },
  { name: "Abuja", contractName: "Abuja" },
  { name: "Tagum", contractName: "Tagum" },
  { name: "Brussels", contractName: "Brussels" },
  { name: "Gosho", contractName: "Gosho" },
  { name: "Ndotohub", contractName: "Ndotohub" },
  { name: "Dubai", contractName: "Dubai" },
];

export default function SupplyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">NFT Collection Supply</h1>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Collection</th>
              <th>Total Supply</th>
            </tr>
          </thead>
          <tbody>
            {NFTCollections.map(collection => (
              <CollectionRow key={collection.contractName} collection={collection} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CollectionRow({ collection }: { collection: { name: string; contractName: string } }) {
  const { data: totalSupply } = useScaffoldReadContract({
    contractName: collection.contractName as
      | "Bangkok"
      | "NewYorkCity"
      | "Zanzibar"
      | "Zug"
      | "Yogyakarta"
      | "Swabi"
      | "SaoPaulo"
      | "Seoul"
      | "Singapore"
      | "Rome"
      | "PanabuCity"
      | "Pune"
      | "Mumbai"
      | "NagaCity"
      | "Nairobi"
      | "MakatiCity"
      | "MalolosCity"
      | "Manila"
      | "MexicoCity"
      | "Lagos"
      | "LegazpieCity"
      | "Lisbon"
      | "Kampala"
      | "Kigali"
      | "Kisumu"
      | "Kyiv"
      | "HongKong"
      | "Istanbul"
      | "Jakarta"
      | "Delhi"
      | "Enugu"
      | "Haripur"
      | "DarEsSalaam"
      | "Dasmarias"
      | "DavaoCity"
      | "Cebu2"
      | "Cebu3"
      | "Cebu"
      | "DaNang"
      | "BuenosAires"
      | "Camarines"
      | "Cartagena"
      | "Bangalore"
      | "Budapest"
      | "AngelesCity"
      | "Austin"
      | "BalangaCity"
      | "AddisAbaba"
      | "Accra"
      | "Abuja"
      | "Tagum"
      | "Brussels"
      | "Gosho"
      | "Ndotohub"
      | "Dubai",
    functionName: "totalSupply",
  });

  return (
    <tr>
      <td>{collection.name}</td>
      <td>{totalSupply?.toString() ?? "Loading..."}</td>
    </tr>
  );
}
