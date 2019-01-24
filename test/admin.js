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
        var result = await admin.addAdmin(administrator, { from: owner });
        var loggedAdmin;
        if(result.logs[0].event)
        {
            loggedAdmin = result.logs[0].args.admin;
            eventEmitted = true;
        }

        const isAdmin = await admin.isAdmin.call(administrator);
 
        assert.equal(loggedAdmin, administrator, "administrator has been added successfully");
        assert.equal(eventEmitted, true, 'adding an item should emit admin added event');
        assert.equal(isAdmin, true, "should be marked as admin");
    });

    it('should not allow adding admins twice', async () => {
        const admin = await Admin.deployed();

        await assertThrow.expectRevert(admin.addAdmin(administrator, { from: owner }));
    });

    it('should not allow adding admins using guest', async () => {
        const admin = await Admin.deployed();

        await assertThrow.expectRevert(admin.addAdmin(guest, { from: guest }));

        var isAdmin = await admin.isAdmin.call(guest);
        assert.equal(isAdmin, false, "should not be marked as admin");
    });

    it('should not allow removing guests', async () => {
        const admin = await Admin.deployed();

        await assertThrow.expectRevert(admin.removeAdmin(guest, { from: owner }));
    });

    it('should allow owner only to remove admins', async () => {
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

        assert.equal(logged, administrator, "administrator has been removed successfully");
        assert.equal(eventEmitted, true, 'adding an item should emit admin removed event');
        assert.equal(isAdmin, false, "should be no longer admin");
    });
});