// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {
  // Setup Accounts
  [buyer, seller, inspector, lender] = await ethers.getSigners();

  const RealEstate = await ethers.getContractFactory('RealEstate')
  const realEstate = await RealEstate.deploy()
  await realEstate.deployed()

  console.log(`Deployed Real Estate contract at: ${realEstate.address}`)
  console.log(`Minting 3 properties \n`)

  for(i=0; i < 3; i++) {
    const transaction = await realEstate.connect(seller).mint(`https://gist.githubusercontent.com/niyas/c84e16ec4b00f479ec8b57c81e3942a3/raw/df8aaaca7b8afd1a09cf1326b53fa63951ac7102/${i+1}.json`)
    await transaction.wait()
    console.log(`minting contract ${i+1}`)
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

  console.log(`Deployed Escrow Contract at : ${escrow.address}`)

  for(j=0; j < 3; j++) {
    //Approve Proprties
    let transaction = await realEstate.connect(seller).approve(escrow.address, j+1)
    await transaction.wait()
    console.log(`Transactoin ${j}`)
  }

  // Listing Properties..
  transaction = await escrow.connect(seller).list(1, buyer.address, tokens(20), tokens(10))
  await transaction.wait()  

  transaction = await escrow.connect(seller).list(2, buyer.address, tokens(15), tokens(5))
  await transaction.wait()  

  transaction = await escrow.connect(seller).list(3, buyer.address, tokens(10), tokens(5))
  await transaction.wait()  

  console.log('Finished!!')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
