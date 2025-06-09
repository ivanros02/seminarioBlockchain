interface WalletStatusProps {
  walletAddress: string;
}

export const WalletStatus = ({ walletAddress }: WalletStatusProps) => (
  <p className="wallet" role="status">
    <span className="wallet-label">Conectado:</span>
    <span className="wallet-address">{walletAddress}</span>
  </p>
);

// 📁 components/LoadingState.tsx
export const LoadingState = () => (
  <p
    id="loading-status"
    className="loading-text"
    role="status"
    aria-live="polite"
  >
    🔄 Cargando y validando NFTs...
  </p>
);