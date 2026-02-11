import hre from "hardhat";

async function main() {
  const MidTermGradeStorage = await hre.ethers.getContractFactory("MidTermGradeStorage");
  const midTermGradeStorage = await MidTermGradeStorage.deploy();
  await midTermGradeStorage.waitForDeployment();

  console.log("Deployed to:", await midTermGradeStorage.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});