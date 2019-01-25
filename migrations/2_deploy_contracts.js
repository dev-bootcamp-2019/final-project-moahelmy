var Owned = artifacts.require("./Owned.sol");
var Admin = artifacts.require("./Admin.sol");
var SimpleBank = artifacts.require("./SimpleBank.sol");
var BountyNest = artifacts.require("./BountyNest.sol");

module.exports = function(deployer) {
    deployer.deploy(Owned);
    deployer.deploy(Admin);
    deployer.deploy(SimpleBank);
    deployer.deploy(BountyNest);
};
