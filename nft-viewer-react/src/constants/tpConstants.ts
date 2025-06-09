// constants/tpConstants.ts

// 🎯 Contrato NFT TP en Sepolia
export const TP_CONTRACT_ADDRESS = "0x3ae047900d3BB2E38F209eD59E970838d2EA479C";

// 🔑 ABI completo del contrato NFTTP
export const TP_CONTRACT_ABI = [
  // Constructor y eventos
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "student",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "studentName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "completionDate",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256[10]",
        "name": "unqTokenIds",
        "type": "uint256[10]"
      }
    ],
    "name": "CertificateMinted",
    "type": "event"
  },
  
  // Función principal de mint
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "studentName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "completionDate",
        "type": "string"
      },
      {
        "internalType": "uint256[10]",
        "name": "unqTokenIds",
        "type": "uint256[10]"
      }
    ],
    "name": "mintCertificate",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  
  // Funciones de lectura
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getCertificate",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "studentName",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "completionDate",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "studentWallet",
            "type": "address"
          },
          {
            "internalType": "uint256[10]",
            "name": "unqTokenIds",
            "type": "uint256[10]"
          },
          {
            "internalType": "uint256",
            "name": "mintTimestamp",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "exists",
            "type": "bool"
          }
        ],
        "internalType": "struct NFTTP.CertificateData",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "wallet",
        "type": "address"
      }
    ],
    "name": "isAuthorizedWallet",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "uri",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  
  // Función admin
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "wallet",
        "type": "address"
      }
    ],
    "name": "addAuthorizedWallet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// 🏷️ Tipos TypeScript
export interface MintTPRequest {
  recipientAddress: string;
  studentName: string;
  unqTokenIds: number[];
  customDate?: string; // ✅ Fecha opcional
}

export interface CertificateInfo {
  tokenId: number;
  studentName: string;
  completionDate: string;
  studentWallet: string;
  unqTokenIds: number[];
  mintTimestamp: number;
  exists: boolean;
  mintDate: string; // Fecha formateada YYYY-MM-DD
}