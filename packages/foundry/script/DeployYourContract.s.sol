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
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/index.json",
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
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/009-base-batch-workshop-budapest.json",
            admins,
            minters,
            eas,
            schemaUID
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
            schemaUID
        );

        Yogyakarta yogyakarta = new Yogyakarta(
            "Yogyakarta",
            "YOGYAKARTA",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/049-base-batch-workshop-yogyakarta.json",
            admins,
            minters,
            eas,
            schemaUID
        );

        // Deploy new events from the Luma page
        Swabi swabi = new Swabi(
            "Swabi",
            "SWABI",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/047-base-batch-workshop-swabi.json",
            admins,
            minters,
            eas,
            schemaUID
        );

        Camarines camarines = new Camarines(
            "Camarines",
            "CAMARINES",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/011-base-batch-workshop-camarines.json",
            admins,
            minters,
            eas,
            schemaUID
        );

        Pune pune = new Pune(
            "Pune",
            "PUNE",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/042-base-batch-workshop-pune.json",
            admins,
            minters,
            eas,
            schemaUID
        );

        Nairobi nairobi = new Nairobi(
            "Nairobi",
            "NAIROBI",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/039-base-batch-workshop-nairobi.json",
            admins,
            minters,
            eas,
            schemaUID
        );

        HongKong hongKong = new HongKong(
            "HongKong",
            "HONGKONG",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/023-base-batch-workshop-hong-kong.json",
            admins,
            minters,
            eas,
            schemaUID
        );

        Accra accra = new Accra(
            "Accra",
            "ACCRA",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/002-base-batch-workshop-accra.json",
            admins,
            minters,
            eas,
            schemaUID
        );

        Cartagena cartagena = new Cartagena(
            "Cartagena",
            "CARTAGENA",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/012-base-batch-workshop-cartagena.json",
            admins,
            minters,
            eas,
            schemaUID
        );

        DaNang daNang = new DaNang(
            "DaNang",
            "DANANG",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/016-base-batch-workshop-da-nang.json",
            admins,
            minters,
            eas,
            schemaUID
        );

        Mumbai mumbai = new Mumbai(
            "Mumbai",
            "MUMBAI",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/037-base-batch-workshop-mumbai.json",
            admins,
            minters,
            eas,
            schemaUID
        );

        Bangalore bangalore = new Bangalore(
            "Bangalore",
            "BANGALORE",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/007-base-batch-workshop-bangalore.json",
            admins,
            minters,
            eas,
            schemaUID
        );

        NewYorkCity newYorkCity = new NewYorkCity(
            "NewYorkCity",
            "NYC",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/040-base-batch-workshop-new-york-city.json",
            admins,
            minters,
            eas,
            schemaUID
        );

        BuenosAires buenosAires = new BuenosAires(
            "BuenosAires",
            "BUENOSAIRES",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/010-base-batch-workshop-buenos-aires.json",
            admins,
            minters,
            eas,
            schemaUID
        );

        Manila manila = new Manila(
            "Manila",
            "MANILA",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/035-base-batch-workshop-manila-city.json",
            admins,
            minters,
            eas,
            schemaUID
        );

        Dubai dubai = new Dubai(
            "Dubai",
            "DUBAI",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/index.json",
            admins,
            minters,
            eas,
            schemaUID
        );

        DarEsSalaam darEsSalaam = new DarEsSalaam(
            "DarEsSalaam",
            "DARESSALAAM",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/017-base-batch-workshop-dar-es-salaam.json",
            admins,
            minters,
            eas,
            schemaUID
        );

        Kigali kigali = new Kigali(
            "Kigali",
            "KIGALI",
            "ipfs://bafybeiagjmwqdurdhmymdur3p3uwuefp67bzwliehlcxyx6lbau3qcvgje/027-base-batch-workshop-kigali.json",
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
