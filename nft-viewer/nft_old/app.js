const ALCHEMY_API_KEY = "vCUWGeU9hwCz0bq7rSKV5Dk1Bf20KSYV";
const ALCHEMY_BASE_URL = `https://eth-sepolia.g.alchemy.com/nft/v2/${ALCHEMY_API_KEY}`;
const contrato = "0x1FEe62d24daA9fc0a18341B582937bE1D837F91d";

window.addEventListener("load", () => {
  document.getElementById("conectar").addEventListener("click", async () => {
    if (!window.ethereum) {
      alert("MetaMask no está instalada");
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const walletAddress = accounts[0];
      document.getElementById("direccion").innerText = `Conectado: ${walletAddress}`;
      document.getElementById("contrato").innerText = `Contrato: ${contrato}`;
      await cargarNFTs(walletAddress);
    } catch (error) {
      console.error("Error al conectar:", error);
      alert("Error al conectar la wallet");
    }
  });
});

async function cargarNFTs(walletAddress) {
  const contenedor = document.getElementById("nfts");
  contenedor.innerHTML = "🔄 Buscando NFTs...";

  try {
    const url = `${ALCHEMY_BASE_URL}/getNFTs?owner=${walletAddress}&contractAddresses[]=${contrato}&withMetadata=true`;
    const response = await axios.get(url);
    const nfts = response.data.ownedNfts;

    if (!nfts || nfts.length === 0) {
      contenedor.innerHTML = "No se encontraron NFTs para esta wallet.";
      return;
    }

    contenedor.innerHTML = "";

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const abi = [
      "function uri(uint256) view returns (string)",
      "function datosDeClases(uint256) view returns (uint256, string, address)"
    ];
    const contract = new ethers.Contract(contrato, abi, provider);

    for (const nft of nfts) {
      const tokenId = parseInt(nft.id.tokenId, 16);
      const nombre = nft.metadata?.name || "Sin nombre";
      const imagen = nft.media?.[0]?.gateway || nft.metadata?.image;
      const desc = nft.metadata?.description || "Sin descripción";

      // Verificar si uri existe
      try {
        await contract.uri(tokenId);
      } catch (uriError) {
        console.warn(`⚠️ Token ${tokenId} no tiene URI válida`);
      }

      // Obtener datos del contrato
      let clase = "No definido";
      let tema = "No definido";
      let alumno = "Sin alumno";

      try {
        const [claseObtenida, temaObtenido, alumnoObtenido] = await contract.datosDeClases(tokenId);
        clase = claseObtenida;
        tema = temaObtenido;
        alumno = alumnoObtenido;
      } catch (error) {
        console.warn(`⚠️ No se pudo obtener datosDeClases para token ${tokenId}`, error);
        if (error?.code === "CALL_EXCEPTION") {
          clase = "No disponible";
          tema = "No disponible";
          alumno = "Dato inaccesible ⚠️";
        } else {
          clase = "Error";
          tema = "Error";
          alumno = "Error";
        }
      }

      const card = document.createElement("div");
      card.className = "nft-card";
      card.innerHTML = `
        ${imagen ? `<img src="${imagen}" alt="NFT" onerror="this.style.display='none'">` : ''}
        <h3>${nombre}</h3>
        <h5>Desc: ${desc}</h5>
        <div class="metadata">
          <p><strong>Clase:</strong> ${clase}</p>
          <p><strong>Tema:</strong> ${tema}</p>
          <p><strong>Alumno:</strong> ${alumno}</p>
          <p><strong>Token ID:</strong> ${tokenId}</p>
        </div>
      `;
      contenedor.appendChild(card);
    }
  } catch (error) {
    console.error("Error al cargar NFTs:", error);
    contenedor.innerHTML = "❌ Error al cargar NFTs. Verifica la consola para más detalles.";
  }
}
