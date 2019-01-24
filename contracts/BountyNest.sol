pragma solidity ^0.5.0;
import "./Admin.sol";
import "./SimpleBank.sol";

contract BountyNest is Admin, SimpleBank
{
    uint public bountiesCount;    
    mapping(uint => Bounty) public bountyList;

    uint public submissionsCount;
    mapping(uint => Submission) public submission;

    mapping(address => uint[]) myBounties;
    mapping(address => uint[]) mySubmissions;    

    enum BountyState { Open, Resolved, Closed }

    struct Bounty
    {
        uint id;
        string description;
        address poster;
        uint reward;
        BountyState state;
        uint[] submissions;  
        uint acceptedSubmission;
    }

    enum SubmissionState { Pending, Accepted, Rejected }
    struct Submission
    {
        uint id;
        uint bountyId;        
        string resolution;
        address submitter;
        SubmissionState state;
    }

    event Opened(uint indexed bountyId);    
    event Closed(uint indexed bountyId);
    event Resolved(uint indexed bountyId);

    event SubmissionAdded(uint indexed bountyId, uint indexed submissionId);
    event SubmissionAccepted(uint indexed submissionId);
    event SubmissionRejected(uint indexed submissionId);

    modifier isBountyPoster(uint bountyId)
    {
        _;
    }
    modifier paidEnough(uint _price) {
        require(msg.value >= _price, "not enough"); 
        _;
    }
    modifier opened(uint bountyId)
    {
        _;
    }
    modifier pending(uint submissionId)
    {
        _;
    }

    constructor () 
        public
    {
        bountiesCount = 0;
    }

    function addBountry(string memory description, uint reward)
        public
        returns(uint bountyId)
    {
    }

    function closeBounty(uint bountyId)
        public
        returns(bool)
    {

    }

    function submitResolution(string memory resolution, uint bountyId)
        public
        returns(uint submissionId)
    {
    }

    function accept(uint submissionId)
        public        
    {
    }

    function reject(uint submissionId)
        public
    {
    }

    function listMyBounties()
        public
        view
        returns(uint[] memory bounties)
    {

    }

    function listMySubmissions()
        public
        view
        returns(uint[] memory bounties)
    {

    }
}