// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MiNFT is ERC721URIStorage, Ownable {
    uint256 public tokenCounter;

    constructor() ERC721("MiNFT", "MNFT") Ownable(msg.sender) {
        tokenCounter = 0;
    }

    // Sin onlyOwner
    function crearNFT(address destinatario, string memory tokenURI) public returns (uint256) {
        uint256 nuevoId = tokenCounter;
        _safeMint(destinatario, nuevoId);
        _setTokenURI(nuevoId, tokenURI);
        tokenCounter++;
        return nuevoId;
    }
}
