export const ALCHEMY_API_KEY = "vCUWGeU9hwCz0bq7rSKV5Dk1Bf20KSYV";
export const ALCHEMY_BASE_URL = `https://eth-sepolia.g.alchemy.com/nft/v2/${ALCHEMY_API_KEY}`;
export const CONTRATO_ADDRESS = "0x1FEe62d24daA9fc0a18341B582937bE1D837F91d";

export const CONTRACT_ABI = [
  "function uri(uint256) view returns (string)",
  "function datosDeClases(uint256) view returns (uint256, string, address)"
];