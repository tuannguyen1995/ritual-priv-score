// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "lib/openzeppelin-contracts/contracts/access/Ownable.sol";

contract RitualPrivScore is ERC721, Ownable {
    uint256 private _nextTokenId;
    
    // Mapping from user to their credit score
    mapping(address => uint256) public creditScores;
    
    // Mapping from user to token ID if they have a soulbound certificate
    mapping(address => uint256) public soulboundCertificates;
    
    // Score threshold to mint a certificate
    uint256 public constant SCORE_THRESHOLD = 700;
    
    event ScoreUpdated(address indexed user, uint256 oldScore, uint256 newScore);
    event CertificateMinted(address indexed user, uint256 tokenId);

    constructor() ERC721("RitualPrivScore Certificate", "RPSC") Ownable(msg.sender) {}

    /**
     * @dev Only the agent or owner can update the score. 
     * In a production environment, this should be restricted to the specific TEE agent contract.
     */
    function updateScore(address user, uint256 newScore) external onlyOwner {
        uint256 oldScore = creditScores[user];
        creditScores[user] = newScore;
        emit ScoreUpdated(user, oldScore, newScore);
        
        // Mint soulbound certificate if threshold is reached and they don't have one
        if (newScore >= SCORE_THRESHOLD && soulboundCertificates[user] == 0) {
            _mintCertificate(user);
        }
    }
    
    function _mintCertificate(address user) internal {
        _nextTokenId++;
        uint256 tokenId = _nextTokenId;
        _safeMint(user, tokenId);
        soulboundCertificates[user] = tokenId;
        emit CertificateMinted(user, tokenId);
    }

    /**
     * @dev Soulbound token - override transfer functions to revert
     */
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("RitualPrivScore: Soulbound certificates are non-transferable");
        }
        return super._update(to, tokenId, auth);
    }
}
