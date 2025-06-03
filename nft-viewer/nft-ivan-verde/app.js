const contratoAddress = "0x5d12db85456e27935d9979d8f9e3c88ff09656af";

let abi;
let signer;
let contrato;

document.getElementById("conectar").addEventListener("click", async () => {
  if (!window.ethereum) {
    alert("Instalá MetaMask primero");
    return;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();
  const miAddress = await signer.getAddress();

  const response = await fetch("abi.json");
  abi = await response.json();

  contrato = new ethers.Contract(contratoAddress, abi, signer);

  console.log("🔗 Wallet conectada:", miAddress);
  mostrarMisNFTs(miAddress);
});

async function mostrarMisNFTs(miAddress) {
  const container = document.getElementById("nfts");
  container.innerHTML = "Cargando NFTs...";

  try {
    const total = await contrato.tokenCounter();
    console.log("🔢 tokenCounter:", total);
    container.innerHTML = "";

    let encontrados = 0;

    for (let i = 0; i < total; i++) {
      try {
        const owner = await contrato.ownerOf(i);
        console.log(`🔍 Token ID ${i} pertenece a ${owner}`);

        if (owner.toLowerCase() !== miAddress.toLowerCase()) continue;

        const tokenURI = await contrato.tokenURI(i);
        console.log(`🌐 tokenURI(${i}):`, tokenURI);

        const res = await fetch(tokenURI);
        const metadata = await res.json();

        const card = document.createElement("div");
        card.className = "nft-card";
        card.innerHTML = `
          <img src="${metadata.image}" alt="NFT ${i}" />
          <h3>${metadata.name}</h3>
          <p>${metadata.description}</p>
        `;
        container.appendChild(card);
        encontrados++;
      } catch (innerError) {
        console.warn(`⚠️ Error al procesar token #${i}:`, innerError);
      }
    }

    if (encontrados === 0) {
      container.innerHTML = "No tenés NFTs en este contrato.";
    }
  } catch (err) {
    container.innerHTML = "❌ Error al cargar NFTs.";
    console.error("Error general:", err);
  }
}
