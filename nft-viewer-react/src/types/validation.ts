import type { MintResult } from '../services/mintTPService';

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

export interface ValidationBadgeProps {
  isValid: boolean;
  text: string;
  ariaLabel: string;
}

// ✅ Props actualizados con mint states
export interface ValidationPanelProps {
  validationResult: ValidationResult | null;
  nftsCount: number;
  onMintTP: () => void;
  isMinting?: boolean;
  mintResult?: MintResult | null;
  mintError?: string | null;
}