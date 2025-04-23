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

        Ndotohub ndotohub = new Ndotohub(
            "Ndotohub",
            "NDOTOHUB",
            "ipfs://bafkreibengojht5th2j2ph3exuf5pfpcabipzxxeclra54hxq2hkm7p65e",
            admins,
            minters,
            -3381659533,
            36701730603,
            0x4200000000000000000000000000000000000021,
            0xd665d417263da788c9ec676caeb9f7a82c8824556107a3720c4c34037658129b
        );

        Brussels brussels = new Brussels(
            "Brussels",
            "BRUSSELS",
            "ipfs://bafkreiemlbkgj222hnjo5eqt7wy4jp6t5zcfobzbxqlpoyc2rywtxhfyp4",
            admins,
            minters,
            50822830042, // 50.84360536860012 * 10^9
            4358665232, // 4.355158216238602 * 10^9
            0x4200000000000000000000000000000000000021,
            0xd665d417263da788c9ec676caeb9f7a82c8824556107a3720c4c34037658129b
        );

        Gosho gosho = new Gosho(
            "Gosho",
            "GOSHO",
            "ipfs://bafkreidsmtbi7234m6v4wq6r2secpmuf5ykz4zfvd5go3akdtmt574xy2i",
            admins,
            minters,
            -18179401293,
            31627820559,
            0x4200000000000000000000000000000000000021,
            0xd665d417263da788c9ec676caeb9f7a82c8824556107a3720c4c34037658129b
        );

        Yogyakarta yogyakarta = new Yogyakarta(
            "Yogyakarta",
            "YOGYAKARTA",
            "ipfs://bafkreid7jpfdtxbmixgoi4bfg3wa76rqhvgdzo3bmgrrcfkbqoxznh6kry",
            admins,
            minters,
            -7797068111,
            110370529110,
            0x4200000000000000000000000000000000000021,
            0xd665d417263da788c9ec676caeb9f7a82c8824556107a3720c4c34037658129b
        );

        // Deploy new events from the Luma page

        Swabi swabi = new Swabi(
            "Swabi",
            "SWABI",
            "ipfs://placeholder-uri-for-swabi",
            admins,
            minters,
            34040271481, // Latitude for Swabi, Pakistan
            72458903443, // Longitude for Swabi, Pakistan
            0x4200000000000000000000000000000000000021,
            0xd665d417263da788c9ec676caeb9f7a82c8824556107a3720c4c34037658129b
        );

        Camarines camarines = new Camarines(
            "Camarines",
            "CAMARINES",
            "ipfs://placeholder-uri-for-camarines",
            admins,
            minters,
            13622775178, // Latitude for Camarines, Philippines
            123354691267, // Longitude for Camarines, Philippines
            0x4200000000000000000000000000000000000021,
            0xd665d417263da788c9ec676caeb9f7a82c8824556107a3720c4c34037658129b
        );

        Pune pune = new Pune(
            "Pune",
            "PUNE",
            "ipfs://placeholder-uri-for-pune",
            admins,
            minters,
            18520430196, // Latitude for Pune, India
            73854694366, // Longitude for Pune, India
            0x4200000000000000000000000000000000000021,
            0xd665d417263da788c9ec676caeb9f7a82c8824556107a3720c4c34037658129b
        );

        Nairobi nairobi = new Nairobi(
            "Nairobi",
            "NAIROBI",
            "ipfs://placeholder-uri-for-nairobi",
            admins,
            minters,
            -1292066069, // Latitude for Nairobi, Kenya
            36821945190, // Longitude for Nairobi, Kenya
            0x4200000000000000000000000000000000000021,
            0xd665d417263da788c9ec676caeb9f7a82c8824556107a3720c4c34037658129b
        );

        HongKong hongKong = new HongKong(
            "HongKong",
            "HONGKONG",
            "ipfs://placeholder-uri-for-hongkong",
            admins,
            minters,
            22396428204, // Latitude for Hong Kong, China
            114109497070, // Longitude for Hong Kong, China
            0x4200000000000000000000000000000000000021,
            0xd665d417263da788c9ec676caeb9f7a82c8824556107a3720c4c34037658129b
        );

        Accra accra = new Accra(
            "Accra",
            "ACCRA",
            "ipfs://placeholder-uri-for-accra",
            admins,
            minters,
            5560000000, // Latitude for Accra, Ghana (5.56 * 10^9)
            -205782500, // Longitude for Accra, Ghana (-0.2057825 * 10^9)
            0x4200000000000000000000000000000000000021,
            0xd665d417263da788c9ec676caeb9f7a82c8824556107a3720c4c34037658129b
        );

        Cartagena cartagena = new Cartagena(
            "Cartagena",
            "CARTAGENA",
            "ipfs://placeholder-uri-for-cartagena",
            admins,
            minters,
            10391000000, // Latitude for Cartagena, Colombia (10.391 * 10^9)
            -75479400000, // Longitude for Cartagena, Colombia (-75.4794 * 10^9)
            0x4200000000000000000000000000000000000021,
            0xd665d417263da788c9ec676caeb9f7a82c8824556107a3720c4c34037658129b
        );

        DaNang daNang = new DaNang(
            "DaNang",
            "DANANG",
            "ipfs://placeholder-uri-for-danang",
            admins,
            minters,
            16054400000, // Latitude for Da Nang, Vietnam (16.0544 * 10^9)
            108202200000, // Longitude for Da Nang, Vietnam (108.2022 * 10^9)
            0x4200000000000000000000000000000000000021,
            0xd665d417263da788c9ec676caeb9f7a82c8824556107a3720c4c34037658129b
        );

        Mumbai mumbai = new Mumbai(
            "Mumbai",
            "MUMBAI",
            "ipfs://placeholder-uri-for-mumbai",
            admins,
            minters,
            19076000000, // Latitude for Mumbai, India (19.076 * 10^9)
            72877700000, // Longitude for Mumbai, India (72.8777 * 10^9)
            0x4200000000000000000000000000000000000021,
            0xd665d417263da788c9ec676caeb9f7a82c8824556107a3720c4c34037658129b
        );

        Bangalore bangalore = new Bangalore(
            "Bangalore",
            "BANGALORE",
            "ipfs://placeholder-uri-for-bangalore",
            admins,
            minters,
            12971600000, // Latitude for Bangalore, India (12.9716 * 10^9)
            77594600000, // Longitude for Bangalore, India (77.5946 * 10^9)
            0x4200000000000000000000000000000000000021,
            0xd665d417263da788c9ec676caeb9f7a82c8824556107a3720c4c34037658129b
        );

        NewYorkCity newYorkCity = new NewYorkCity(
            "NewYorkCity",
            "NYC",
            "ipfs://placeholder-uri-for-nyc",
            admins,
            minters,
            40712800000, // Latitude for New York City, USA (40.7128 * 10^9)
            -74006000000, // Longitude for New York City, USA (-74.006 * 10^9)
            0x4200000000000000000000000000000000000021,
            0xd665d417263da788c9ec676caeb9f7a82c8824556107a3720c4c34037658129b
        );

        BuenosAires buenosAires = new BuenosAires(
            "BuenosAires",
            "BUENOSAIRES",
            "ipfs://placeholder-uri-for-buenosaires",
            admins,
            minters,
            -34603700000, // Latitude for Buenos Aires, Argentina (-34.6037 * 10^9)
            -58381600000, // Longitude for Buenos Aires, Argentina (-58.3816 * 10^9)
            0x4200000000000000000000000000000000000021,
            0xd665d417263da788c9ec676caeb9f7a82c8824556107a3720c4c34037658129b
        );

        Manila manila = new Manila(
            "Manila",
            "MANILA",
            "ipfs://placeholder-uri-for-manila",
            admins,
            minters,
            14599500000, // Latitude for Manila, Philippines (14.5995 * 10^9)
            120984200000, // Longitude for Manila, Philippines (120.9842 * 10^9)
            0x4200000000000000000000000000000000000021,
            0xd665d417263da788c9ec676caeb9f7a82c8824556107a3720c4c34037658129b
        );

        Dubai dubai = new Dubai(
            "Dubai",
            "DUBAI",
            "ipfs://placeholder-uri-for-dubai",
            admins,
            minters,
            25204800000, // Latitude for Dubai, UAE (25.2048 * 10^9)
            55270800000, // Longitude for Dubai, UAE (55.2708 * 10^9)
            0x4200000000000000000000000000000000000021,
            0xd665d417263da788c9ec676caeb9f7a82c8824556107a3720c4c34037658129b
        );

        DarEsSalaam darEsSalaam = new DarEsSalaam(
            "DarEsSalaam",
            "DARESSALAAM",
            "ipfs://placeholder-uri-for-daressalaam",
            admins,
            minters,
            -6792400000, // Latitude for Dar Es Salaam, Tanzania (-6.7924 * 10^9)
            39208300000, // Longitude for Dar Es Salaam, Tanzania (39.2083 * 10^9)
            0x4200000000000000000000000000000000000021,
            0xd665d417263da788c9ec676caeb9f7a82c8824556107a3720c4c34037658129b
        );

        Kigali kigali = new Kigali(
            "Kigali",
            "KIGALI",
            "ipfs://placeholder-uri-for-kigali",
            admins,
            minters,
            -1970600000, // Latitude for Kigali, Rwanda (-1.9706 * 10^9)
            30104400000, // Longitude for Kigali, Rwanda (30.1044 * 10^9)
            0x4200000000000000000000000000000000000021,
            0xd665d417263da788c9ec676caeb9f7a82c8824556107a3720c4c34037658129b
        );

        // console.logString(
        //     string.concat(
        //         "NFT deployed at: ",
        //         vm.toString(address(nftContract))
        //     )
        // );

        // AlignmentManagerV1 alignmentManager = new AlignmentManagerV1(
        //     admins,
        //     contractManagers,
        //     managerAlignmentAdders,
        //     managerAlignmentRemovers,
        //     nftContractSetters
        // );

        // nftContract.grantRole(
        //     nftContract.MINTER_ROLE(),
        //     address(alignmentManager)
        // );

        // alignmentAdders = [address(alignmentManager)];
        // alignmentRemovers = [address(alignmentManager)];
        // AlignmentV1 alignment = new AlignmentV1(
        //     admins,
        //     alignmentAdders,
        //     alignmentRemovers
        // );

        // alignmentManager.grantRole(
        //     alignmentManager.CONTRACT_MANAGER_ROLE(),
        //     _deployer
        // );

        // alignmentManager.grantRole(
        //     alignmentManager.NFT_CONTRACT_SETTER_ROLE(),
        //     _deployer
        // );

        // alignmentManager.grantRole(
        //     alignmentManager.COST_MANAGER_ROLE(),
        //     _deployer
        // );

        // alignmentManager.grantRole(
        //     alignmentManager.FUNDS_MANAGER_ROLE(),
        //     _deployer
        // );

        // alignmentManager.setAlignmentContract(address(alignment));
        // alignmentManager.setNftContract(address(nftContract));
        // alignmentManager.setAlignmentCost(0.00086 ether);
        // alignmentManager.setFundRecipient(fundRecipient);
        // alignmentManager.revokeRole(
        //     alignmentManager.CONTRACT_MANAGER_ROLE(),
        //     _deployer
        // );
        // alignmentManager.revokeRole(
        //     alignmentManager.COST_MANAGER_ROLE(),
        //     _deployer
        // );
        // alignmentManager.revokeRole(
        //     alignmentManager.FUNDS_MANAGER_ROLE(),
        //     _deployer
        // );

        // console.logString(
        //     string.concat(
        //         "Alignment deployed at: ",
        //         vm.toString(address(alignment))
        //     )
        // );

        // console.logString(
        //     string.concat(
        //         "AlignmentManager deployed at: ",
        //         vm.toString(address(alignmentManager))
        //     )
        // );
    }
}
