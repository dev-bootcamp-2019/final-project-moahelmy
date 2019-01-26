pragma solidity ^0.5.0;
import "./Owned.sol";

/**
    @author ConsensSys Academy
    @title To allow upgrading contracts
*/ 
contract Relay is Owned {
    address public currentVersion;    

    constructor (address initAddr) public
    {
        currentVersion = initAddr;
        owner = msg.sender;
    }

    /**
        @notice allow upgrading to new version.
        @param newVersion the address of deployed new version.
     */
    function changeContract(address newVersion) 
        public
        onlyOwner()
    {
        currentVersion = newVersion;
    }

    /**
        @notice delagte calls
     */
    function() external 
    {
        currentVersion.delegatecall(msg.data);
    }
}