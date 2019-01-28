pragma solidity ^0.5.0;
import "./Admin.sol";
import "./CircuitBreaker.sol";
import "./SimpleBank.sol";
import "./BountyNestStorage.sol";

/**
    @author moahelmy
    @title manage bounties contract
 */
contract BountyNest is Admin, CircuitBreaker, SimpleBank
{
    BountyNestStorage private bnStorage;

    /**
        Events to track amendement of bounties states
     */    
    event Opened(uint indexed bountyId);
    event Closed(uint indexed bountyId);
    event Resolved(uint indexed bountyId);

    /**
        Events to track modifications of submissions
     */
    event SubmissionAdded(uint indexed bountyId, uint indexed submissionId);
    event SubmissionAccepted(uint indexed submissionId, uint indexed bountyId);
    event SubmissionRejected(uint indexed submissionId, uint indexed bountyId);

    /**
        modifier to confirm that the caller is bounty poster
     */
    modifier onlyPoster(uint bountyId)
    {
        require(getPoster(bountyId) == msg.sender, "not poster");
        _;
    }
    /**
        modifier to confirm that paid amound less than value
     */
    modifier paidEnough(uint _reward) {
        require(msg.value >= _reward, "not enough"); 
        _;
    }    
    /**
        modifier to confirms if bounty still open
     */
    modifier opened(uint bountyId)
    {
        require(isOpen(bountyId), "bounty is not open");
        _;
    }    
    /**
        modifer to confirm that submission still open
     */
    modifier pending(uint submissionId)
    {
        require(isPending(submissionId), "submission is not pending");
        _;
    }

    /**
        check if caller not address(0)
     */
    modifier validSender()
    {
        require(msg.sender != address(0), "not valid sender");
        _;
    }    

    constructor (address _externalStorage) public
    {
        bnStorage = BountyNestStorage(_externalStorage);
        // enroll contract itself into the simple bank to hold deposit sent by job posters
        enroll(address(this));
    }

    /**
        @notice Add new bounty.
        @param _description details of the bounty.
        @param _reward reward to who gonna resolve it. must be gt zero and lt msg.value
        @return the bounty id to be used in further interactions.
     */
    function add(string memory _description, uint _reward)
        public
        payable
        stopInEmergency()
        validSender()
        paidEnough(_reward)        
        returns(uint bountyId)
    {
        require(_reward > 0, "reward can not be zero");
        bountyId = bnStorage.addBounty(msg.sender, _description, _reward);
        emit Opened(bountyId);
        enroll(msg.sender);
        deposit();
        transfer(msg.sender, address(this), msg.value);        
    }

    /**
        @notice Close existing bounty by poster
        @param bountyId id of bounty to get closed
     */
    function close(uint bountyId)
        public
        onlyPoster(bountyId)
        opened(bountyId)
        returns(bool)
    {
        bnStorage.closeBounty(bountyId);             
        emit Closed(bountyId);
        (,uint reward,address poster,,) = bnStorage.fetchBounty(bountyId);
        transfer(address(this), poster, reward);
        return true;
    }

    /**
        @notice Add new submission to existing bounty
        @param bountyId id of related bounty
        @param resolution submission itself
        @return the id of the created submission
     */
    function submit(uint bountyId, string memory resolution)
        public
        stopInEmergency()
        validSender()
        opened(bountyId)
        returns(uint submissionId)
    {
        submissionId = bnStorage.addSubmission(bountyId, resolution);
        emit SubmissionAdded(bountyId, submissionId);
    }

    /**
        @notice Accept submission by bounty poster
        @dev it uses inherited simple bank to manager payments
        @param submissionId id of submission to be accepted
     */
    function accept(uint submissionId)
        public
        stopInEmergency()        
        pending(submissionId)        
    {
        (uint bountyId,,address submitter,) = bnStorage.fetchSubmission(submissionId);
        (,uint reward,address poster,,) = bnStorage.fetchBounty(bountyId);
        require(isOpen(bountyId));
        require(poster == msg.sender);
        bnStorage.markAsResolved(bountyId);
        bnStorage.setAcceptedSubmission(bountyId, submissionId);
        bnStorage.markAsAccepted(submissionId);        
        enroll(submitter);
        transfer(address(this), submitter, reward);
        emit SubmissionAccepted(submissionId, bountyId);
    }

    /**
        @notice Reject submission by bounty poster
        @dev it uses inherited simple bank to manager payments
        @param submissionId id of submission to be rejected
     */
    function reject(uint submissionId)
        public
        pending(submissionId)
    {
        (uint bountyId,,,) = bnStorage.fetchSubmission(submissionId);
        (,,address poster,,) = bnStorage.fetchBounty(bountyId);
        require(isOpen(bountyId));
        require(poster == msg.sender);                
        bnStorage.markAsRejected(submissionId);                
        emit SubmissionRejected(submissionId, bountyId);
    }

    /**
        @notice List all bounties listed by sender
     */
    function listMyBounties()
        public
        view
        validSender()
        returns(uint[] memory bounties)
    {
        return bnStorage.listMyBounties(msg.sender);
    }

    /**
        @notice List all submissions listed by sender
     */
    function listMySubmissions()
        public
        view
        validSender()        
        returns(uint[] memory bounties)
    {
        return bnStorage.listMySubmissions(msg.sender);
    }

    /**
        @notice fetch bounty information
        @param bountyId id of bounty
     */
    function fetchBounty(uint bountyId)
        public
        view
        returns(string memory desc, uint reward, address poster, uint state, uint[] memory _submissions)
    {
        return bnStorage.fetchBounty(bountyId);
    }

    /**
        @notice get bounties count    
     */
    function bountiesCount()
        public
        view
        returns(uint)
    {
        return bnStorage.getCount();
    }

    /**
        Debutes to be coded later. It's the reason why admin contract is coded so that admins only
        can resolve debutes
     */
    /*
    function createDepute(uint submissionId, string memory description)
        public
        returns(uint deputeId)
    {
    }

    function resolveDepute(uint id, bool isPostRight, bool isBountyHunterRight, string memory comment)
        public
        returns(bool success)
    {        
    }*/

    /**
        Enroll should not be supported. Better to use a new base class that only allow withdraw if have time.
     */
    function enroll() public returns (bool){
        return false;
    }

    function getPoster(uint bountyId) 
        internal
        view
        returns(address) {
        (,,address poster,,) = bnStorage.fetchBounty(bountyId);
        return poster;
    }

    /**
        these functions to check status of bounty and submission. used more by tests
        they will be deleted in the future
        no need to expose internal state
     */
    function isOpen(uint bountyId)
        public
        view        
        returns(bool)
    {
        (,,,uint state,) = bnStorage.fetchBounty(bountyId);
        return state == 1;
    }

    function isClosed(uint bountyId)
        public
        view 
        returns(bool)
    {
        (,,,uint state,) = bnStorage.fetchBounty(bountyId);
        return state == 2;
    }

    function isResolved(uint bountyId)
        public
        view        
        returns(bool)
    {
        (,,,uint state,) = bnStorage.fetchBounty(bountyId);
        return state == 3;
    }

    function isPending(uint submissionId)
        public
        view        
        returns(bool)
    {
        (,,,uint state) = bnStorage.fetchSubmission(submissionId);
        return state == 1;
    }

    function isAccepted(uint submissionId)
        public
        view        
        returns(bool)
    {
        (,,,uint state) = bnStorage.fetchSubmission(submissionId);
        return state == 2;
    }

    function isRejected(uint submissionId)
        public
        view        
        returns(bool)
    {
        (,,,uint state) = bnStorage.fetchSubmission(submissionId);
        return state == 3;
    }
}