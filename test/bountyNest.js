var BountyNest = artifacts.require("BountyNest.sol");
var assertThrow = require("./assertExceptions");

/**
 * Tests for bounties nest contract
 * Tests run by this order which crucial for their passing
 */
contract('BountyNest', function (accounts) {
    const owner = accounts[0];
    const jobPoster = accounts[1]; 
    const bountyHunter = accounts[2];
    let bountyToBeResolved = 1;   
    let bountyToBeClosed = 2;    
    let submissionToBeAccepted = 1;
    let submissionToBeRejected = 2;

    it('should enrol itself on creation', async () => {
        const bountyNest = await BountyNest.deployed();

        const enrolled = await bountyNest.enrolled(bountyNest.address, {from: owner});
        assert.equal(enrolled, true, 'contract is entrolled');
    });

    it('should add new bounty', async () => {
        const bountyNest = await BountyNest.deployed();

        var eventEmitted = false;        
        // add bounty
        let loggedBountyId;
        var result = await bountyNest.addBountry("to be resovled", 120, { from: jobPoster, value: 150 });
        // check for event
        if(result && result.logs && result.logs[0].event)
        {
            loggedBountyId = result.logs[0].args.bountyId.toString(10);
            bountyToBeResolved = parseInt(loggedBountyId);            
            eventEmitted = true;
        }        
        assert.equal(eventEmitted, true, 'event should have been emitted');

        // check if added bounty is open
        const isOpen = await bountyNest.isOpen.call(bountyToBeResolved);
        assert.equal(isOpen, true, 'new bounty should be open');

        // check if added to poster list of bounties
        result = await bountyNest.listMyBounties.call({ from: jobPoster });        
        assert.equal(result[0].toString(), loggedBountyId, "should be added to poster list");

        // add another bounty to be used in test scanrios after making sure adding new bounty works
        result = await bountyNest.addBountry("to be closed", 120, { from: jobPoster, value: 150 });
        bountyToBeClosed = parseInt(result.logs[0].args.bountyId.toString(10));        
    });
    
    it('should revert adding new bounty with zero reward or value less than reward', async () => {
        const bountyNest = await BountyNest.deployed();
                
        // reward is zero
        await assertThrow.expectRevert(bountyNest.addBountry("should fail", 0, { from: jobPoster, value: 100 }));

        // value < reward
        await assertThrow.expectRevert(bountyNest.addBountry("should fail", 100, { from: jobPoster, value: 50 }));
    });

    it('only bounty poster can close it', async () => {
        const bountyNest = await BountyNest.deployed();     
        
        const stillOpen = bountyToBeClosed;
        await assertThrow.expectRevert(bountyNest.closeBounty(stillOpen, { from: owner }));
    });

    it('should close open bounty if poster', async () => {
        const bountyNest = await BountyNest.deployed();

        let eventEmitted = false;
        let loggedBountyId;
        // close bounty
        const stillOpen = bountyToBeClosed;
        let result = await bountyNest.closeBounty(stillOpen, { from: jobPoster });
        //  check for event
        if(result && result.logs[0] && result.logs[0].event)
        {
            loggedBountyId = result.logs[0].args.bountyId.toString(10);
            eventEmitted = true;
        }        

        assert.equal(eventEmitted, true, 'event should have been emitted');
        assert.equal(stillOpen, loggedBountyId, 'should match passed id');
        // check if bounty is closed
        const isClosed = await bountyNest.isClosed.call(stillOpen);
        assert.equal(isClosed, true, 'bounty should be closed');
    });

    it('only open bounty can be closed', async () => {
        const bountyNest = await BountyNest.deployed();

        const nowClosed = bountyToBeClosed;
        await assertThrow.expectRevert(bountyNest.closeBounty(nowClosed, { from: jobPoster }));
    });    

    it('should submit successfully', async () => {
        const bountyNest = await BountyNest.deployed();

        let eventEmitted = false;
        let loggedSubmissionId;
        // submit to one of the added bounties
        var result = await bountyNest.submitResolution(bountyToBeResolved, "to be accepted", { from: bountyHunter });
        // check for event        
        if(result.logs[0] && result.logs[0].event)
        {
            loggedSubmissionId = result.logs[0].args.submissionId.toString(10);
            submissionToBeAccepted = parseInt(loggedSubmissionId);
            eventEmitted = true;
        }        

        assert.equal(eventEmitted, true, 'event should have been emitted');

        // confirm that submission is pending approval
        const isPending = await bountyNest.isPending.call(submissionToBeAccepted);        
        assert.equal(isPending, true, 'submission should be pending');

        // add another submission to be used in test scanrios after making sure adding new submission works
        result = await bountyNest.submitResolution(bountyToBeResolved, "to be rejected", { from: bountyHunter });;
        submissionToBeRejected = parseInt(result.logs[0].args.submissionId.toString(10));
    });

    it('can submit to open bounty only', async () => {
        const bountyNest = await BountyNest.deployed();

        await assertThrow.expectRevert(bountyNest.submitResolution(bountyToBeClosed, "should fail", { from: bountyHunter }));
    });

    it('can accept or reject submission on open bounty only', async () => {
        const bountyNest = await BountyNest.deployed();

        var result = await bountyNest.addBountry("test", 100, { from: jobPoster, value: 150 });        
        const bountyId = parseInt(result.logs[0].args.bountyId.toString(10));        

        result = await bountyNest.submitResolution(bountyId, "to be accepted", { from: bountyHunter });        
        const submissionId = parseInt(result.logs[0].args.submissionId.toString(10));        

        await bountyNest.closeBounty(bountyId, { from: jobPoster });

        //await assertThrow.expectRevert(bountyNest.accept(submissionId, { from: jobPoster }));        
        await assertThrow.expectRevert(bountyNest.reject(submissionId, { from: jobPoster }));
    });    

    it('only bounty poster can reject submission on it', async () => {
        const bountyNest = await BountyNest.deployed();

        await assertThrow.expectRevert(bountyNest.reject(submissionToBeRejected, { from: owner }));
    }); 
    
    it('should reject submission successfully', async () => {
        const bountyNest = await BountyNest.deployed();

        let eventEmitted = false;
        let loggedBountyId;
        let loggedSubmissionId;        
        const result = await bountyNest.reject(submissionToBeRejected, { from: jobPoster });
        if(result.logs[0] && result.logs[0].event)
        {
            loggedBountyId = result.logs[0].args.bountyId.toString(10);
            loggedSubmissionId = result.logs[0].args.submissionId.toString();
            eventEmitted = true;
        }        

        assert.equal(eventEmitted, true, 'event should have been emitted');

        const isOpen = await bountyNest.isOpen.call(bountyToBeResolved);
        assert.equal(loggedSubmissionId, submissionToBeRejected, 'should record submission id correctly on event');
        assert.equal(loggedBountyId, bountyToBeResolved, 'bounty should be what saved with submission');
        assert.equal(isOpen, true, 'bounty should still be open');
    });

    it('should accept submission successfully', async () => {
        const bountyNest = await BountyNest.deployed();

        let eventEmitted = false;
        let loggedBountyId;
        let loggedSubmissionId;        
        const result = await bountyNest.accept(submissionToBeAccepted, { from: jobPoster });
        if(result.logs[0] && result.logs[0].event)
        {
            loggedBountyId = result.logs[0].args.bountyId.toString();
            loggedSubmissionId = result.logs[0].args.submissionId.toString();
            eventEmitted = true;
        }     

        assert.equal(eventEmitted, true, 'event should have been emitted');
        assert.equal(loggedSubmissionId, submissionToBeAccepted, 'should record submission id correctly on event');
        assert.equal(loggedBountyId, bountyToBeResolved, 'bounty should be what saved with submission');

        const isResolved = await bountyNest.isResolved.call(bountyToBeResolved);
        assert.equal(isResolved, true, 'bounty should be resolved');
    });

    it('can accept pending submission only', async () => {
        const bountyNest = await BountyNest.deployed();

        await assertThrow.expectRevert(bountyNest.accept(submissionToBeAccepted, { from: jobPoster }));
        await assertThrow.expectRevert(bountyNest.accept(submissionToBeRejected, { from: jobPoster }));
    });

    it('can reject pending submission only', async () => {
        const bountyNest = await BountyNest.deployed();

        await assertThrow.expectRevert(bountyNest.reject(submissionToBeAccepted, { from: jobPoster }));
        await assertThrow.expectRevert(bountyNest.reject(submissionToBeRejected, { from: jobPoster }));
    });    
});