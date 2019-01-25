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
    modifier onlyPoster(uint bountyId)
    {
        require(bountyList[bountyId].poster == msg.sender, "not poster");
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
        modifier to check if bounty exists
     */
    modifier bountyExists(uint bountyId)
    {
        require(bountyList[bountyId].id == bountyId, "not exists");
        _;
    }
    /**
        modifier to confirms if bounty still open
     */
    modifier opened(uint bountyId)
    {
        require(bountyList[bountyId].state == BountyState.Open, "bounty is not open");
        _;
    }
    /**
        modifier to check if submission exists
     */
    modifier submissionExists(uint id)
    {
        require(bountyList[id].id == id, "not exists");
        _;
    }
    /**
        modifer to confirm that submission still open
     */
    modifier pending(uint submissionId)
    {
        require(submissions[submissionId].state == SubmissionState.Pending, "submission is not pending");
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

    constructor() public
    {
        bountiesCount = 0;
        submissionsCount = 0;
        
        // enroll contract itself into the simple bank to hold deposit sent by job posters
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
        validSender()
        paidEnough(_reward)
        returns(uint bountyId)
    {        
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
        // if(myBounties[msg.sender].length == 0)
        // {
        //     myBounties[msg.sender] = new uint[](1);
        // }
        myBounties[msg.sender].push(bountyId);
        emit Opened(bountyId);
    }

    /**
        Close existing bounty by poster
        @param bountyId id of bounty to get closed
     */
    function closeBounty(uint bountyId)
        public
        onlyPoster(bountyId)
        opened(bountyId)
        returns(bool)
    {   
        bountyList[bountyId].state = BountyState.Closed;
        emit Closed(bountyId);
        return true;
    }

    /**
        Add new submission to existing bounty
        @param bountyId id of related bounty
        @param resolution submission itself
        @return the id of the created submission
     */
    function submitResolution(uint bountyId, string memory resolution)
        public
        validSender()
        opened(bountyId)    
        returns(uint submissionId)
    {
        submissionId = ++submissionsCount;
        // Submissions[submissionId] = Submission({
        //     id: submissionId
        // });
    }

    /**
        Accept submission by bounty poster
        @param submissionId id of submission to be accepted
     */
    function accept(uint submissionId)
        public        
    {
    }

    /**
        Reject submission by bounty poster
        @param submissionId id of submission to be rejected
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
        validSender()
        returns(uint[] memory bounties)
    {
        return myBounties[msg.sender];
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
        bountyExists(bountyId)
        returns(bool)
    {
        return bountyList[bountyId].state == BountyState.Open;
    }

    function isClosed(uint bountyId)
        public
        view
        bountyExists(bountyId)
        returns(bool)
    {
        return bountyList[bountyId].state == BountyState.Closed;
    }

    function isResolved(uint bountyId)
        public
        view
        bountyExists(bountyId)
        returns(bool)
    {
        return bountyList[bountyId].state == BountyState.Resolved;
    }
}