import type { NFT } from "../types/NFT";
import "../styles/nft.css";
export default function NFTCard({ nft }: { nft: NFT }) {
    return (
        <div className="ethereum-nft-card">
            <div className="card-glow"></div>
            <div className="card-content">
                <div className="image-container">
                    {nft.image ? (
                        <img
                            src={nft.image}
                            alt={nft.name}
                            onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                    ) : (
                        <div className="placeholder-image">
                            <div className="eth-icon">⟠</div>
                        </div>
                    )}
                    <div className="overlay">
                        <div className="token-id">#{nft.tokenId}</div>
                    </div>
                </div>

                <div className="card-body">
                    <h3 className="nft-title">{nft.name}</h3>
                    <p className="nft-description">{nft.description}</p>

                    <div className="metadata-grid">
                        <div className="metadata-item">
                            <span className="label">Clase</span>
                            <span className="value">{nft.clase}</span>
                        </div>
                        <div className="metadata-item">
                            <span className="label">Tema</span>
                            <span className="value">{nft.tema}</span>
                        </div>
                        <div className="metadata-item">
                            <span className="label">Alumno</span>
                            <span className="value">{nft.alumno}</span>
                        </div>
                    </div>

                    <div className="card-footer">
                        <div className="eth-price">
                            <span className="eth-symbol">⟠</span>
                            <span>Ethereum NFT</span>
                        </div>
                        <button className="view-btn">Ver Detalles</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
