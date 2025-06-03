import type { NFT } from "../types/NFT";
import NFTCard from "./NFTCard";

export default function NFTList({ nfts }: { nfts: NFT[] }) {
    return (
        <div className="container-fluid px-4">
            <div className="row g-5">
                {nfts.map((nft, index) => (
                    <div key={index} className="col-12 col-md-6 col-lg-4">
                        <NFTCard nft={nft} />
                    </div>
                ))}
            </div>
        </div>
    );
}
