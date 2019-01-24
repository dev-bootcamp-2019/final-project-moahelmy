pragma solidity ^0.5.0;
import "./Owned.sol";

contract Admin is Owned {
    mapping(address => bool) admins;
    
    modifier onlyAdmin() {
        require(isAdmin(msg.sender), "Only admin can access this");
        _;
    }

    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);

    constructor() public {
        admins[msg.sender] = true;
    }

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

    function isAdmin(address user)
        public
        view
        returns(bool)
    {
        return admins[user];
    }
}
