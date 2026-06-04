const hre = require("hardhat");
const fs = require("fs")
const path = require("path")

async function main() {
  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();
  
  await voting.waitForDeployment();

  const address = await voting.getAddress()
  // Either of these is fine in v6:
  console.log("Voting deployed to:", address);
  // console.log("Voting deployed to:", voting.target);
  const contractData = {
    address: address,
    abi: voting.interface.format("json"), // ✅ no JSON.parse here
  };
  const jsonfilepathbackend = path.join(__dirname,"../backend/blockchain/contract.json")
  const jsonfilepathfrontend = path.join(__dirname,"../ether-poll-spark/src/blockchain/contract.json")

  console.log(contractData)
  fs.writeFileSync(jsonfilepathbackend, JSON.stringify(contractData));
  fs.writeFileSync(jsonfilepathfrontend, JSON.stringify(contractData));

}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
