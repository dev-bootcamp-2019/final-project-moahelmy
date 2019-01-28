/*
    Simple Bank copied from excercise to manage balance and apply withrawal pattern
    A new method to transfer balance will be added    
*/

pragma solidity ^0.5.0;

contract SimpleBank {

    //
    // State variables
    //
    
    /* Fill in the keyword. Hint: We want to protect our users balance from other contracts*/
    mapping (address => uint) private balances;
    
    /* Fill in the keyword. We want to create a getter function and allow contracts to be able to see if a user is enrolled.  */
    mapping (address => bool) public enrolled;

    /* Let's make sure everyone knows who owns the bank. Use the appropriate keyword for this*/
    address public owner;
    
    //
    // Events - publicize actions to external listeners
    //
    
    /* Add an argument for this event, an accountAddress */
    event LogEnrolled(address indexed accountAddress);

    /* Add 2 arguments for this event, an accountAddress and an amount */
    event LogDepositMade(address indexed accountAddress, uint indexed amount);

    /* Create an event called LogWithdrawal */
    /* Add 3 arguments for this event, an accountAddress, withdrawAmount and a newBalance */
    event LogWithdrawal(address indexed accountAddress, uint indexed withdrawAmount, uint indexed newBalance);

    /* transfer money from account to another */
    event LogTransferDone(address indexed from, address indexed to, uint amount, uint fromBalance, uint toBalance);

    //
    // Functions
    //

    /* Use the appropriate global variable to get the sender of the transaction */
    constructor() public {
        /* Set the owner to the creator of this contract */
        owner = msg.sender;
    }

    /// @notice Get balance
    /// @return The balance of the user
    // A SPECIAL KEYWORD prevents function from editing state variables;
    // allows function to run locally/off blockchain
    function balance() public view returns (uint) {
        /* Get the balance of the sender of this transaction */
        require(enrolled[msg.sender], "user not entrolled");
        return balances[msg.sender];
    }

    /// @notice Enroll a customer with the bank
    /// @return The users enrolled status
    // Emit the appropriate event
    function enroll() public returns (bool){        
        return enroll(msg.sender);
    }

    /// @notice Enroll a customer with the bank (address passed)
    /// @return The users enrolled status
    // Emit the appropriate event
    function enroll(address _newMember)
        internal
        returns(bool)
    {
        if(!enrolled[_newMember]) {
            enrolled[_newMember] = true;
            balances[_newMember] = 0;
            emit LogEnrolled(_newMember);
            return true;
        }
        return false;
    }

    /// @notice transfer from account to another    
    /// @param from from account
    /// @param to to account    
    function transfer(address from, address to, uint amount)
        public
    {
        require(enrolled[from], "from not enrolled");
        require(enrolled[to], "to not enrolled");
        uint fromNewBalance = balances[from] - amount;
        require(fromNewBalance >= 0, "insufficient balance");
        uint toNewBalance = amount + balances[to];
        require(toNewBalance > 0, "integer overflow");        
        balances[from] = fromNewBalance;
        balances[to] = toNewBalance;
        emit LogTransferDone(from, to, amount, fromNewBalance, toNewBalance);        
    }

    /// @notice Deposit ether into bank
    /// @return The balance of the user after the deposit is made
    // Add the appropriate keyword so that this function can receive ether
    // Use the appropriate global variables to get the transaction sender and value
    // Emit the appropriate event    
    function deposit() public payable returns (uint) {
        /* Add the amount to the user's balance, call the event associated with a deposit,
          then return the balance of the user */
        require(enrolled[msg.sender], "user not enrolled");
        require(msg.value > 0, "amount must be positive");
        uint newBalance = msg.value + balances[msg.sender];
        require(newBalance > 0, "integer overflow");
        balances[msg.sender] = newBalance;
        emit LogDepositMade(msg.sender, msg.value);
        return newBalance;
    }

    /// @notice Withdraw ether from bank
    /// @dev This does not return any excess ether sent to it
    /// @param withdrawAmount amount you want to withdraw
    /// @return The balance remaining for the user
    // Emit the appropriate event    
    function withdraw(uint withdrawAmount) public returns (uint) {
        /* If the sender's balance is at least the amount they want to withdraw,
           Subtract the amount from the sender's balance, and try to send that amount of ether
           to the user attempting to withdraw. 
           return the user's balance.*/
        require(enrolled[msg.sender], "user not entrolled");
        require(withdrawAmount > 0 && withdrawAmount <= balances[msg.sender], "insufficient fund");
        uint newBalance = balances[msg.sender] - withdrawAmount;
        balances[msg.sender] = newBalance;
        msg.sender.transfer(withdrawAmount);
        emit LogWithdrawal(msg.sender, withdrawAmount, newBalance);
        return newBalance;
    }

    // Fallback function - Called if other functions don't match call or
    // sent ether without data
    // Typically, called when invalid data is sent
    // Added so ether sent to this contract is reverted if the contract fails
    // otherwise, the sender's money is transferred to contract
    function() external {
        revert();
    }
}
