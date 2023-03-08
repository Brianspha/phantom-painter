// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const registryAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  console.log(
    "================================================Deploying SQLHelpers library================================================"
  );

  const SQLHelpersFactory = await ethers.getContractFactory("SQLHelpers");
  const sqlHelpers = await SQLHelpersFactory.deploy();
  await sqlHelpers.deployed();
  console.log(
    `================================================SQLHelpers library deployed at ${sqlHelpers.address}================================================`
  );
  const TokenContract = await ethers.getContractFactory("TokenContract", {
    libraries: {
      SQLHelpers: sqlHelpers.address,
    },
  });
  const tokenContract = await TokenContract.deploy(
    "https://testnet.tableland.network/query?s=",
    "not.implemented.com",
    registryAddress
  );

  tokenContract.deployed();
  console.log(
    `================================================TokenContract deployed at ${tokenContract.address}================================================`
  );


  const FantomPainter = await ethers.getContractFactory("FantomPainter");
  const FantomPainterContract = await FantomPainter.deploy(
    tokenContract.address
  );
  await FantomPainterContract.deployed();
  console.log(
    `================================================FantomPainter deployed at ${FantomPainterContract.address}================================================`
  );
  console.log("running post deploy");
  tokenContract.setContractFantomPainterAddress(FantomPainterContract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
