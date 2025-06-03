const ALCHEMY_API_KEY = "vCUWGeU9hwCz0bq7rSKV5Dk1Bf20KSYV";
const ALCHEMY_BASE_URL = `https://eth-sepolia.g.alchemy.com/nft/v2/${ALCHEMY_API_KEY}`;
// contrato unq 0x1FEe62d24daA9fc0a18341B582937bE1D837F91d
// contrato propio 0xF01E423eE25d5Ba3DFD0AC73eE6E26Ef1b5AA094
document.getElementById("conectar").addEventListener("click", async () => {
  if (!window.ethereum) {
    alert("MetaMask no está instalada");
    return;
  }

  const contrato = document.getElementById("inputContrato").value.trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(contrato)) {
    alert("Contrato inválido");
    return;
  }

  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  const walletAddress = accounts[0];

  document.getElementById("direccion").innerText = `Conectado: ${walletAddress}`;
  document.getElementById("contrato").innerText = `Contrato: ${contrato}`;
  
  cargarNFTs(walletAddress, contrato);
});

async function cargarNFTs(walletAddress, contrato) {
  const contenedor = document.getElementById("nfts");
  contenedor.innerHTML = "🔄 Buscando NFTs...";

  try {
    const url = `${ALCHEMY_BASE_URL}/getNFTs?owner=${walletAddress}&contractAddresses[]=${contrato}`;
    const response = await axios.get(url);
    const nfts = response.data.ownedNfts;

    if (!nfts || nfts.length === 0) {
      contenedor.innerHTML = "No se encontraron NFTs para esta wallet.";
      return;
    }

    contenedor.innerHTML = "";

    nfts.forEach(nft => {
      const metadata = nft.metadata || {};
      const imagen = metadata.image || nft.image?.originalUrl || "";
      const nombre = metadata.name || "NFT sin nombre";
      const descripcion = metadata.description || "";

      const card = document.createElement("div");
      card.className = "nft-card";
      card.innerHTML = `
        <img src="${imagen}" alt="NFT">
        <h3>${nombre}</h3>
        <p>${descripcion}</p>
        <small>Contrato: ${nft.contract.address.slice(0, 10)}...</small>
      `;
      contenedor.appendChild(card);
    });
  } catch (error) {
    console.error("Error al cargar NFTs:", error);
    document.getElementById("nfts").innerText = "❌ Error al obtener NFTs.";
  }
}