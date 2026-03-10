// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract FarmerMarketplace {
    AggregatorV3Interface public i_priceFeed;

    constructor(address priceFeedAddress) {
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    // Price feed function
    function getPrice() public view returns (int) {
        (, int price,,,) = i_priceFeed.latestRoundData();
        return price;
    }

    // --- User registration ---
    struct User {
        string name;
        string email;
        string role; // "user" or "farmer"
    }

    mapping(address => User) public users;

    function register(string memory _name, string memory _email, string memory _role) public {
        require(bytes(_name).length > 0, "Name required");
        require(bytes(_email).length > 0, "Email required");
        require(
            keccak256(bytes(_role)) == keccak256(bytes("user")) ||
            keccak256(bytes(_role)) == keccak256(bytes("farmer")),
            "Invalid role"
        );

        users[msg.sender] = User(_name, _email, _role);
    }

    function getUser(address _addr) public view returns (string memory, string memory, string memory) {
        User memory u = users[_addr];
        return (u.name, u.email, u.role);
    }
}
