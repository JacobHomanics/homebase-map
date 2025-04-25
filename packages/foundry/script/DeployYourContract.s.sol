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

        address eas = 0x4200000000000000000000000000000000000021;
        bytes32 schemaUID = 0xd665d417263da788c9ec676caeb9f7a82c8824556107a3720c4c34037658129b;

        // Deploy all location contracts
        Ndotohub ndotohub = new Ndotohub(
            "Ndotohub",
            "NDOTOHUB",
            "ipfs://bafkreibengojht5th2j2ph3exuf5pfpcabipzxxeclra54hxq2hkm7p65e",
            admins,
            minters,
            6033600000, // latitude in nanodegrees
            37483400000, // longitude in nanodegrees
            eas,
            schemaUID
        );

        Brussels brussels = new Brussels(
            "Brussels",
            "BRUSSELS",
            "ipfs://bafkreiemlbkgj222hnjo5eqt7wy4jp6t5zcfobzbxqlpoyc2rywtxhfyp4",
            admins,
            minters,
            eas,
            schemaUID
        );

        Gosho gosho = new Gosho(
            "Gosho",
            "GOSHO",
            "ipfs://bafkreidsmtbi7234m6v4wq6r2secpmuf5ykz4zfvd5go3akdtmt574xy2i",
            admins,
            minters,
            42697500000, // latitude in nanodegrees
            23321600000, // longitude in nanodegrees
            eas,
            schemaUID
        );

        Yogyakarta yogyakarta = new Yogyakarta(
            "Yogyakarta",
            "YOGYAKARTA",
            "ipfs://bafkreid7jpfdtxbmixgoi4bfg3wa76rqhvgdzo3bmgrrcfkbqoxznh6kry",
            admins,
            minters,
            eas,
            schemaUID
        );

        // Deploy new events from the Luma page
        Swabi swabi = new Swabi(
            "Swabi",
            "SWABI",
            "ipfs://bafybeichth2ull6aj2iesajsfo7wepp2c2pyqzwjdi7y7folzhfv4jr3nu/apac.webp",
            admins,
            minters,
            eas,
            schemaUID
        );

        Camarines camarines = new Camarines(
            "Camarines",
            "CAMARINES",
            "ipfs://bafybeichth2ull6aj2iesajsfo7wepp2c2pyqzwjdi7y7folzhfv4jr3nu/apac.webp",
            admins,
            minters,
            eas,
            schemaUID
        );

        Pune pune = new Pune(
            "Pune",
            "PUNE",
            "ipfs://bafybeichth2ull6aj2iesajsfo7wepp2c2pyqzwjdi7y7folzhfv4jr3nu/india.webp",
            admins,
            minters,
            eas,
            schemaUID
        );

        Nairobi nairobi = new Nairobi(
            "Nairobi",
            "NAIROBI",
            "ipfs://bafybeichth2ull6aj2iesajsfo7wepp2c2pyqzwjdi7y7folzhfv4jr3nu/africa.webp",
            admins,
            minters,
            eas,
            schemaUID
        );

        HongKong hongKong = new HongKong(
            "HongKong",
            "HONGKONG",
            "ipfs://bafybeichth2ull6aj2iesajsfo7wepp2c2pyqzwjdi7y7folzhfv4jr3nu/apac.webp",
            admins,
            minters,
            eas,
            schemaUID
        );

        Accra accra = new Accra(
            "Accra",
            "ACCRA",
            "ipfs://bafybeichth2ull6aj2iesajsfo7wepp2c2pyqzwjdi7y7folzhfv4jr3nu/africa.webp",
            admins,
            minters,
            eas,
            schemaUID
        );

        Cartagena cartagena = new Cartagena(
            "Cartagena",
            "CARTAGENA",
            "ipfs://bafybeichth2ull6aj2iesajsfo7wepp2c2pyqzwjdi7y7folzhfv4jr3nu/latam.webp",
            admins,
            minters,
            eas,
            schemaUID
        );

        DaNang daNang = new DaNang(
            "DaNang",
            "DANANG",
            "ipfs://bafybeichth2ull6aj2iesajsfo7wepp2c2pyqzwjdi7y7folzhfv4jr3nu/apac.webp",
            admins,
            minters,
            eas,
            schemaUID
        );

        Mumbai mumbai = new Mumbai(
            "Mumbai",
            "MUMBAI",
            "ipfs://bafybeichth2ull6aj2iesajsfo7wepp2c2pyqzwjdi7y7folzhfv4jr3nu/india.webp",
            admins,
            minters,
            eas,
            schemaUID
        );

        Bangalore bangalore = new Bangalore(
            "Bangalore",
            "BANGALORE",
            "ipfs://bafybeichth2ull6aj2iesajsfo7wepp2c2pyqzwjdi7y7folzhfv4jr3nu/india.webp",
            admins,
            minters,
            eas,
            schemaUID
        );

        NewYorkCity newYorkCity = new NewYorkCity(
            "NewYorkCity",
            "NYC",
            "ipfs://bafybeichth2ull6aj2iesajsfo7wepp2c2pyqzwjdi7y7folzhfv4jr3nu/na.webp",
            admins,
            minters,
            eas,
            schemaUID
        );

        BuenosAires buenosAires = new BuenosAires(
            "BuenosAires",
            "BUENOSAIRES",
            "ipfs://bafybeichth2ull6aj2iesajsfo7wepp2c2pyqzwjdi7y7folzhfv4jr3nu/latam.webp",
            admins,
            minters,
            eas,
            schemaUID
        );

        Manila manila = new Manila(
            "Manila",
            "MANILA",
            "ipfs://bafybeichth2ull6aj2iesajsfo7wepp2c2pyqzwjdi7y7folzhfv4jr3nu/apac.webp",
            admins,
            minters,
            eas,
            schemaUID
        );

        Dubai dubai = new Dubai(
            "Dubai",
            "DUBAI",
            "ipfs://bafybeichth2ull6aj2iesajsfo7wepp2c2pyqzwjdi7y7folzhfv4jr3nu/apac.webp",
            admins,
            minters,
            eas,
            schemaUID
        );

        DarEsSalaam darEsSalaam = new DarEsSalaam(
            "DarEsSalaam",
            "DARESSALAAM",
            "ipfs://bafybeichth2ull6aj2iesajsfo7wepp2c2pyqzwjdi7y7folzhfv4jr3nu/africa.webp",
            admins,
            minters,
            eas,
            schemaUID
        );

        Kigali kigali = new Kigali(
            "Kigali",
            "KIGALI",
            "ipfs://bafybeichth2ull6aj2iesajsfo7wepp2c2pyqzwjdi7y7folzhfv4jr3nu/africa.webp",
            admins,
            minters,
            eas,
            schemaUID
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
