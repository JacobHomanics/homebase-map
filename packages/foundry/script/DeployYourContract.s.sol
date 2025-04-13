//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/AlignmentV1.sol";
import "../contracts/AlignmentManagerV1.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./DeployHelpers.s.sol";
import "../contracts/NFT.sol";

contract DeployYourContract is ScaffoldETHDeploy {
    address[] admins;
    address[] alignmentAdders;
    address[] alignmentRemovers;
    address[] contractManagers;
    address[] managerAlignmentAdders;
    address[] nftContractSetters;
    address[] managerAlignmentRemovers;

    // address fundRecipient;

    // use `deployer` from `ScaffoldETHDeploy`
    function run() external ScaffoldEthDeployerRunner {
        (, address _deployer, ) = vm.readCallers();

        // Get the chain ID to determine which network we're on
        uint256 chainId = block.chainid;

        // Set admin address based on the network
        if (chainId == 8453) {
            // Base Mainnet
            admins = [_deployer, 0xc0f0E1512D6A0A77ff7b9C172405D1B0d73565Bf];
            contractManagers = [0xc0f0E1512D6A0A77ff7b9C172405D1B0d73565Bf];
            managerAlignmentAdders = [
                0xc0f0E1512D6A0A77ff7b9C172405D1B0d73565Bf
            ];
            managerAlignmentRemovers = [
                0xc0f0E1512D6A0A77ff7b9C172405D1B0d73565Bf
            ];
            nftContractSetters = [0xCbEbcc04B4A5fA18089695AB357fD149c7862Cce];

            // fundRecipient = 0xc0f0E1512D6A0A77ff7b9C172405D1B0d73565Bf;
        } else if (chainId == 84531) {
            // Base Sepolia (testnet)
            admins = [_deployer, 0xc0f0E1512D6A0A77ff7b9C172405D1B0d73565Bf]; // You can change this to a different testnet address
            contractManagers = [0xc0f0E1512D6A0A77ff7b9C172405D1B0d73565Bf];
            managerAlignmentAdders = [
                0xc0f0E1512D6A0A77ff7b9C172405D1B0d73565Bf
            ];
            managerAlignmentRemovers = [
                0xc0f0E1512D6A0A77ff7b9C172405D1B0d73565Bf
            ];
            nftContractSetters = [0xCbEbcc04B4A5fA18089695AB357fD149c7862Cce];

            // fundRecipient = 0xc0f0E1512D6A0A77ff7b9C172405D1B0d73565Bf;
        } else {
            // Local development chain or other networks
            admins = [_deployer, 0xCbEbcc04B4A5fA18089695AB357fD149c7862Cce]; // Default anvil account
            contractManagers = [0xCbEbcc04B4A5fA18089695AB357fD149c7862Cce];
            managerAlignmentAdders = [
                0xCbEbcc04B4A5fA18089695AB357fD149c7862Cce
            ];
            managerAlignmentRemovers = [
                0xCbEbcc04B4A5fA18089695AB357fD149c7862Cce
            ];
            nftContractSetters = [0xCbEbcc04B4A5fA18089695AB357fD149c7862Cce];
            // fundRecipient = 0xCbEbcc04B4A5fA18089695AB357fD149c7862Cce;
        }

        // Log which network and admin we're using
        console.logString(
            string.concat("Deploying on chain ID: ", vm.toString(chainId))
        );
        console.logString(
            string.concat("Using admin address: ", vm.toString(admins[0]))
        );

        NFTV1 nftContract = new NFTV1(admins, nftContractSetters);

        console.logString(
            string.concat(
                "NFT deployed at: ",
                vm.toString(address(nftContract))
            )
        );

        AlignmentManagerV1 alignmentManager = new AlignmentManagerV1(
            admins,
            contractManagers,
            managerAlignmentAdders,
            managerAlignmentRemovers,
            nftContractSetters
        );

        nftContract.grantRole(
            nftContract.MINTER_ROLE(),
            address(alignmentManager)
        );

        alignmentAdders = [address(alignmentManager)];
        alignmentRemovers = [address(alignmentManager)];
        AlignmentV1 alignment = new AlignmentV1(
            admins,
            alignmentAdders,
            alignmentRemovers
        );

        alignmentManager.grantRole(
            alignmentManager.CONTRACT_MANAGER_ROLE(),
            _deployer
        );

        alignmentManager.grantRole(
            alignmentManager.NFT_CONTRACT_SETTER_ROLE(),
            _deployer
        );

        // alignmentManager.grantRole(
        //     alignmentManager.COST_MANAGER_ROLE(),
        //     _deployer
        // );

        // alignmentManager.grantRole(
        //     alignmentManager.FUNDS_MANAGER_ROLE(),
        //     _deployer
        // );

        alignmentManager.setAlignmentContract(address(alignment));
        alignmentManager.setNftContract(address(nftContract));
        // alignmentManager.setAlignmentCost(0.00086 ether);
        // alignmentManager.setFundRecipient(fundRecipient);
        alignmentManager.revokeRole(
            alignmentManager.CONTRACT_MANAGER_ROLE(),
            _deployer
        );
        // alignmentManager.revokeRole(
        //     alignmentManager.COST_MANAGER_ROLE(),
        //     _deployer
        // );
        // alignmentManager.revokeRole(
        //     alignmentManager.FUNDS_MANAGER_ROLE(),
        //     _deployer
        // );

        console.logString(
            string.concat(
                "Alignment deployed at: ",
                vm.toString(address(alignment))
            )
        );

        console.logString(
            string.concat(
                "AlignmentManager deployed at: ",
                vm.toString(address(alignmentManager))
            )
        );
    }
}
