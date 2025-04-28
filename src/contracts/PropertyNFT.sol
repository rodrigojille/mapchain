// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract PropertyNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Mapping from token ID to property valuation history
    mapping(uint256 => Valuation[]) private _valuationHistory;

    struct Valuation {
        uint256 amount;
        string currency;
        uint256 timestamp;
        address validator;
    }

    event PropertyMinted(uint256 indexed tokenId, address indexed owner, string uri);
    event ValuationAdded(uint256 indexed tokenId, uint256 amount, string currency, address validator);

    constructor() ERC721("MapChain Property", "MCP") {}

    function mintProperty(address to, string memory uri) public returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, uri);

        emit PropertyMinted(newTokenId, to, uri);
        return newTokenId;
    }

    function addValuation(
        uint256 tokenId,
        uint256 amount,
        string memory currency,
        address validator
    ) public {
        require(_exists(tokenId), "Property does not exist");
        require(validator != address(0), "Invalid validator address");

        Valuation memory newValuation = Valuation({
            amount: amount,
            currency: currency,
            timestamp: block.timestamp,
            validator: validator
        });

        _valuationHistory[tokenId].push(newValuation);
        emit ValuationAdded(tokenId, amount, currency, validator);
    }

    function getValuationHistory(uint256 tokenId) public view returns (Valuation[] memory) {
        require(_exists(tokenId), "Property does not exist");
        return _valuationHistory[tokenId];
    }

    function getLatestValuation(uint256 tokenId) public view returns (Valuation memory) {
        require(_exists(tokenId), "Property does not exist");
        require(_valuationHistory[tokenId].length > 0, "No valuations yet");
        
        return _valuationHistory[tokenId][_valuationHistory[tokenId].length - 1];
    }

    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
