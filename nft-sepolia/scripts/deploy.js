const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Desplegando desde la cuenta:", deployer.address);

  const NFT = await hre.ethers.getContractFactory("MiNFT");
  const nft = await NFT.deploy();
  await nft.waitForDeployment();

  console.log("Contrato NFT desplegado en:", await nft.getAddress());

  const tokenURI = "https://ipfs.io/ipfs/bafkreicwtghjv44bmucudpeupm3s7ygu5onwqivyivweicy33sv3koelie";
  const destinatario = "0xa34Bb3b93C7DA0F87D65ed1FC67C4b402bEf9A35";

  // Llamada a la función crearNFT
  const tx = await nft.crearNFT(destinatario, tokenURI);
  await tx.wait();

  // Obtenemos el tokenCounter como BigInt y luego lo convertimos a Number
  const tokenCounter = await nft.tokenCounter();
  console.log("NFT creado exitosamente. Token ID:", Number(tokenCounter) - 1);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});