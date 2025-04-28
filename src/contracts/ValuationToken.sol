// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ValuationToken is ERC721, AccessControl {
    using Counters for Counters.Counter;
    
    bytes32 public constant VALUATOR_ROLE = keccak256("VALUATOR_ROLE");
    bytes32 public constant AI_ROLE = keccak256("AI_ROLE");
    
    Counters.Counter private _tokenIds;
    
    uint256 public constant COMMISSION_RATE = 1000; // 10% in basis points
    address public treasury;

    struct Valuation {
        uint256 propertyTokenId;  // Reference to the PropertyNFT
        uint256 value;           // Value in USD cents
        uint256 timestamp;
        address valuator;
        bool isOfficial;         // true for official valuations, false for AI
        string metadataURI;      // IPFS hash of detailed valuation report
    }

    // Mapping from token ID to Valuation
    mapping(uint256 => Valuation) public valuations;
    
    // Mapping from property ID to its valuation history
    mapping(uint256 => uint256[]) public propertyValuations;
    
    // Mapping for valuator statistics
    mapping(address => uint256) public valuatorCompletedJobs;
    mapping(address => uint256) public valuatorTotalEarnings;

    event ValuationCreated(
        uint256 indexed tokenId,
        uint256 indexed propertyTokenId,
        uint256 value,
        address valuator,
        bool isOfficial
    );

    event CommissionPaid(
        uint256 indexed tokenId,
        uint256 amount,
        address valuator
    );

    constructor(address _treasury) ERC721("MapChain Valuation", "MCV") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        treasury = _treasury;
    }

    function createValuation(
        uint256 propertyTokenId,
        uint256 value,
        string memory metadataURI,
        bool isOfficial
    ) external returns (uint256) {
        require(
            hasRole(VALUATOR_ROLE, msg.sender) || hasRole(AI_ROLE, msg.sender),
            "Caller is not authorized"
        );
        
        if (isOfficial) {
            require(hasRole(VALUATOR_ROLE, msg.sender), "Not a certified valuator");
        } else {
            require(hasRole(AI_ROLE, msg.sender), "Not the AI service");
        }

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        valuations[newTokenId] = Valuation({
            propertyTokenId: propertyTokenId,
            value: value,
            timestamp: block.timestamp,
            valuator: msg.sender,
            isOfficial: isOfficial,
            metadataURI: metadataURI
        });

        propertyValuations[propertyTokenId].push(newTokenId);

        if (isOfficial) {
            // Calculate and transfer commission
            uint256 commission = (value * COMMISSION_RATE) / 10000;
            uint256 valuatorPayment = value - commission;
            
            // Update valuator statistics
            valuatorCompletedJobs[msg.sender]++;
            valuatorTotalEarnings[msg.sender] += valuatorPayment;

            emit CommissionPaid(newTokenId, commission, msg.sender);
        }

        _safeMint(msg.sender, newTokenId);
        
        emit ValuationCreated(
            newTokenId,
            propertyTokenId,
            value,
            msg.sender,
            isOfficial
        );

        return newTokenId;
    }

    function getPropertyValuations(uint256 propertyTokenId) 
        external 
        view 
        returns (Valuation[] memory) 
    {
        uint256[] memory tokenIds = propertyValuations[propertyTokenId];
        Valuation[] memory result = new Valuation[](tokenIds.length);
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            result[i] = valuations[tokenIds[i]];
        }
        
        return result;
    }

    function getLatestValuation(uint256 propertyTokenId, bool officialOnly) 
        external 
        view 
        returns (Valuation memory) 
    {
        uint256[] memory tokenIds = propertyValuations[propertyTokenId];
        require(tokenIds.length > 0, "No valuations found");
        
        for (uint256 i = tokenIds.length; i > 0; i--) {
            Valuation memory val = valuations[tokenIds[i-1]];
            if (!officialOnly || val.isOfficial) {
                return val;
            }
        }
        
        revert("No matching valuation found");
    }

    function getValuatorStats(address valuator) 
        external 
        view 
        returns (uint256 completedJobs, uint256 totalEarnings) 
    {
        return (
            valuatorCompletedJobs[valuator],
            valuatorTotalEarnings[valuator]
        );
    }

    // Required override
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
