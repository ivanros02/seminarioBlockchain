export interface NFTValidationDetail {
    tokenId: number;
    noRetransfer: boolean;
    validMintDate: boolean;
    mintDate?: string;
    transferCount: number;
    mintCount: number;
    blockNumber?: number;
    errors: string[];
}

export interface ValidationResult {
    isValid: boolean;
    hasExactly10NFTs: boolean;
    allNFTsValid: boolean;
    validMintDates: boolean;
    invalidNFTs: string[];
    errors: string[];
    nftDetails?: NFTValidationDetail[];
}