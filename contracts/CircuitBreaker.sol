pragma solidity ^0.5.0;

import "./Owned.sol";

/**
    @author moahelmy
    @title Allow derived contract to implement circuit breaker pattern
*/
contract CircuitBreaker is Owned {
    
    bool private stopped = false;

    /**
        stops functionality in emergency
     */     
    modifier stopInEmergency { require (!stopped); _; }

    /**
        only functionality working in emergency
     */
    modifier onlyInEmergency { require (stopped); _; }

    function toggle() 
        public
        onlyOwner()
    {
        stopped = !stopped;
    }
}
