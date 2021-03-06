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
    const reward = 120;
    let contractBalance = 0;
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
        var result = await bountyNest.add("to be resovled", reward, { from: jobPoster, value: 150 });        
        let openedEvent;
        // check for event
        if(result && result.logs)
        {            
            openedEvent = result.logs.filter(log => {
                return log.event == "Opened";
            })[0];
            loggedBountyId = openedEvent.args.bountyId.toNumber();
            bountyToBeResolved = loggedBountyId;
            eventEmitted = true;
        }
        assert.equal(eventEmitted, true, 'event should have been emitted');
        
        // check if added bounty is correct
        const bounty = await bountyNest.fetchBounty.call(bountyToBeResolved);
        assert.equal(bounty.poster, jobPoster, "poster is incorrect");
        assert.equal(bounty.state.toNumber() === 1, true, "new bounty should be open");
        assert.equal(bounty.reward, reward, "reward is incorrect");

        // check if added to poster list of bounties
        result = await bountyNest.listMyBounties.call({ from: jobPoster });        
        assert.equal(result[0].toString(), loggedBountyId, "should be added to poster list");

        result = await bountyNest.balance({ from: bountyNest.address });
        contractBalance = result.toNumber();
        assert.equal(contractBalance, reward, "contract balance incorrect");

        // add another bounty to be used in test scanrios after making sure adding new bounty works
        result = await bountyNest.add("to be closed", reward, { from: jobPoster, value: reward });
        openedEvent = result.logs.filter(log => {
            return log.event == "Opened";
        })[0];
        bountyToBeClosed = openedEvent.args.bountyId.toNumber();
    });

    it('should revert adding new bounty with zero reward or value not equal reward', async () => {
        const bountyNest = await BountyNest.deployed();
                
        // reward is zero
        await assertThrow.expectRevert(bountyNest.add("should fail", 0, { from: jobPoster, value: 100 }));

        // value < reward
        await assertThrow.expectRevert(bountyNest.add("should fail", 100, { from: jobPoster, value: 50 }));
    });

    it('only bounty poster can close it', async () => {
        const bountyNest = await BountyNest.deployed();     
        
        const stillOpen = bountyToBeClosed;
        await assertThrow.expectRevert(bountyNest.close(stillOpen, { from: owner }));
    });

    it('should close open bounty if poster', async () => {
        const bountyNest = await BountyNest.deployed();

        let result = await bountyNest.balance({ from: bountyNest.address });
        contractBalanceBefore = result.toNumber();        

        let eventEmitted = false;
        let loggedBountyId;
        // close bounty
        const stillOpen = bountyToBeClosed;
        result = await bountyNest.close(stillOpen, { from: jobPoster });
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

        result = await bountyNest.balance({ from: bountyNest.address });
        contractBalance = result.toNumber();
        assert.equal(contractBalance, contractBalanceBefore - reward, "contract balance incorrect");
    });

    it('only open bounty can be closed', async () => {
        const bountyNest = await BountyNest.deployed();

        const nowClosed = bountyToBeClosed;
        await assertThrow.expectRevert(bountyNest.close(nowClosed, { from: jobPoster }));
    });

    it('should submit successfully', async () => {
        const bountyNest = await BountyNest.deployed();

        let eventEmitted = false;
        let loggedSubmissionId;
        // submit to one of the added bounties
        var result = await bountyNest.submit(bountyToBeResolved, "to be accepted", { from: bountyHunter });
        // check for event        
        if(result.logs[0] && result.logs[0].event)
        {
            loggedSubmissionId = result.logs[0].args.submissionId.toNumber();
            submissionToBeAccepted = loggedSubmissionId;
            eventEmitted = true;
        }        

        assert.equal(eventEmitted, true, 'event should have been emitted');

        // confirm that submission is pending approval
        const isPending = await bountyNest.isPending.call(submissionToBeAccepted);        
        assert.equal(isPending, true, 'submission should be pending');

        // check if added bounty is open
        const bounty = await bountyNest.fetchBounty.call(bountyToBeResolved);
        assert.equal(bounty.submissions.length, 1, "bounty.submissions is incorrect");
        assert.equal(bounty.submissions[0], submissionToBeAccepted, "bounty.submissions is incorrect");

        // add another submission to be used in test scanrios after making sure adding new submission works
        result = await bountyNest.submit(bountyToBeResolved, "to be rejected", { from: bountyHunter });;
        submissionToBeRejected = result.logs[0].args.submissionId.toNumber();
    });

    it('can submit to open bounty only', async () => {
        const bountyNest = await BountyNest.deployed();

        await assertThrow.expectRevert(bountyNest.submit(bountyToBeClosed, "should fail", { from: bountyHunter }));
    });

    it('can accept or reject submission on open bounty only', async () => {
        const bountyNest = await BountyNest.deployed();

        var result = await bountyNest.add("test", 100, { from: jobPoster, value: 100 });        
        const bountyId = result.logs[0].args.bountyId.toNumber();

        result = await bountyNest.submit(bountyId, "to be accepted", { from: bountyHunter });        
        const submissionId = result.logs[0].args.submissionId.toNumber();

        await bountyNest.close(bountyId, { from: jobPoster });

        await assertThrow.expectRevert(bountyNest.accept(submissionId, { from: jobPoster }));        
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
        result = await bountyNest.accept(submissionToBeAccepted, { from: jobPoster });
        const index = result.logs.length - 1;
        if(result.logs[index] && result.logs[index].event)
        {
            loggedBountyId = result.logs[index].args.bountyId.toString();
            loggedSubmissionId = result.logs[index].args.submissionId.toString();
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