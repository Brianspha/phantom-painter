const { SignerWithAddress } = require("@nomiclabs/hardhat-ethers/signers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { LocalTableland, getAccounts } = require("@tableland/local");
const utils = require("web3-utils");
const randomColor = require("randomcolor");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

const lt = new LocalTableland({
  // use the silent option to avoid cluttering the test output
  silent: true,
});
describe("Token contract", function () {
  let deployer, alice, jane, tokenContract, registry, FantomPainterContract;
  before(async function () {
    this.timeout(1000000);
    await lt.start();
    await lt.isReady();
    console.log(
      "================================================Assigning singers================================================"
    );
    [deployer, alice, jane] = await ethers.getSigners();
    console.log(
      "================================================Deploying SQLHelpers library================================================"
    );

    const SQLHelpersFactory = await ethers.getContractFactory("SQLHelpers");
    const sqlHelpers = await SQLHelpersFactory.deploy();
    await sqlHelpers.deployed();
    console.log(
      `================================================SQLHelpers library deployed at ${sqlHelpers.address}================================================`
    );
    console.log(
      "================================================Deploying SafeMathV2 library================================================"
    );

    const SafeMathV2Factory = await ethers.getContractFactory("SafeMathV2");
    const safeMathV2 = await SafeMathV2Factory.deploy();
    await safeMathV2.deployed();
    console.log(
      `================================================SafeMathV2 library deployed at ${safeMathV2.address}================================================`
    );
    console.log(
      "================================================Deploying TablelandTables================================================"
    );
    const RegistryFactory = await ethers.getContractFactory("TablelandTables");
    registry = await RegistryFactory.deploy();
    await registry.deployed();
    await registry.connect(deployer).initialize("http://localhost:8080/");
    console.log(
      `================================================TablelandTables deployed at ${registry.address}================================================`
    );
    console.log(
      "================================================Deploying TokenContract================================================"
    );
    const TokenContract = await ethers.getContractFactory("TokenContract", {
      libraries: {
        SQLHelpers: sqlHelpers.address,
      },
    });
    tokenContract = await TokenContract.deploy(
      "https://testnet.tableland.network/query?s=",
      "not.implemented.com",
      registry.address
    );

    tokenContract.deployed();
    console.log(
      `================================================TokenContract deployed at ${tokenContract.address}================================================`
    );
    console.log(
      "================================================Deploying FantomPainter================================================"
    );
    const FantomPainter = await ethers.getContractFactory("FantomPainter");
    FantomPainterContract = await FantomPainter.deploy(tokenContract.address);
    await FantomPainterContract.deployed();
    console.log(
      `================================================FantomPainter deployed at ${FantomPainterContract.address}================================================`
    );
  });

  it("Should set the Fantom Painter address on the token contract", async () => {
    const tx = await tokenContract
      .connect(deployer)
      .setContractFantomPainterAddress(FantomPainterContract.address);
    expect(
      (await tokenContract.fantomPainterAddress()) ===
        FantomPainterContract.address,
      "FantomPainter address not set"
    );
  });
  it("Should mint a new token for alice", async () => {
    const color = randomColor();
    const tx = await FantomPainterContract.connect(alice).colorPixel(0, color, {
      value: ethers.utils.parseEther("1"),
    });
    const events = (await tx.wait()).events;
    const transferEvent = events[events.length - 1].args;

    expect(transferEvent.owner === alice.address, "Alice doesnt own pixel");
  });
  it("Should mint a new token for jane", async () => {
    const color = randomColor();
    const tx = await FantomPainterContract.connect(jane).colorPixel(1, color, {
      value: ethers.utils.parseEther("1"),
    });
    const events = (await tx.wait()).events;
    const transferEvent = events[events.length - 1].args;

    expect(transferEvent.owner === jane.address, "Alice doesn't own pixel");
  });
  it("Should mint a new token for jane and fail", async () => {
    const color = randomColor();
    await expect(
      FantomPainterContract.connect(alice).colorPixel(1, color, {
        value: ethers.utils.parseEther("1"),
      })
    ).to.be.revertedWith("Pixel occupied");
  });

  it("Should get alices tokenURI", async () => {
    const tokenURI = await tokenContract.tokenURI(0);
    expect(
      tokenURI ===
        "https://testnet.tableland.network/query?s=SELECT%20json_object(%27id%27,id,%27external_link%27,external_link,%27pixel_index%27,pixel_index,%27owner%27,owner)%20as%20meta%20FROM%20FantomPainter_31337_1%20WHERE%20id=0&mode=list",
      "Invalid tokenURI"
    );
  });
  it("Should mint a new token for jane and fail because cooldown time hasn't lapsed", async () => {
    const color = randomColor();
    await expect(
      FantomPainterContract.connect(alice).colorPixel(20, color, {
        value: ethers.utils.parseEther("1"),
      })
    ).to.be.revertedWith("Cooldown time hasnt expired");
  });

  it("Should mint a new token at Pixel 20 for jane", async () => {
    await increaseTime(172800);
    const color = randomColor();
    const tx = await FantomPainterContract.connect(jane).colorPixel(20, color, {
      value: ethers.utils.parseEther("1"),
    });
    const events = (await tx.wait()).events;
    const transferEvent = events[events.length - 1].args;

    expect(transferEvent.owner === jane.address, "Jane doesn't own pixel");
  });
  it("Should get janes details", async () => {
    await increaseTime(172800);
    const color = randomColor();
    const details = await FantomPainterContract.connect(jane).getArtistDetails(
      jane.address
    );
    const [ownedPixels, coolDownTimer, active] = details;
    expect(ownedPixels === "2", "Jane doesn't own 2 pixel");
  });
});

async function increaseTime(seconds) {
  // advance time by one hour and mine a new block
  await time.increase(seconds);

  // mine a new block with timestamp `newTimestamp`
  // await time.increaseTo(seconds);

  // set the timestamp of the next block but don't mine a new block
  // await time.setNextBlockTimestamp(seconds);
}
