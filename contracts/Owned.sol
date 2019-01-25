pragma solidity ^0.5.0;

/**
    @author moahelmy
    @title owned contract to save contract creator. will be inherited by other contracts
*/
contract Owned {
    address public owner;
    constructor() public {
        owner = msg.sender;
    }

    /* modifier to verify the caller is contract owner */
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can access this");
        _;
    }
}
