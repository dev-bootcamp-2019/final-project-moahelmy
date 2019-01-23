pragma solidity ^0.5.0;

contract Owned {
    address public owner;
    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can access this");
        _;
    }
}
