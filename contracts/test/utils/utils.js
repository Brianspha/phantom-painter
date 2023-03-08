const { time } = require("@nomicfoundation/hardhat-network-helpers");
async function increaseTime(seconds) {
  // advance time by one hour and mine a new block
  await helpers.time.increase(3600);

  // mine a new block with timestamp `newTimestamp`
  await helpers.time.increaseTo(newTimestamp);

  // set the timestamp of the next block but don't mine a new block
  await helpers.time.setNextBlockTimestamp(newTimestamp);
}

module.exports = {
  increaseTime,
};
