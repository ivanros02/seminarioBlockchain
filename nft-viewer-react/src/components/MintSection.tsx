import { useState, useCallback } from 'react';
import type { MintResult } from '../services/mintTPService';

interface MintSectionProps {
  onMintTP: () => void;
  isMinting?: boolean;
  mintResults?: {
    pablo: MintResult | null;
    daniel: MintResult | null;
  };
  mintError?: string | null;
}

export const MintSection = ({ onMintTP, isMinting, mintResults, mintError }: MintSectionProps) => {
  const [showMintBtn, setShowMintBtn] = useState(false);

  const handleToggleMintBtn = useCallback(() => {
    setShowMintBtn(prev => !prev);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggleMintBtn();
    }
  }, [handleToggleMintBtn]);

  // ✅ Verificar si ambos mints fueron exitosos
  const pabloSuccess = mintResults?.pablo?.success;
  const danielSuccess = mintResults?.daniel?.success;
  const anySuccess = pabloSuccess || danielSuccess;
  const bothSuccess = pabloSuccess && danielSuccess;

  // ✅ Si hay algún mint exitoso, mostrar resultados
  if (anySuccess) {
    return (
      <div className="mint-success-container">
        <div className="mint-success-header">
          <span className="success-icon">🎉</span>
          <h3 className="success-title">
            {bothSuccess
              ? '¡NFTs TP Minteados Exitosamente para Ambos Profesores!'
              : '¡NFT TP Minteado Parcialmente!'
            }
          </h3>
        </div>

        <div className="mint-success-details">
          {/* Resultados para Pablo */}
          {pabloSuccess && mintResults?.pablo && (
            <div className="professor-result">
              <h4 className="professor-name">👨‍🏫 Profesor Pablo</h4>
              {mintResults.pablo.tokenId && (
                <p className="success-detail">
                  <strong>Token ID:</strong> {mintResults.pablo.tokenId}
                </p>
              )}
              {mintResults.pablo.transactionHash && (
                <p className="success-detail">
                  <strong>Hash:</strong> {mintResults.pablo.transactionHash.slice(0, 10)}...{mintResults.pablo.transactionHash.slice(-8)}
                </p>
              )}
              {mintResults.pablo.etherscanUrl && (
                <a
                  href={mintResults.pablo.etherscanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="etherscan-link"
                >
                  🔗 Ver en Etherscan (Pablo)
                </a>
              )}
            </div>
          )}

          {/* Resultados para Daniel */}
          {danielSuccess && mintResults?.daniel && (
            <div className="professor-result">
              <h4 className="professor-name">👨‍🏫 Profesor Daniel</h4>
              {mintResults.daniel.tokenId && (
                <p className="success-detail">
                  <strong>Token ID:</strong> {mintResults.daniel.tokenId}
                </p>
              )}
              {mintResults.daniel.transactionHash && (
                <p className="success-detail">
                  <strong>Hash:</strong> {mintResults.daniel.transactionHash.slice(0, 10)}...{mintResults.daniel.transactionHash.slice(-8)}
                </p>
              )}
              {mintResults.daniel.etherscanUrl && (
                <a
                  href={mintResults.daniel.etherscanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="etherscan-link"
                >
                  🔗 Ver en Etherscan (Daniel)
                </a>
              )}
            </div>
          )}

          {/* Mostrar errores si algún mint falló */}
          {!pabloSuccess && mintResults?.pablo && (
            <div className="professor-error">
              <h4 className="professor-name error">❌ Profesor Pablo</h4>
              <p className="error-detail">Error: {mintResults.pablo.error}</p>
            </div>
          )}

          {!danielSuccess && mintResults?.daniel && (
            <div className="professor-error">
              <h4 className="professor-name error">❌ Profesor Daniel</h4>
              <p className="error-detail">Error: {mintResults.daniel.error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="mint-info-container">
      <p
        id="mint-description"
        className="mint-info-text"
        onClick={handleToggleMintBtn}
        tabIndex={0}
        role="button"
        aria-pressed={showMintBtn}
        onKeyDown={handleKeyDown}
      >
        ✅ Todos los requisitos están cumplidos. Haz clic aquí para mintear tu NFT de trabajo práctico.
      </p>

      {showMintBtn && (
        <div className="mint-button-container">
          <button
            className="mint-tp-btn"
            onClick={onMintTP}
            type="button"
            disabled={isMinting}
            aria-describedby="mint-description"
          >
            {isMinting ? (
              <>
                <span className="loading-spinner">⏳</span>
                MINTEANDO...
              </>
            ) : (
              <>🎓 MINT NFT TP</>
            )}
          </button>

          {/* ✅ Mostrar error si existe */}
          {mintError && (
            <div className="mint-error">
              <span className="error-icon">❌</span>
              <span className="error-text">{mintError}</span>
            </div>
          )}

          {/* ✅ Mostrar estado de loading */}
          {isMinting && (
            <div className="mint-loading">
              <p>Por favor confirma la transacción en MetaMask...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};