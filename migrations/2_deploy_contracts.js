var Owned = artifacts.require("./Owned.sol");
var Admin = artifacts.require("./Admin.sol");

module.exports = function(deployer) {
    deployer.deploy(Owned);
    deployer.deploy(Admin);
};
