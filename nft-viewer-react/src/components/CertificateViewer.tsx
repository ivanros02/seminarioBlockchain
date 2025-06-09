import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { MintTPService } from '../services/mintTPService';
import type { CertificateInfo } from '../constants/tpConstants';

export const CertificateViewer = () => {
  const [txHash, setTxHash] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<CertificateInfo | null>(null);
  const [viewMode, setViewMode] = useState<'tx' | 'token'>('tx');

  const handleViewByTransaction = useCallback(async () => {
    if (!txHash.trim()) {
      toast.error('Ingresa un hash de transacción válido');
      return;
    }

    setLoading(true);
    try {
      const cert = await MintTPService.getCertificateFromTransaction(txHash.trim());
      if (cert) {
        setCertificate(cert);
        toast.success('¡Certificado encontrado!');
      } else {
        toast.error('No se encontró certificado en esta transacción');
        setCertificate(null);
      }
    } catch (error) {
      toast.error('Error buscando certificado');
      setCertificate(null);
    } finally {
      setLoading(false);
    }
  }, [txHash]);

  const handleViewByTokenId = useCallback(async () => {
    const id = parseInt(tokenId.trim());
    if (isNaN(id) || id <= 0) {
      toast.error('Ingresa un Token ID válido');
      return;
    }

    setLoading(true);
    try {
      const cert = await MintTPService.getCertificateByTokenId(id);
      if (cert) {
        setCertificate(cert);
        toast.success('¡Certificado encontrado!');
      } else {
        toast.error('No se encontró certificado con este Token ID');
        setCertificate(null);
      }
    } catch (error) {
      toast.error('Error buscando certificado');
      setCertificate(null);
    } finally {
      setLoading(false);
    }
  }, [tokenId]);

  const handleReset = useCallback(() => {
    setTxHash('');
    setTokenId('');
    setCertificate(null);
  }, []);

  return (
    <div className="certificate-viewer">
      <div className="viewer-header">
        <h2 className="viewer-title">🔍 Visualizador de Certificados TP</h2>
        <p className="viewer-description">
          Busca y visualiza los datos de NFTs TP minteados
        </p>
      </div>

      {/* Selector de modo */}
      <div className="view-mode-selector">
        <button
          className={`mode-btn ${viewMode === 'tx' ? 'active' : ''}`}
          onClick={() => setViewMode('tx')}
        >
          Por Transacción
        </button>
        <button
          className={`mode-btn ${viewMode === 'token' ? 'active' : ''}`}
          onClick={() => setViewMode('token')}
        >
          Por Token ID
        </button>
      </div>

      {/* Formularios de búsqueda */}
      <div className="search-section">
        {viewMode === 'tx' ? (
          <div className="search-form">
            <label htmlFor="tx-hash">Hash de Transacción:</label>
            <input
              id="tx-hash"
              type="text"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="0x1078516f99a42b8a6446f50a9e784208b81b4ae79744b4bd8a4b971dc2ce4329"
              className="search-input"
            />
            <button
              onClick={handleViewByTransaction}
              disabled={loading || !txHash.trim()}
              className="search-btn"
            >
              {loading ? '🔍 Buscando...' : '🔍 Buscar'}
            </button>
          </div>
        ) : (
          <div className="search-form">
            <label htmlFor="token-id">Token ID:</label>
            <input
              id="token-id"
              type="number"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              placeholder="1"
              className="search-input"
              min="1"
            />
            <button
              onClick={handleViewByTokenId}
              disabled={loading || !tokenId.trim()}
              className="search-btn"
            >
              {loading ? '🔍 Buscando...' : '🔍 Buscar'}
            </button>
          </div>
        )}

        <button onClick={handleReset} className="reset-btn">
          🔄 Limpiar
        </button>
      </div>

      {/* Resultado del certificado */}
      {certificate && (
        <div className="certificate-result">
          <div className="result-header">
            <h3>📋 Certificado NFT TP</h3>
            <span className="token-id-badge">Token ID: {certificate.tokenId}</span>
          </div>

          <div className="certificate-data">
            <div className="data-row">
              <span className="data-label">👤 Estudiante:</span>
              <span className="data-value">{certificate.studentName}</span>
            </div>

            <div className="data-row">
              <span className="data-label">📅 Fecha Finalización:</span>
              <span className="data-value">{certificate.completionDate}</span>
            </div>

            <div className="data-row">
              <span className="data-label">💼 Wallet:</span>
              <span className="data-value mono">
                {certificate.studentWallet.slice(0, 8)}...{certificate.studentWallet.slice(-6)}
              </span>
            </div>

            <div className="data-row">
              <span className="data-label">🕐 Minteado:</span>
              <span className="data-value">{certificate.mintDate}</span>
            </div>

            <div className="unq-nfts-section">
              <h4 className="section-title">📦 NFTs UNQ Embedded (10):</h4>
              <div className="unq-nfts-grid">
                {certificate.unqTokenIds.map((id, index) => (
                  <span key={index} className="unq-nft-id">
                    #{id}
                  </span>
                ))}
              </div>
            </div>

            <div className="blockchain-info">
              <p className="info-text">
                ✅ Datos verificados en blockchain Sepolia
              </p>
              <a
                href={`https://sepolia.etherscan.io/address/${certificate.studentWallet}`}
                target="_blank"
                rel="noopener noreferrer"
                className="etherscan-link"
              >
                🔗 Ver wallet en Etherscan
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};