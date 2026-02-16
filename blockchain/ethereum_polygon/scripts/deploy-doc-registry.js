import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying with:", deployer.address);

  const DocumentRegistry = await hre.ethers.getContractFactory("DocumentRegistry");

  const documentRegistry = await DocumentRegistry.deploy(deployer.address);
  await documentRegistry.waitForDeployment();

  console.log("Deployed to:", await documentRegistry.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
