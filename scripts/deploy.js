// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  // Setup Accounts
  [buyer, seller, inspector, lender] = await ethers.getSigners();

  const RealEstate = await ethers.getContractFactory('RealEstate')
  const realEstate = await RealEstate.deploy()
  await realEstate.deployed()

  console.log(`Deployed Real Estate contract at: ${realEstate.address}`)
  console.log(`Minting 3 properties \n`)

  for(i=0; i = 3; i++) {
    const transaction = await realEstate.connect(seller).mint(`https://ipfs.io/ipfs/QmQUozrHLAusXDxrvsESJ3PYB3rUeUuBAvVWw6nop2uu7c/${i+1}.png`)
    await transaction.wait()
  }

  //Deploy Escrow
  const Escrow = await ethers.getContractFactory('Escrow')
  const escrow = await Escrow.deploy(
    realEstate.address,
    seller.address,
    inspector.address,
    lender.address
  )
  await escrow.deployed()

  for(i=0; i = 3; i++) {
    //Approve Proprties
    let transaction = await realEstate.connect(seller).approve(escrow.address, i+1)
    await transaction.wait()
  }

  // Listing Properties..
  transaction = await escrow.connect(seller).list(1, buyer.address, tokens(20), tokens(10))
  await transaction.wait()  

  transaction = await escrow.connect(seller).list(2, buyer.address, tokens(20), tokens(10))
  await transaction.wait()  

  transaction = await escrow.connect(seller).list(2, buyer.address, tokens(20), tokens(10))
  await transaction.wait()  

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
