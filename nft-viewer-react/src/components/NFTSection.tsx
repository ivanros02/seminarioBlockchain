import NFTList from './NFTList';

interface NFTSectionProps {
  nfts: any[];
}

export const NFTSection = ({ nfts }: NFTSectionProps) => (
  <section aria-labelledby="nft-list-title">
    <h2 id="nft-list-title" className="sr-only">
      Lista de NFTs encontrados
    </h2>
    <NFTList nfts={nfts} />
  </section>
);