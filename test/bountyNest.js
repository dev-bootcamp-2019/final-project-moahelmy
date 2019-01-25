var BountyNest = artifacts.require("BountyNest.sol");
var assertThrow = require("./assertExceptions");

contract('BountyNest', function (accounts) {
    const owner = accounts[0];
    const jobPoster = accounts[1]; 
    const bountyHunter = accounts[2];
    var bountyToBeResolved = 1;   
    var bountyToBeClosed = 2;    
    var submissionToBeAccepted = 1;
    var submissionToBeRejected = 2;

    it('should enrol itself on creation', async () => {
        const bountyNest = await BountyNest.deployed();

        const enrolled = await bountyNest.enrolled(bountyNest.address, {from: owner});
        assert.equal(enrolled, true, 'contract is entrolled');
    });

    it('should add new bounty', async () => {
        const bountyNest = await BountyNest.deployed();

        var eventEmitted = false;
        var loggedBountyId;
        var result = await bountyNest.addBountry("to be resovled", 120, { from: jobPoster, value: 150 });
        if(result && result.logs && result.logs[0].event)
        {
            loggedBountyId = result.logs[0].args.bountyId;
            bountyToBeResolved = loggedBountyId;
            eventEmitted = true;
        }        
        assert.equal(eventEmitted, true, 'event should have been emitted');

        const isOpen = await bountyNest.isOpen.call(loggedBountyId);

        assert.equal(isOpen, true, 'new bounty should be open');

        var toBeClosed = await bountyNest.addBountry("to be closed", 120, { from: jobPoster, value: 150 });
        bountyToBeClosed = toBeClosed.logs[0].args.bountyId;
    });

    it('should not add new bounty with zero reward or value less than reward', async () => {
        const bountyNest = await BountyNest.deployed();
                
        await assertThrow.expectRevert(bountyNest.addBountry("should fail", 0, { from: jobPoster, value: 100 }));

        await assertThrow.expectRevert(bountyNest.addBountry("should fail", 100, { from: jobPoster, value: 50 }));
    });

    it('only bounty poster can close it', async () => {
        const bountyNest = await BountyNest.deployed();        
        await assertThrow.expectRevert(bountyNest.closeBounty(bountyToBeClosed, { from: owner }));
    });

    it('should close open bounty if poster', async () => {
        const bountyNest = await BountyNest.deployed();

        var eventEmitted = false;
        var loggedBountyId;
        var result = await bountyNest.closeBounty(bountyToBeClosed, { from: jobPoster });
        if(result && result.logs[0] && result.logs[0].event)
        {
            loggedBountyId = result.logs[0].args.bountyId;            
            eventEmitted = true;
        }        

        assert.equal(eventEmitted, true, 'event should have been emitted');

        const isClosed = await bountyNest.isClosed.call(loggedBountyId);
        assert.equal(isClosed, true, 'bounty should be closed');
    });

    it('only open bounty can be closed', async () => {
        const bountyNest = await BountyNest.deployed();

        await assertThrow.expectRevert(bountyNest.closeBounty(bountyToBeClosed, { from: jobPoster }));
    });    

    it('should submit successfully', async () => {
        const bountyNest = await BountyNest.deployed();

        var eventEmitted = false;
        var loggedSubmissionId;
        var result = await bountyNest.submitResolution(bountyToBeResolved, "to be accepted", { from: bountyHunter });
        if(result.logs[0] && result.logs[0].event)
        {
            loggedSubmissionId = result.logs[0].args.submissionId;
            submissionToBeAccepted = loggedSubmissionId;           
            eventEmitted = true;
        }        

        assert.equal(eventEmitted, true, 'event should have been emitted');

        var isPending = bountyNest.isPending.call(loggedSubmissionId);
        assert.equal(isPending, true, 'submission should be pending');

        var toBeRejected = await bountyNest.submitResolution(bountyToBeResolved, "to be rejected", { from: bountyHunter });;
        submissionToBeRejected = toBeRejected.logs[0].args.submissionId;
    });

    it('can submit to open bounty only', async () => {
        const bountyNest = await BountyNest.deployed();

        await assertThrow.expectRevert(bountyNest.submitResolution(bountyToBeClosed, "should fail", { from: bountyHunter }));
    });

    it('can accept or reject submission on open bounty only', async () => {
        const bountyNest = await BountyNest.deployed();

        const result = await bountyNest.addBountry("test", 100, { from: jobPoster, value: 150 });
        const bountyId = result.logs[0].args.bountyId;

        const submissionResult = await bountyNest.submitResolution(bountyId, "to be accepted", { from: bountyHunter });
        const submissionId = submissionResult.logs[0].args.submissionId;

        await bountyNest.closeBounty(bountyId, { from: jobPoster });        

        await assertThrow.expectRevert(bountyNest.accept(submissionId, "should fail", { from: jobPoster }));

        await assertThrow.expectRevert(bountyNest.reject(submissionId, "should fail", { from: jobPoster }));
    });    

    it('only bounty poster can reject submission on it', async () => {
        const bountyNest = await BountyNest.deployed();

        await assertThrow.expectRevert(bountyNest.reject(submissionToBeRejected, { from: owner }));
    }); 
    
    it('should reject submission successfully', async () => {
        const bountyNest = await BountyNest.deployed();

        var eventEmitted = false;
        var loggedBountyId;
        var loggedSubmissionId;
        var result = await bountyNest.reject(submissionToBeRejected, { from: jobPoster });
        if(result.logs[0] && result.logs[0].event)
        {
            loggedBountyId = result.logs[0].args.bountyId;
            loggedSubmissionId = result.logs[0].args.submissionId;
            eventEmitted = true;
        }        

        assert.equal(eventEmitted, true, 'event should have been emitted');

        const isOpen = bountyNest.isOpen.call(loggedBountyId);
        assert.equal(loggedSubmissionId, submissionToBeRejected, 'should record submission id correctly on event');
        assert.equal(loggedBountyId, bountyToBeResolved, 'bounty should be what saved with submission');
        assert.equal(isOpen, true, 'bounty should still be open');
    });

    it('should accept submission successfully', async () => {
        const bountyNest = await BountyNest.deployed();

        var eventEmitted = false;
        var loggedBountyId;
        var loggedSubmissionId;        
        var result = await bountyNest.accept(submissionToBeAccepted, { from: jobPoster });
        if(result.logs[0] && result.logs[0].event)
        {
            loggedBountyId = result.logs[0].args.bountyId;
            loggedSubmissionId = result.logs[0].args.submissionId;
            eventEmitted = true;
        }        

        assert.equal(eventEmitted, true, 'event should have been emitted');
        assert.equal(loggedSubmissionId, submissionToBeAccepted, 'should record submission id correctly on event');
        assert.equal(loggedBountyId, bountyToBeResolved, 'bounty should be what saved with submission');

        const isResolved = await bountyNest.isResolved.call(loggedBountyId);
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