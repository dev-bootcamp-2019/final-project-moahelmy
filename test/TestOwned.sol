pragma solidity ^0.5.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Owned.sol";
import "./ThrowProxy.sol";

contract OwnedExample is Owned {

    function setOwner(address newOwner) 
        public
    {
        owner = newOwner;
    }

    function onlyOwnerShouldAccessThis() 
    public
        onlyOwner
    {
    }
}

contract TestOwned {


    function testOwnedConstructor() 
        public 
    {
        Owned owned = new Owned();

        address owner = owned.owner();
        bool isCorrect = (owner == address(this));

        Assert.equal(isCorrect, true, "Owner should be the contract deployer");
    }

    function testOnlyOwner_NotOwner_Throw() 
        public 
    {
        OwnedExample test = new OwnedExample();

        ThrowProxy throwProxy = new ThrowProxy(address(test));
        OwnedExample(address(throwProxy)).onlyOwnerShouldAccessThis();        
        bool result = throwProxy.execute();
        
        Assert.equal(result, false, "Only owner was supposed to be able to call that function");
    }

    function testOnlyOwner_Owner_Success() 
        public
    {
        OwnedExample test = new OwnedExample();

        ThrowProxy throwProxy = new ThrowProxy(address(test));
        OwnedExample(address(throwProxy)).onlyOwnerShouldAccessThis();
        test.setOwner(address(throwProxy));
        bool result = throwProxy.execute();

        Assert.equal(result, true, "Only owner should pass");
    }

}