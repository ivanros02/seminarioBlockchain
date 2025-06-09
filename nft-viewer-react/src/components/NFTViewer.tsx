import { useMemo, useState, useEffect } from 'react';
import { useWalletConnection } from '../hooks/useWalletConnection';
import { ValidationPanel } from './ValidationPanel';
import { WalletStatus } from './WalletStatus';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { NFTSection } from './NFTSection';
import { CertificateViewer } from './CertificateViewer';
import { ProfessorView } from './ProfessorView'; // ✅ Nuevo import
import { ProfessorService } from '../services/professorService'; // ✅ Nuevo import
import '../styles/home.css';

export default function NFTViewer() {
  // ✅ Estado para mostrar/ocultar el visualizador
  const [showViewer, setShowViewer] = useState(false);
  const [isProfessor, setIsProfessor] = useState(false); // ✅ Estado para profesor
  
  const {
    walletAddress,
    nfts,
    loading,
    error,
    validationResult,
    conectarWallet,
    handleMintTP,
    // ✅ Nuevos estados de mint
    isMinting,
    mintResults,
    mintError
  } = useWalletConnection();

  // 🎨 Estados computados
  const computedStates = useMemo(() => ({
    isWalletConnected: Boolean(walletAddress),
    hasNFTs: nfts.length > 0,
    shouldShowNFTList: !loading && nfts.length > 0
  }), [walletAddress, nfts.length, loading]);

  // ✅ Detectar si es profesor cuando se conecta wallet
  useEffect(() => {
    if (walletAddress) {
      const isProf = ProfessorService.isProfessorWallet(walletAddress);
      setIsProfessor(isProf);
      
      // Si es profesor, no mostrar el visualizador por defecto
      if (isProf) {
        setShowViewer(false);
      }
    } else {
      setIsProfessor(false);
      setShowViewer(false);
    }
  }, [walletAddress]);

  return (
    <div className="viewer-container">
      <div className="content-wrapper">
        <main className="text-center mb-4" role="main">
          {/* 🎯 Header */}
          <header className="mb-3">
            <h1 className="main-title">🎓 Visualizador de NFTs UNQ</h1>
            
            {/* ✅ Botón para toggle del visualizador */}
            <button
              className="toggle-viewer-btn"
              onClick={() => setShowViewer(!showViewer)}
              type="button"
            >
              {showViewer ? '🔙 Volver a Validación' : '🔍 Ver Certificados TP'}
            </button>
          </header>

          {/* ✅ Condicional: Vista de profesor, visualizador, o validación */}
          {isProfessor ? (
            <ProfessorView walletAddress={walletAddress} />
          ) : showViewer ? (
            <CertificateViewer />
          ) : (
            <>
              {/* 🔘 Botón principal */}
              <button
                className="view-btn p-2"
                onClick={conectarWallet}
                disabled={loading || isMinting}
                type="button"
                aria-describedby={loading ? "loading-status" : undefined}
              >
                {loading ? "CONECTANDO..." : "CONECTAR WALLET"}
              </button>

              {/* 🔗 Sección de wallet conectada */}
              {computedStates.isWalletConnected && (
                <section className="mt-3" aria-labelledby="wallet-section">
                  <h2 id="wallet-section" className="sr-only">
                    Estado de la wallet y validación
                  </h2>

                  <WalletStatus walletAddress={walletAddress} />
                  
                  {/* ✅ Pasar nuevos props de mint */}
                  <ValidationPanel
                    validationResult={validationResult}
                    nftsCount={nfts.length}
                    onMintTP={handleMintTP}
                    isMinting={isMinting}
                    mintResults={mintResults}
                    mintError={mintError}
                  />
                </section>
              )}

              {/* 🔄 Estados de carga y error */}
              {loading && <LoadingState />}
              {error && <ErrorState error={error} />}

              {/* 📦 Lista de NFTs */}
              {computedStates.shouldShowNFTList && <NFTSection nfts={nfts} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}