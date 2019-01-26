pragma solidity ^0.5.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/CircuitBreaker.sol";
import "./ThrowProxy.sol";

/**
    Created to allow injecting owner and test modifier
 */
contract CircuitBreakerExample is CircuitBreaker {

    function shouldStop()
        public        
        stopInEmergency             
    {        
    }

    function shouldWorkOnlyInEmergency() 
        public        
        onlyInEmergency
    {    
    }
}

contract TestCircuitBreaker {

    function testNotEmergency()
        public 
    {
        CircuitBreakerExample example = new CircuitBreakerExample();

        ThrowProxy throwProxy = new ThrowProxy(address(example));
        CircuitBreakerExample(address(throwProxy)).shouldStop();        
        bool result = throwProxy.execute();
        
        Assert.equal(result, true, "Should be working if non-emergency");

        CircuitBreakerExample(address(throwProxy)).shouldWorkOnlyInEmergency();        
        result = throwProxy.execute();
        Assert.equal(result, false, "Should be working only in emergency");
    }

    /*function testEmergency()
        public 
    {
        CircuitBreakerExample example = new CircuitBreakerExample();

        example.toggle();

        ThrowProxy throwProxy = new ThrowProxy(address(example));
        CircuitBreakerExample(address(throwProxy)).shouldStop();        
        bool result = throwProxy.execute();
        
        Assert.equal(result, false, "Should not be working");

        CircuitBreakerExample(address(throwProxy)).shouldWorkOnlyInEmergency();        
        result = throwProxy.execute();
        Assert.equal(result, true, "Should be working only in emergency");
    }
    */
}