/**
 * Used to catch errors returned by ETH VM
 */

const PREFIX = "Returned error: VM Exception while processing transaction: ";

async function shouldThrow(promise, message) {
    try {
        await promise;
        throw null;
    }
    catch (error) {
        assert(error, "Expected an error but did not get one");
        assert(error.message.startsWith(PREFIX + message), "Expected an error starting with '" + PREFIX + message + "' but got '" + error.message + "' instead");
    }
};

module.exports = {
    expectRevert            : async function(promise) {await shouldThrow(promise, "revert"             );},
    expectOutOfGas          : async function(promise) {await shouldThrow(promise, "out of gas"         );},
    expectInvalidJump       : async function(promise) {await shouldThrow(promise, "invalid JUMP"       );},
    expectInvalidOpcode     : async function(promise) {await shouldThrow(promise, "invalid opcode"     );},
    expectStackOverflow     : async function(promise) {await shouldThrow(promise, "stack overflow"     );},
    expectStackUnderflow    : async function(promise) {await shouldThrow(promise, "stack underflow"    );},
    expectStaticStateChange : async function(promise) {await shouldThrow(promise, "static state change");},
};