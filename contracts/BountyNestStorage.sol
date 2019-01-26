pragma solidity ^0.5.0;

/**
    @author moahelmy
    @title used to store data for bounty nest
 */
contract BountyNestStorage
{
    /**
        Bounty List
    */    
    uint public bountiesCount;
    /// actuall list of bounties that will be looked up
    mapping(uint => Bounty) public bountyList;        
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
    enum BountyState { Open, Closed, Resolved }

    struct Bounty
    {
        uint id;
        string description;
        address poster;
        uint reward;
        BountyState state;
        uint accepted;
        uint[] submissions;
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
}