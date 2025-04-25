//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// import "../contracts/AlignmentV1.sol";
// import "../contracts/AlignmentManagerV1.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./DeployHelpers.s.sol";
import "../contracts/events/Ndotohub.sol";
import "../contracts/events/Brussels.sol";
import "../contracts/events/Gosho.sol";
import "../contracts/events/Yogyakarta.sol";
import "../contracts/events/Swabi.sol";
import "../contracts/events/Camarines.sol";
import "../contracts/events/Pune.sol";
import "../contracts/events/Nairobi.sol";
import "../contracts/events/HongKong.sol";
import "../contracts/events/Accra.sol";
import "../contracts/events/Cartagena.sol";
import "../contracts/events/DaNang.sol";
import "../contracts/events/Mumbai.sol";
import "../contracts/events/Bangalore.sol";
import "../contracts/events/NewYorkCity.sol";
import "../contracts/events/BuenosAires.sol";
import "../contracts/events/Manila.sol";
import "../contracts/events/Dubai.sol";
import "../contracts/events/DarEsSalaam.sol";
import "../contracts/events/Kigali.sol";
import "../contracts/events/Abuja.sol";
import "../contracts/events/AddisAbaba.sol";
import "../contracts/events/AngelesCity.sol";
import "../contracts/events/Austin.sol";
import "../contracts/events/BalangaCity.sol";
import "../contracts/events/Bangkok.sol";
import "../contracts/events/Budapest.sol";
import "../contracts/events/Cebu.sol";
import "../contracts/events/Cebu2.sol";
import "../contracts/events/Cebu3.sol";
import "../contracts/events/Dasmarias.sol";
import "../contracts/events/DavaoCity.sol";
import "../contracts/events/Delhi.sol";
import "../contracts/events/Enugu.sol";
import "../contracts/events/Haripur.sol";
import "../contracts/events/Istanbul.sol";
import "../contracts/events/Jakarta.sol";
import "../contracts/events/Kampala.sol";
import "../contracts/events/Kisumu.sol";
import "../contracts/events/Kyiv.sol";
import "../contracts/events/Lagos.sol";
import "../contracts/events/LegazpieCity.sol";
import "../contracts/events/Lisbon.sol";
import "../contracts/events/MakatiCity.sol";
import "../contracts/events/MalolosCity.sol";
import "../contracts/events/MexicoCity.sol";
import "../contracts/events/NagaCity.sol";
import "../contracts/events/PanabuCity.sol";
import "../contracts/events/Rome.sol";
import "../contracts/events/SaoPaulo.sol";
import "../contracts/events/Seoul.sol";
import "../contracts/events/Singapore.sol";
import "../contracts/events/Tagum.sol";
import "../contracts/events/Zanzibar.sol";
import "../contracts/events/Zug.sol";
import {PRBMathSD59x18 as P} from "prb-math/PRBMathSD59x18.sol";

