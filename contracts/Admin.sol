pragma solidity ^0.5.0;
import "./Owned.sol";

/**
    @author moahelmy
    @title Admin managers
*/ 
contract Admin is Owned {
    mapping(address => bool) admins;
    
    /* modifier to verify caller is admin */
    modifier onlyAdmin() {
        require(isAdmin(msg.sender), "Only admin can access this");
        _;
    }

    /**
        Events to monitor adding/removing admins
     */
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);

    constructor() public {
        admins[msg.sender] = true;
    }

    /**
        add new admin. only admin can call it
        @param _admin address of new admin to be added
        @return success flag
     */
    function addAdmin(address _admin)
        public
        onlyAdmin
        returns(bool)
    {
        require(admins[_admin] == false, "Already admin");
        admins[_admin] = true;
        emit AdminAdded(_admin);
        return true;
    }

    /**
        remove existing admin. only owner can call it
        @param _admin address of admin to be removed
        @return success flag
     */
    function removeAdmin(address _admin)
        public
        onlyOwner
        returns(bool)
    {
        require(admins[_admin] == true, "Not admin");
        admins[_admin] = false;        
        emit AdminRemoved(_admin);
        return true;
    }

    /**
        internal function to check if user is admin
        @param user address of user to be checked
     */
    function isAdmin(address user)
        public
        view
        returns(bool)
    {
        return admins[user];
    }
}
