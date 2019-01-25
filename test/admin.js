var Admin = artifacts.require("Admin.sol");
var assertThrow = require("./assertExceptions");

contract('Admin', function (accounts) {
    const owner = accounts[0];
    const administrator = accounts[1];
    const guest = accounts[2];
    const user = accounts[3];

    it('should only owner at the beginning being able to add admins', async () => {
        const admin = await Admin.deployed();

        var eventEmitted = false;
        // add admin
        var result = await admin.addAdmin(administrator, { from: owner });
        var loggedAdmin;
        // check for events
        if(result.logs[0] && result.logs[0].event)
        {
            loggedAdmin = result.logs[0].args.admin;
            eventEmitted = true;
        }

        // test user
        const isAdmin = await admin.isAdmin.call(administrator);
 
        assert.equal(eventEmitted, true, 'adding an admin should emit admin added event');
        assert.equal(loggedAdmin, administrator, "administrator has been added successfully");        
        assert.equal(isAdmin, true, "should be marked as admin");
    });

    it('should not allow adding admins twice', async () => {
        const admin = await Admin.deployed();
        
        await assertThrow.expectRevert(admin.addAdmin(administrator, { from: owner }));
    });

    it('only admin can add new admins', async () => {
        const admin = await Admin.deployed();

        await assertThrow.expectRevert(admin.addAdmin(guest, { from: guest }));

        var isAdmin = await admin.isAdmin.call(guest);
        assert.equal(isAdmin, false, "should not be marked as admin");
    });

    it('can not remove non-admin', async () => {
        const admin = await Admin.deployed();

        await assertThrow.expectRevert(admin.removeAdmin(guest, { from: owner }));
    });

    it('only owner can remove admins', async () => {
        const admin = await Admin.deployed();
                
        await admin.addAdmin(user, { from: administrator });
        await assertThrow.expectRevert(admin.removeAdmin(user, { from: administrator }));
    });

    it('should allow owner to remove admins', async () => {
        const admin = await Admin.deployed();

        var eventEmitted = false;
        var result = await admin.removeAdmin(administrator, { from: owner });
        var logged;
        if(result.logs[0].event)
        {
            logged = result.logs[0].args.admin;
            eventEmitted = true;
        }        
        const isAdmin = await admin.isAdmin.call(administrator);

        assert.equal(eventEmitted, true, 'event should have been emitted');
        assert.equal(logged, administrator, "administrator has been removed successfully");        
        assert.equal(isAdmin, false, "should be no longer admin");
    });
});