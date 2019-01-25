pragma solidity ^0.5.0;
import "./Admin.sol";
import "./SimpleBank.sol";

/**
    @author moahelmy
    @title manage bounties contract
 */
contract BountyNest is Admin, SimpleBank
{
    /**
        Bounty List
    */    
    uint public bountiesCount;
    /// actuall list of bounties that will be looked up
    mapping(uint => Bounty) public bountyList;
    /// contains submission for specific bounty
    mapping(uint => uint) public bountySubmissions;
    /// contains bouties grouped by poster
    mapping(address => uint[]) myBounties;

    /**
        Submissions
     */
    uint public submissionsCount;
    /// list of submissions
    mapping(uint => Submission) public submissions;
    /// group submissions by bounty hunters
    mapping(address => uint[]) mySubmissions;    

    /// enum to track state of bounty
    enum BountyState { Open, Resolved, Closed }

    struct Bounty
    {
        uint id;
        string description;
        address poster;
        uint reward;
        BountyState state;
        //uint[] submissions;
        uint acceptedSubmission;
    }

    /// enum to track state of submission
    enum SubmissionState { Pending, Accepted, Rejected }
    struct Submission
    {
        uint id;
        uint bountyId;        
        string resolution;
        address submitter;
        SubmissionState state;
    }

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
    modifier isBountyPoster(uint bountyId)
    {
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
        _;
    }
    /**
        modifer to confirm that submission still open
     */
    modifier pending(uint submissionId)
    {
        _;
    }

    constructor() public
    {
        bountiesCount = 0;
        submissionsCount = 0;
        
        enroll(address(this));
    }

    /**
        Add new bounty.
        @param _description details of the bounty.
        @param _reward reward to who gonna resolve it. must be gt zero and lt msg.value
        @return the bounty id to be used in further interactions.
     */
    function addBountry(string memory _description, uint _reward)
        public
        payable
        paidEnough(_reward)
        returns(uint bountyId)
    {        
        require(msg.sender != address(0), "sender not null");
        require(_reward > 0, "reward can not be zero");
        bountyId = ++bountiesCount;
        bountyList[bountyId] = Bounty({
            id: bountyId,
            description: _description,
            reward: _reward,
            state: BountyState.Open,
            poster: msg.sender,
            acceptedSubmission: 0
        });
        emit Opened(bountyId);
    }

    /**
        Close existing bounty by poster
        @param bountyId id of bounty to get closed
     */
    function closeBounty(uint bountyId)
        public
        returns(bool)
    {

    }

    /**
        Add new submission to existing bounty
        @param bountyId id of related bounty
        @param resolution submission itself
        @return the id of the created submission
     */
    function submitResolution(uint bountyId, string memory resolution)
        public
        returns(uint submissionId)
    {
    }

    /**
        Accept submission by bounty poster
        @param submissionId
     */
    function accept(uint submissionId)
        public        
    {
    }

    /**
        Reject submission by bounty poster
        @param submissionId
     */
    function reject(uint submissionId)
        public
    {
    }

    /**
        List all bounties listed by sender
     */
    function listMyBounties()
        public
        view
        returns(uint[] memory bounties)
    {

    }

    /**
        List all submissions listed by sender
     */
    function listMySubmissions()
        public
        view
        returns(uint[] memory bounties)
    {

    }

    /**
        fetch bounty information
        @param bountyId id of bounty
     */
    function fetchBounty(uint bountyId)
        public
        view
        returns(string memory desc, uint reward, address poster)
    {
        Bounty memory bounty = bountyList[bountyId];
        if(bountyId == bounty.id)
        {
            desc = bounty.description;
            reward = bounty.reward;
            poster = bounty.poster;
        }     
    }

    /**
        Debutes to be coded later. It's the reason why admin contract is coded so that admins only
        can resolve debutes
     */
    function createDepute(uint submissionId, string memory description)
        public
        returns(uint deputeId)
    {
    }

    function resolveDepute(uint id, bool isPostRight, bool isBountyHunterRight, string memory comment)
        public
        returns(bool success)
    {        
    }

    /**
        these functions to check status of bounty and submission. used more by tests
     */
    function isOpen(uint bountyId)
        public
        view
        returns(bool)
    {
        return bountyList[bountyId].state == BountyState.Open;
    }

    function isClosed(uint bountyId)
        public
        view
        returns(bool)
    {
        return bountyList[bountyId].state == BountyState.Closed;
    }

    function isResolved(uint bountyId)
        public
        view
        returns(bool)
    {
        return bountyList[bountyId].state == BountyState.Resolved;
    }
}