contract DeployYourContract is ScaffoldETHDeploy {
    address[] admins;
    address[] alignmentAdders;
    address[] alignmentRemovers;
    address[] contractManagers;
    address[] managerAlignmentAdders;
    address[] nftContractSetters;
    address[] managerAlignmentRemovers;

    address[] minters;

    // address fundRecipient;

    // Helper function to convert date string "May 11" to UTC timestamp for 2025
    function getDateTimestamp(
        string memory dateStr
    ) internal pure returns (uint256 startTime, uint256 endTime) {
        bytes32 dateHash = keccak256(abi.encodePacked(dateStr));

        // Define timestamps for each date in 2025 (UTC midnight to midnight)
        if (dateHash == keccak256(abi.encodePacked("May 1"))) {
            startTime = 1746316800; // 2025-05-01 00:00:00 UTC
            endTime = 1746403199; // 2025-05-01 23:59:59 UTC
        } else if (dateHash == keccak256(abi.encodePacked("May 2"))) {
            startTime = 1746403200; // 2025-05-02 00:00:00 UTC
            endTime = 1746489599; // 2025-05-02 23:59:59 UTC
        } else if (dateHash == keccak256(abi.encodePacked("May 3"))) {
            startTime = 1746489600; // 2025-05-03 00:00:00 UTC
            endTime = 1746575999; // 2025-05-03 23:59:59 UTC
        } else if (dateHash == keccak256(abi.encodePacked("May 4"))) {
            startTime = 1746576000; // 2025-05-04 00:00:00 UTC
            endTime = 1746662399; // 2025-05-04 23:59:59 UTC
        } else if (dateHash == keccak256(abi.encodePacked("May 5"))) {
            startTime = 1746662400; // 2025-05-05 00:00:00 UTC
            endTime = 1746748799; // 2025-05-05 23:59:59 UTC
        } else if (dateHash == keccak256(abi.encodePacked("May 6"))) {
            startTime = 1746748800; // 2025-05-06 00:00:00 UTC
            endTime = 1746835199; // 2025-05-06 23:59:59 UTC
        } else if (dateHash == keccak256(abi.encodePacked("May 7"))) {
            startTime = 1746835200; // 2025-05-07 00:00:00 UTC
            endTime = 1746921599; // 2025-05-07 23:59:59 UTC
        } else if (dateHash == keccak256(abi.encodePacked("May 8"))) {
            startTime = 1746921600; // 2025-05-08 00:00:00 UTC
            endTime = 1747007999; // 2025-05-08 23:59:59 UTC
        } else if (dateHash == keccak256(abi.encodePacked("May 9"))) {
            startTime = 1747008000; // 2025-05-09 00:00:00 UTC
            endTime = 1747094399; // 2025-05-09 23:59:59 UTC
        } else if (dateHash == keccak256(abi.encodePacked("May 10"))) {
            startTime = 1747094400; // 2025-05-10 00:00:00 UTC
            endTime = 1747180799; // 2025-05-10 23:59:59 UTC
        } else if (dateHash == keccak256(abi.encodePacked("May 11"))) {
            startTime = 1747180800; // 2025-05-11 00:00:00 UTC
            endTime = 1747267199; // 2025-05-11 23:59:59 UTC
        } else if (dateHash == keccak256(abi.encodePacked("May 12"))) {
            startTime = 1747267200; // 2025-05-12 00:00:00 UTC
            endTime = 1747353599; // 2025-05-12 23:59:59 UTC
        } else if (dateHash == keccak256(abi.encodePacked("May 13"))) {
            startTime = 1747353600; // 2025-05-13 00:00:00 UTC
            endTime = 1747439999; // 2025-05-13 23:59:59 UTC
        } else if (dateHash == keccak256(abi.encodePacked("May 14"))) {
            startTime = 1747440000; // 2025-05-14 00:00:00 UTC
            endTime = 1747526399; // 2025-05-14 23:59:59 UTC
        } else if (dateHash == keccak256(abi.encodePacked("May 15"))) {
            startTime = 1747526400; // 2025-05-15 00:00:00 UTC
            endTime = 1747612799; // 2025-05-15 23:59:59 UTC
        } else if (dateHash == keccak256(abi.encodePacked("May 16"))) {
            startTime = 1747612800; // 2025-05-16 00:00:00 UTC
            endTime = 1747699199; // 2025-05-16 23:59:59 UTC
        } else if (dateHash == keccak256(abi.encodePacked("May 17"))) {
            startTime = 1747699200; // 2025-05-17 00:00:00 UTC
            endTime = 1747785599; // 2025-05-17 23:59:59 UTC
        } else if (dateHash == keccak256(abi.encodePacked("May 18"))) {
            startTime = 1747785600; // 2025-05-18 00:00:00 UTC
            endTime = 1747871999; // 2025-05-18 23:59:59 UTC
        } else if (dateHash == keccak256(abi.encodePacked("May 19"))) {
            startTime = 1747872000; // 2025-05-19 00:00:00 UTC
            endTime = 1747958399; // 2025-05-19 23:59:59 UTC
        } else if (dateHash == keccak256(abi.encodePacked("May 20"))) {
            startTime = 1747958400; // 2025-05-20 00:00:00 UTC
            endTime = 1748044799; // 2025-05-20 23:59:59 UTC
        } else if (dateHash == keccak256(abi.encodePacked("May 21"))) {
            startTime = 1748044800; // 2025-05-21 00:00:00 UTC
            endTime = 1748131199; // 2025-05-21 23:59:59 UTC
        } else if (dateHash == keccak256(abi.encodePacked("May 22"))) {
            startTime = 1748131200; // 2025-05-22 00:00:00 UTC
            endTime = 1748217599; // 2025-05-22 23:59:59 UTC
        } else if (dateHash == keccak256(abi.encodePacked("May 23"))) {
            startTime = 1748217600; // 2025-05-23 00:00:00 UTC
            endTime = 1748303999; // 2025-05-23 23:59:59 UTC
        } else if (dateHash == keccak256(abi.encodePacked("May 24"))) {
            startTime = 1748304000; // 2025-05-24 00:00:00 UTC
            endTime = 1748390399; // 2025-05-24 23:59:59 UTC
        } else if (dateHash == keccak256(abi.encodePacked("May 25"))) {
            startTime = 1748390400; // 2025-05-25 00:00:00 UTC
            endTime = 1748476799; // 2025-05-25 23:59:59 UTC
        } else if (dateHash == keccak256(abi.encodePacked("May 26"))) {
            startTime = 1748476800; // 2025-05-26 00:00:00 UTC
            endTime = 1748563199; // 2025-05-26 23:59:59 UTC
        } else if (dateHash == keccak256(abi.encodePacked("May 27"))) {
            startTime = 1748563200; // 2025-05-27 00:00:00 UTC
            endTime = 1748649599; // 2025-05-27 23:59:59 UTC
        } else if (dateHash == keccak256(abi.encodePacked("May 28"))) {
            startTime = 1748649600; // 2025-05-28 00:00:00 UTC
            endTime = 1748735999; // 2025-05-28 23:59:59 UTC
        } else if (dateHash == keccak256(abi.encodePacked("May 29"))) {
            startTime = 1748736000; // 2025-05-29 00:00:00 UTC
            endTime = 1748822399; // 2025-05-29 23:59:59 UTC
        } else if (dateHash == keccak256(abi.encodePacked("May 30"))) {
            startTime = 1748822400; // 2025-05-30 00:00:00 UTC
            endTime = 1748908799; // 2025-05-30 23:59:59 UTC
        } else if (dateHash == keccak256(abi.encodePacked("May 31"))) {
            startTime = 1748908800; // 2025-05-31 00:00:00 UTC
            endTime = 1748995199; // 2025-05-31 23:59:59 UTC
        } else {
            // Default to May 1 if date not found
            startTime = 1746316800; // 2025-05-01 00:00:00 UTC
            endTime = 1746403199; // 2025-05-01 23:59:59 UTC
        }

        return (startTime, endTime);
    }

    // use `deployer` from `ScaffoldETHDeploy`
    function run() external ScaffoldEthDeployerRunner {
        (, address _deployer, ) = vm.readCallers();

        // Get the chain ID to determine which network we're on
        uint256 chainId = block.chainid;

        // Set admin address based on the network
        if (chainId == 8453) {
            // Base Mainnet
            admins = [_deployer, 0xe80A48BcA9552d5DC6567841CdD5d0F870C4b98B];
            minters = [0xe80A48BcA9552d5DC6567841CdD5d0F870C4b98B];
            // contractManagers = [0xc0f0E1512D6A0A77ff7b9C172405D1B0d73565Bf];
            // managerAlignmentAdders = [
            //     0xc0f0E1512D6A0A77ff7b9C172405D1B0d73565Bf
            // ];
            // managerAlignmentRemovers = [
            //     0xc0f0E1512D6A0A77ff7b9C172405D1B0d73565Bf
            // ];
            // nftContractSetters = [0xCbEbcc04B4A5fA18089695AB357fD149c7862Cce];

            // fundRecipient = 0xc0f0E1512D6A0A77ff7b9C172405D1B0d73565Bf;
        } else if (chainId == 84531) {
            // Base Sepolia (testnet)
            admins = [_deployer, 0xe80A48BcA9552d5DC6567841CdD5d0F870C4b98B]; // You can change this to a different testnet address
            minters = [0xe80A48BcA9552d5DC6567841CdD5d0F870C4b98B];
            // contractManagers = [0xc0f0E1512D6A0A77ff7b9C172405D1B0d73565Bf];
            // managerAlignmentAdders = [
            //     0xc0f0E1512D6A0A77ff7b9C172405D1B0d73565Bf
            // ];
            // managerAlignmentRemovers = [
            //     0xc0f0E1512D6A0A77ff7b9C172405D1B0d73565Bf
            // ];
            // nftContractSetters = [0xCbEbcc04B4A5fA18089695AB357fD149c7862Cce];

            // fundRecipient = 0xc0f0E1512D6A0A77ff7b9C172405D1B0d73565Bf;
        } else {
            // Local development chain or other networks
            admins = [_deployer, 0xCbEbcc04B4A5fA18089695AB357fD149c7862Cce]; // Default anvil account
            minters = [0xCbEbcc04B4A5fA18089695AB357fD149c7862Cce];
            // contractManagers = [0xCbEbcc04B4A5fA18089695AB357fD149c7862Cce];
            // managerAlignmentAdders = [
            //     0xa0Ee7A142d267C1f36714E4a8F75612F20a79720
            // ];
            // managerAlignmentRemovers = [
            //     0xa0Ee7A142d267C1f36714E4a8F75612F20a79720
            // ];
            // nftContractSetters = [0xCbEbcc04B4A5fA18089695AB357fD149c7862Cce];
            // fundRecipient = 0xCbEbcc04B4A5fA18089695AB357fD149c7862Cce;
        }

        // Log which network and admin we're using
        console.logString(
            string.concat("Deploying on chain ID: ", vm.toString(chainId))
        );
        console.logString(
            string.concat("Using admin address: ", vm.toString(admins[0]))
        );

        address eas = 0x4200000000000000000000000000000000000021;
        bytes32 schemaUID = 0xd665d417263da788c9ec676caeb9f7a82c8824556107a3720c4c34037658129b;

        // Deploy all location contracts
        // Default timeframe (May 1, 2025) for Ndotohub since it's not in locations.config.ts
        (uint256 ndotohubStartTime, uint256 ndotohubEndTime) = getDateTimestamp(
            "May 1"
        );

        Ndotohub ndotohub = new Ndotohub(
            "Ndotohub",
            "NDOTOHUB",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/index.json",
            admins,
            minters,
            6033600000, // latitude in nanodegrees
            37483400000, // longitude in nanodegrees
            eas,
            schemaUID,
            ndotohubStartTime,
            ndotohubEndTime
        );

        // Get timestamps for Brussels (May 10 according to locations.config.ts)
        (uint256 brusselsStartTime, uint256 brusselsEndTime) = getDateTimestamp(
            "May 10"
        );

        Brussels brussels = new Brussels(
            "Brussels",
            "BRUSSELS",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/009-base-batch-workshop-budapest.json",
            admins,
            minters,
            eas,
            schemaUID,
            brusselsStartTime,
            brusselsEndTime
        );

        // Default timeframe (May 1, 2025) for Gosho since it's not clearly referenced in locations.config.ts
        (uint256 goshoStartTime, uint256 goshoEndTime) = getDateTimestamp(
            "May 1"
        );

        Gosho gosho = new Gosho(
            "Gosho",
            "GOSHO",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/index.json",
            admins,
            minters,
            42697500000, // latitude in nanodegrees
            23321600000, // longitude in nanodegrees
            eas,
            schemaUID,
            goshoStartTime,
            goshoEndTime
        );

        // Get timestamps for Yogyakarta (May 11 according to locations.config.ts)
        (
            uint256 yogyakartaStartTime,
            uint256 yogyakartaEndTime
        ) = getDateTimestamp("May 3");

        Yogyakarta yogyakarta = new Yogyakarta(
            "Yogyakarta",
            "YOGYAKARTA",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/049-base-batch-workshop-yogyakarta.json",
            admins,
            minters,
            eas,
            schemaUID,
            yogyakartaStartTime,
            yogyakartaEndTime
        );

        // Deploy new events from the Luma page
        // Get timestamps for Swabi (May 18 according to locations.config.ts)
        (uint256 swabiStartTime, uint256 swabiEndTime) = getDateTimestamp(
            "April 24"
        );

        Swabi swabi = new Swabi(
            "Swabi",
            "SWABI",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/047-base-batch-workshop-swabi.json",
            admins,
            minters,
            eas,
            schemaUID,
            swabiStartTime,
            swabiEndTime
        );

        // Get timestamps for Camarines (May 4 according to locations.config.ts)
        (
            uint256 camarinesStartTime,
            uint256 camarinesEndTime
        ) = getDateTimestamp("May 4");

        Camarines camarines = new Camarines(
            "Camarines",
            "CAMARINES",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/011-base-batch-workshop-camarines.json",
            admins,
            minters,
            eas,
            schemaUID,
            camarinesStartTime,
            camarinesEndTime
        );

        // Get timestamps for Pune (May 11 according to locations.config.ts)
        (uint256 puneStartTime, uint256 puneEndTime) = getDateTimestamp(
            "April 26"
        );

        Pune pune = new Pune(
            "Pune",
            "PUNE",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/042-base-batch-workshop-pune.json",
            admins,
            minters,
            eas,
            schemaUID,
            puneStartTime,
            puneEndTime
        );

        // Get timestamps for Nairobi (May 18 according to locations.config.ts)
        (uint256 nairobiStartTime, uint256 nairobiEndTime) = getDateTimestamp(
            "May 18"
        );

        Nairobi nairobi = new Nairobi(
            "Nairobi",
            "NAIROBI",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/039-base-batch-workshop-nairobi.json",
            admins,
            minters,
            eas,
            schemaUID,
            nairobiStartTime,
            nairobiEndTime
        );

        // Get timestamps for HongKong (May 22 according to locations.config.ts)
        (uint256 hongKongStartTime, uint256 hongKongEndTime) = getDateTimestamp(
            "April 26"
        );

        HongKong hongKong = new HongKong(
            "HongKong",
            "HONGKONG",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/023-base-batch-workshop-hong-kong.json",
            admins,
            minters,
            eas,
            schemaUID,
            hongKongStartTime,
            hongKongEndTime
        );

        // Get timestamps for Accra (May 10 according to locations.config.ts)
        (uint256 accraStartTime, uint256 accraEndTime) = getDateTimestamp(
            "May 10"
        );

        Accra accra = new Accra(
            "Accra",
            "ACCRA",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/002-base-batch-workshop-accra.json",
            admins,
            minters,
            eas,
            schemaUID,
            accraStartTime,
            accraEndTime
        );

        // Get timestamps for Cartagena (May 18 according to locations.config.ts)
        (
            uint256 cartagenaStartTime,
            uint256 cartagenaEndTime
        ) = getDateTimestamp("May 18");

        Cartagena cartagena = new Cartagena(
            "Cartagena",
            "CARTAGENA",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/012-base-batch-workshop-cartagena.json",
            admins,
            minters,
            eas,
            schemaUID,
            cartagenaStartTime,
            cartagenaEndTime
        );

        // Get timestamps for DaNang (May 12 according to locations.config.ts)
        (uint256 daNangStartTime, uint256 daNangEndTime) = getDateTimestamp(
            "May 12"
        );

        DaNang daNang = new DaNang(
            "DaNang",
            "DANANG",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/016-base-batch-workshop-da-nang.json",
            admins,
            minters,
            eas,
            schemaUID,
            daNangStartTime,
            daNangEndTime
        );

        // Get timestamps for Mumbai (May 18 according to locations.config.ts)
        (uint256 mumbaiStartTime, uint256 mumbaiEndTime) = getDateTimestamp(
            "April 27"
        );

        Mumbai mumbai = new Mumbai(
            "Mumbai",
            "MUMBAI",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/037-base-batch-workshop-mumbai.json",
            admins,
            minters,
            eas,
            schemaUID,
            mumbaiStartTime,
            mumbaiEndTime
        );

        // Get timestamps for Bangalore (May 4 according to locations.config.ts)
        (
            uint256 bangaloreStartTime,
            uint256 bangaloreEndTime
        ) = getDateTimestamp("April 27");

        Bangalore bangalore = new Bangalore(
            "Bangalore",
            "BANGALORE",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/007-base-batch-workshop-bangalore.json",
            admins,
            minters,
            eas,
            schemaUID,
            bangaloreStartTime,
            bangaloreEndTime
        );

        // Get timestamps for NewYorkCity (May 4 according to locations.config.ts)
        (
            uint256 newYorkCityStartTime,
            uint256 newYorkCityEndTime
        ) = getDateTimestamp("May 4");

        NewYorkCity newYorkCity = new NewYorkCity(
            "NewYorkCity",
            "NYC",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/040-base-batch-workshop-new-york-city.json",
            admins,
            minters,
            eas,
            schemaUID,
            newYorkCityStartTime,
            newYorkCityEndTime
        );

        // Get timestamps for BuenosAires (May 21 according to locations.config.ts)
        (
            uint256 buenosAiresStartTime,
            uint256 buenosAiresEndTime
        ) = getDateTimestamp("May 21");

        BuenosAires buenosAires = new BuenosAires(
            "BuenosAires",
            "BUENOSAIRES",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/010-base-batch-workshop-buenos-aires.json",
            admins,
            minters,
            eas,
            schemaUID,
            buenosAiresStartTime,
            buenosAiresEndTime
        );

        // Get timestamps for Manila (May 9 according to locations.config.ts)
        (uint256 manilaStartTime, uint256 manilaEndTime) = getDateTimestamp(
            "May 9"
        );

        Manila manila = new Manila(
            "Manila",
            "MANILA",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/035-base-batch-workshop-manila-city.json",
            admins,
            minters,
            eas,
            schemaUID,
            manilaStartTime,
            manilaEndTime
        );

        // Default timeframe for Dubai (May 1, 2025) since exact date not found
        (uint256 dubaiStartTime, uint256 dubaiEndTime) = getDateTimestamp(
            "May 1"
        );

        Dubai dubai = new Dubai(
            "Dubai",
            "DUBAI",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/index.json",
            admins,
            minters,
            eas,
            schemaUID,
            dubaiStartTime,
            dubaiEndTime
        );

        // Get timestamps for DarEsSalaam (May 18 according to locations.config.ts)
        (
            uint256 darEsSalaamStartTime,
            uint256 darEsSalaamEndTime
        ) = getDateTimestamp("May 18");

        DarEsSalaam darEsSalaam = new DarEsSalaam(
            "DarEsSalaam",
            "DARESSALAAM",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/017-base-batch-workshop-dar-es-salaam.json",
            admins,
            minters,
            eas,
            schemaUID,
            darEsSalaamStartTime,
            darEsSalaamEndTime
        );

        // Get timestamps for Kigali (May 11 according to locations.config.ts)
        (uint256 kigaliStartTime, uint256 kigaliEndTime) = getDateTimestamp(
            "May 11"
        );

        Kigali kigali = new Kigali(
            "Kigali",
            "KIGALI",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/027-base-batch-workshop-kigali.json",
            admins,
            minters,
            eas,
            schemaUID,
            kigaliStartTime,
            kigaliEndTime
        );

        // Get timestamps for Abuja (May 11 according to locations.config.ts)
        (uint256 abujaStartTime, uint256 abujaEndTime) = getDateTimestamp(
            "May 11"
        );

        Abuja abuja = new Abuja(
            "Abuja",
            "ABUJA",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/001-base-batch-workshop-abuja.json",
            admins,
            minters,
            eas,
            schemaUID,
            abujaStartTime,
            abujaEndTime
        );

        // Get timestamps for AddisAbaba (May 18 according to locations.config.ts)
        (
            uint256 addisAbabaStartTime,
            uint256 addisAbabaEndTime
        ) = getDateTimestamp("May 18");

        AddisAbaba addisAbaba = new AddisAbaba(
            "AddisAbaba",
            "ADDISABABA",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/003-base-batch-workshop-addis-ababa.json",
            admins,
            minters,
            eas,
            schemaUID,
            addisAbabaStartTime,
            addisAbabaEndTime
        );

        // Get timestamps for AngelesCity (May 23 according to locations.config.ts)
        (
            uint256 angelesCityStartTime,
            uint256 angelesCityEndTime
        ) = getDateTimestamp("May 23");

        AngelesCity angelesCity = new AngelesCity(
            "AngelesCity",
            "ANGELESCITY",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/004-base-batch-workshop-angeles-city.json",
            admins,
            minters,
            eas,
            schemaUID,
            angelesCityStartTime,
            angelesCityEndTime
        );

        // Get timestamps for Austin (May 16 according to locations.config.ts)
        (uint256 austinStartTime, uint256 austinEndTime) = getDateTimestamp(
            "May 16"
        );

        Austin austin = new Austin(
            "Austin",
            "AUSTIN",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/005-base-batch-workshop-austin.json",
            admins,
            minters,
            eas,
            schemaUID,
            austinStartTime,
            austinEndTime
        );

        // Get timestamps for BalangaCity (May 23 according to locations.config.ts)
        (
            uint256 balangaCityStartTime,
            uint256 balangaCityEndTime
        ) = getDateTimestamp("May 23");

        BalangaCity balangaCity = new BalangaCity(
            "BalangaCity",
            "BALANGACITY",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/006-base-batch-workshop-balanga-city.json",
            admins,
            minters,
            eas,
            schemaUID,
            balangaCityStartTime,
            balangaCityEndTime
        );

        // Get timestamps for Bangkok (May 10 according to locations.config.ts)
        (uint256 bangkokStartTime, uint256 bangkokEndTime) = getDateTimestamp(
            "May 10"
        );

        Bangkok bangkok = new Bangkok(
            "Bangkok",
            "BANGKOK",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/008-base-batch-workshop-bangkok.json",
            admins,
            minters,
            eas,
            schemaUID,
            bangkokStartTime,
            bangkokEndTime
        );

        // Get timestamps for Budapest (May 16 according to locations.config.ts)
        (uint256 budapestStartTime, uint256 budapestEndTime) = getDateTimestamp(
            "May 16"
        );

        Budapest budapest = new Budapest(
            "Budapest",
            "BUDAPEST",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/009-base-batch-workshop-budapest.json",
            admins,
            minters,
            eas,
            schemaUID,
            budapestStartTime,
            budapestEndTime
        );

        // Get timestamps for Cebu (May 18 according to locations.config.ts)
        (uint256 cebuStartTime, uint256 cebuEndTime) = getDateTimestamp(
            "May 8"
        );

        Cebu cebu = new Cebu(
            "Cebu",
            "CEBU",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/015-base-batch-workshop-cebu.json",
            admins,
            minters,
            eas,
            schemaUID,
            cebuStartTime,
            cebuEndTime
        );

        // Get timestamps for Cebu2 (May 10 according to locations.config.ts)
        (uint256 cebu2StartTime, uint256 cebu2EndTime) = getDateTimestamp(
            "May 10"
        );

        Cebu2 cebu2 = new Cebu2(
            "Cebu2",
            "CEBU2",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/013-base-batch-workshop-cebu-2.json",
            admins,
            minters,
            eas,
            schemaUID,
            cebu2StartTime,
            cebu2EndTime
        );

        // Get timestamps for Cebu3 (May 11 according to locations.config.ts)
        (uint256 cebu3StartTime, uint256 cebu3EndTime) = getDateTimestamp(
            "May 11"
        );

        Cebu3 cebu3 = new Cebu3(
            "Cebu3",
            "CEBU3",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/014-base-batch-workshop-cebu-3.json",
            admins,
            minters,
            eas,
            schemaUID,
            cebu3StartTime,
            cebu3EndTime
        );

        // Get timestamps for Dasmarias (May 4 according to locations.config.ts)
        (
            uint256 dasmariasStartTime,
            uint256 dasmariasEndTime
        ) = getDateTimestamp("May 4");

        Dasmarias dasmarias = new Dasmarias(
            "Dasmarias",
            "DASMARIAS",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/018-base-batch-workshop-dasmarias.json",
            admins,
            minters,
            eas,
            schemaUID,
            dasmariasStartTime,
            dasmariasEndTime
        );

        // Get timestamps for DavaoCity (May 25 according to locations.config.ts)
        (
            uint256 davaoCityStartTime,
            uint256 davaoCityEndTime
        ) = getDateTimestamp("May 25");

        DavaoCity davaoCity = new DavaoCity(
            "DavaoCity",
            "DAVAOCITY",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/019-base-batch-workshop-davao-city.json",
            admins,
            minters,
            eas,
            schemaUID,
            davaoCityStartTime,
            davaoCityEndTime
        );

        // Get timestamps for Delhi (May 10 according to locations.config.ts)
        (uint256 delhiStartTime, uint256 delhiEndTime) = getDateTimestamp(
            "May 3"
        );

        Delhi delhi = new Delhi(
            "Delhi",
            "DELHI",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/020-base-batch-workshop-delhi.json",
            admins,
            minters,
            eas,
            schemaUID,
            delhiStartTime,
            delhiEndTime
        );

        // Get timestamps for Enugu (May 17 according to locations.config.ts)
        (uint256 enuguStartTime, uint256 enuguEndTime) = getDateTimestamp(
            "May 17"
        );

        Enugu enugu = new Enugu(
            "Enugu",
            "ENUGU",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/021-base-batch-workshop-enugu.json",
            admins,
            minters,
            eas,
            schemaUID,
            enuguStartTime,
            enuguEndTime
        );

        // Get timestamps for Haripur (May 19 according to locations.config.ts)
        (uint256 haripurStartTime, uint256 haripurEndTime) = getDateTimestamp(
            "May 7"
        );

        Haripur haripur = new Haripur(
            "Haripur",
            "HARIPUR",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/022-base-batch-workshop-haripur.json",
            admins,
            minters,
            eas,
            schemaUID,
            haripurStartTime,
            haripurEndTime
        );

        // Get timestamps for Istanbul (May 4 according to locations.config.ts)
        (uint256 istanbulStartTime, uint256 istanbulEndTime) = getDateTimestamp(
            "May 10"
        );

        Istanbul istanbul = new Istanbul(
            "Istanbul",
            "ISTANBUL",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/024-base-batch-workshop-istanbul.json",
            admins,
            minters,
            eas,
            schemaUID,
            istanbulStartTime,
            istanbulEndTime
        );

        // Get timestamps for Jakarta (May 8 according to locations.config.ts)
        (uint256 jakartaStartTime, uint256 jakartaEndTime) = getDateTimestamp(
            "May 4"
        );

        Jakarta jakarta = new Jakarta(
            "Jakarta",
            "JAKARTA",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/025-base-batch-workshop-jakarta.json",
            admins,
            minters,
            -6140370000, // latitude in nanodegrees (Jakarta is at approximately -6.1403°)
            106815500000, // longitude in nanodegrees (Jakarta is at approximately 106.8155°)
            eas,
            schemaUID,
            jakartaStartTime,
            jakartaEndTime
        );

        // Get timestamps for Kampala (May 4 according to locations.config.ts)
        (uint256 kampalaStartTime, uint256 kampalaEndTime) = getDateTimestamp(
            "May 4"
        );

        Kampala kampala = new Kampala(
            "Kampala",
            "KAMPALA",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/026-base-batch-workshop-kampala.json",
            admins,
            minters,
            eas,
            schemaUID,
            kampalaStartTime,
            kampalaEndTime
        );

        // Get timestamps for Kisumu (May 4 according to locations.config.ts)
        (uint256 kisumuStartTime, uint256 kisumuEndTime) = getDateTimestamp(
            "May 4"
        );

        Kisumu kisumu = new Kisumu(
            "Kisumu",
            "KISUMU",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/028-base-batch-workshop-kisumu.json",
            admins,
            minters,
            eas,
            schemaUID,
            kisumuStartTime,
            kisumuEndTime
        );

        // Get timestamps for Kyiv (May 25 according to locations.config.ts)
        (uint256 kyivStartTime, uint256 kyivEndTime) = getDateTimestamp(
            "May 25"
        );

        Kyiv kyiv = new Kyiv(
            "Kyiv",
            "KYIV",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/029-base-batch-workshop-kyiv.json",
            admins,
            minters,
            eas,
            schemaUID,
            kyivStartTime,
            kyivEndTime
        );

        // Get timestamps for Lagos (May 18 according to locations.config.ts)
        (uint256 lagosStartTime, uint256 lagosEndTime) = getDateTimestamp(
            "May 18"
        );

        Lagos lagos = new Lagos(
            "Lagos",
            "LAGOS",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/030-base-batch-workshop-lagos.json",
            admins,
            minters,
            eas,
            schemaUID,
            lagosStartTime,
            lagosEndTime
        );

        // Get timestamps for LegazpieCity (May 18 according to locations.config.ts)
        (
            uint256 legazpieCityStartTime,
            uint256 legazpieCityEndTime
        ) = getDateTimestamp("May 18");

        LegazpieCity legazpieCity = new LegazpieCity(
            "LegazpieCity",
            "LEGAZPIECITY",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/031-base-batch-workshop-legazpie-city.json",
            admins,
            minters,
            eas,
            schemaUID,
            legazpieCityStartTime,
            legazpieCityEndTime
        );

        // Get timestamps for Lisbon (May 10 according to locations.config.ts)
        (uint256 lisbonStartTime, uint256 lisbonEndTime) = getDateTimestamp(
            "May 10"
        );

        Lisbon lisbon = new Lisbon(
            "Lisbon",
            "LISBON",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/032-base-batch-workshop-lisbon.json",
            admins,
            minters,
            eas,
            schemaUID,
            lisbonStartTime,
            lisbonEndTime
        );

        // Get timestamps for MakatiCity (May 8 according to locations.config.ts)
        (
            uint256 makatiCityStartTime,
            uint256 makatiCityEndTime
        ) = getDateTimestamp("May 8");

        MakatiCity makatiCity = new MakatiCity(
            "MakatiCity",
            "MAKATICITY",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/033-base-batch-workshop-makati-city.json",
            admins,
            minters,
            eas,
            schemaUID,
            makatiCityStartTime,
            makatiCityEndTime
        );

        // Get timestamps for MalolosCity (May 9 according to locations.config.ts)
        (
            uint256 malolosCityStartTime,
            uint256 malolosCityEndTime
        ) = getDateTimestamp("May 9");

        MalolosCity malolosCity = new MalolosCity(
            "MalolosCity",
            "MALOLOSCITY",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/034-base-batch-workshop-malolos-city.json",
            admins,
            minters,
            eas,
            schemaUID,
            malolosCityStartTime,
            malolosCityEndTime
        );

        // Get timestamps for MexicoCity (May 11 according to locations.config.ts)
        (
            uint256 mexicoCityStartTime,
            uint256 mexicoCityEndTime
        ) = getDateTimestamp("May 11");

        MexicoCity mexicoCity = new MexicoCity(
            "MexicoCity",
            "MEXICOCITY",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/036-base-batch-workshop-mexico-city.json",
            admins,
            minters,
            eas,
            schemaUID,
            mexicoCityStartTime,
            mexicoCityEndTime
        );

        // Get timestamps for NagaCity (May 6 according to locations.config.ts)
        (uint256 nagaCityStartTime, uint256 nagaCityEndTime) = getDateTimestamp(
            "May 6"
        );

        NagaCity nagaCity = new NagaCity(
            "NagaCity",
            "NAGACITY",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/038-base-batch-workshop-naga-city.json",
            admins,
            minters,
            eas,
            schemaUID,
            nagaCityStartTime,
            nagaCityEndTime
        );

        // Get timestamps for PanabuCity (May 17 according to locations.config.ts)
        (
            uint256 panabuCityStartTime,
            uint256 panabuCityEndTime
        ) = getDateTimestamp("May 17");

        PanabuCity panabuCity = new PanabuCity(
            "PanabuCity",
            "PANABUCITY",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/041-base-batch-workshop-panabu-city.json",
            admins,
            minters,
            eas,
            schemaUID,
            panabuCityStartTime,
            panabuCityEndTime
        );

        // Get timestamps for Rome (May 6 according to locations.config.ts)
        (uint256 romeStartTime, uint256 romeEndTime) = getDateTimestamp(
            "May 6"
        );

        Rome rome = new Rome(
            "Rome",
            "ROME",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/043-base-batch-workshop-rome.json",
            admins,
            minters,
            eas,
            schemaUID,
            romeStartTime,
            romeEndTime
        );

        // Get timestamps for SaoPaulo (May 18 according to locations.config.ts)
        (uint256 saoPauloStartTime, uint256 saoPauloEndTime) = getDateTimestamp(
            "May 18"
        );

        SaoPaulo saoPaulo = new SaoPaulo(
            "SaoPaulo",
            "SAOPAULO",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/046-base-batch-workshop-so-paulo.json",
            admins,
            minters,
            eas,
            schemaUID,
            saoPauloStartTime,
            saoPauloEndTime
        );

        // Get timestamps for Seoul (May 18 according to locations.config.ts)
        (uint256 seoulStartTime, uint256 seoulEndTime) = getDateTimestamp(
            "May 18"
        );

        Seoul seoul = new Seoul(
            "Seoul",
            "SEOUL",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/044-base-batch-workshop-seoul.json",
            admins,
            minters,
            eas,
            schemaUID,
            seoulStartTime,
            seoulEndTime
        );

        // Get timestamps for Singapore (May 15 according to locations.config.ts)
        (
            uint256 singaporeStartTime,
            uint256 singaporeEndTime
        ) = getDateTimestamp("May 15");

        Singapore singapore = new Singapore(
            "Singapore",
            "SINGAPORE",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/045-base-batch-workshop-singapore.json",
            admins,
            minters,
            eas,
            schemaUID,
            singaporeStartTime,
            singaporeEndTime
        );

        // Get timestamps for Tagum (May 3 according to locations.config.ts)
        (uint256 tagumStartTime, uint256 tagumEndTime) = getDateTimestamp(
            "May 3"
        );

        Tagum tagum = new Tagum(
            "Tagum",
            "TAGUM",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/048-base-batch-workshop-tagum.json",
            admins,
            minters,
            eas,
            schemaUID,
            tagumStartTime,
            tagumEndTime
        );

        // Get timestamps for Zanzibar (May 10 according to locations.config.ts)
        (uint256 zanzibarStartTime, uint256 zanzibarEndTime) = getDateTimestamp(
            "May 10"
        );

        Zanzibar zanzibar = new Zanzibar(
            "Zanzibar",
            "ZANZIBAR",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/050-base-batch-workshop-zanzibar.json",
            admins,
            minters,
            eas,
            schemaUID,
            zanzibarStartTime,
            zanzibarEndTime
        );

        // Get timestamps for Zug (May 13 according to locations.config.ts)
        (uint256 zugStartTime, uint256 zugEndTime) = getDateTimestamp("May 13");

        Zug zug = new Zug(
            "Zug",
            "ZUG",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/051-base-batch-workshop-zug.json",
            admins,
            minters,
            eas,
            schemaUID,
            zugStartTime,
            zugEndTime
        );
    }
}
