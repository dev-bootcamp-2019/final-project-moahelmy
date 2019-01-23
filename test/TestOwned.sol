pragma solidity ^0.5.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Owned.sol";

contract OwnedExample is Owned {

    function setOwner(address newOwner) public
    {
        owner = newOwner;
    }

    function OnlyOwnerShouldAccessThis() public
        onlyOwner()
    {
    }
}

contract TestOwned {


    function testOwnedConstructor() public {
        Owned owned = new Owned();

        address owner = owned.owner();
        bool isCorrect = (owner == address(this));

        Assert.equal(isCorrect, true, "Owner should be the contract deployer");
    }

    function testOnlyOwner_NotOwner_Throw() public {
        OwnedExample test = new OwnedExample();

        address newOwner = address(10);
        test.setOwner(newOwner);

        bytes memory payload = abi.encodeWithSignature("OnlyOwnerShouldAccessThis()");
        (bool result,) = address(test).call(payload);

        Assert.equal(result, false, "Only owner was supposed to be able to call that function");
    }

    function testOnlyOwner_Owner_Success() public {
        OwnedExample test = new OwnedExample();

        bytes memory payload = abi.encodeWithSignature("OnlyOwnerShouldAccessThis()");
        (bool result,) = address(test).call(payload);

        Assert.equal(result, true, "Only owner should pass");
    }

}