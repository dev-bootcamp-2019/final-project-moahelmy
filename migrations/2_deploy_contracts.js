var Owned = artifacts.require("./Owned.sol");
var Admin = artifacts.require("./Admin.sol");
var SimpleBank = artifacts.require("./SimpleBank.sol");
var BountyNest = artifacts.require("./BountyNest.sol");
var BountyNestStorage = artifacts.require("./BountyNestStorage.sol");

module.exports = function(deployer) {
    deployer.deploy(Owned);
    deployer.deploy(Admin);
    deployer.deploy(SimpleBank);
    deployer.deploy(BountyNestStorage).then(function (){       
        console.log(BountyNestStorage.address);
        return deployer.deploy(BountyNest, BountyNestStorage.address);
    });    
};
