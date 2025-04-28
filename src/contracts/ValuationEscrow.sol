// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ValuationEscrow is AccessControl, ReentrancyGuard {
    bytes32 public constant PLATFORM_ROLE = keccak256("PLATFORM_ROLE");
    
    uint256 public constant PLATFORM_FEE = 1000; // 10% in basis points
    uint256 public constant CANCELLATION_WINDOW = 24 hours;
    
    struct Escrow {
        address client;
        address valuator;
        uint256 amount;
        uint256 createdAt;
        uint256 completedAt;
        bool isUrgent;
        EscrowStatus status;
    }
    
    enum EscrowStatus {
        Created,
        Accepted,
        Completed,
        Cancelled,
        Disputed
    }
    
    mapping(uint256 => Escrow) public escrows; // requestId => Escrow
    mapping(address => uint256) public valuatorBalances;
    mapping(address => uint256) public platformBalance;
    
    event EscrowCreated(
        uint256 indexed requestId,
        address indexed client,
        uint256 amount,
        bool isUrgent
    );
    
    event EscrowAccepted(
        uint256 indexed requestId,
        address indexed valuator
    );
    
    event EscrowCompleted(
        uint256 indexed requestId,
        uint256 valuatorAmount,
        uint256 platformFee
    );
    
    event EscrowCancelled(
        uint256 indexed requestId,
        string reason
    );
    
    event DisputeRaised(
        uint256 indexed requestId,
        address indexed initiator,
        string reason
    );
    
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(PLATFORM_ROLE, msg.sender);
    }
    
    function createEscrow(
        uint256 requestId,
        address valuator,
        bool isUrgent
    ) external payable {
        require(msg.value > 0, "Payment required");
        require(escrows[requestId].client == address(0), "Escrow already exists");
        
        escrows[requestId] = Escrow({
            client: msg.sender,
            valuator: valuator,
            amount: msg.value,
            createdAt: block.timestamp,
            completedAt: 0,
            isUrgent: isUrgent,
            status: EscrowStatus.Created
        });
        
        emit EscrowCreated(requestId, msg.sender, msg.value, isUrgent);
    }
    
    function acceptEscrow(uint256 requestId) external {
        Escrow storage escrow = escrows[requestId];
        require(escrow.valuator == msg.sender, "Not assigned valuator");
        require(escrow.status == EscrowStatus.Created, "Invalid status");
        
        escrow.status = EscrowStatus.Accepted;
        emit EscrowAccepted(requestId, msg.sender);
    }
    
    function completeValuation(uint256 requestId) external {
        require(hasRole(PLATFORM_ROLE, msg.sender), "Not platform");
        
        Escrow storage escrow = escrows[requestId];
        require(escrow.status == EscrowStatus.Accepted, "Invalid status");
        
        uint256 platformFee = (escrow.amount * PLATFORM_FEE) / 10000;
        uint256 valuatorAmount = escrow.amount - platformFee;
        
        escrow.status = EscrowStatus.Completed;
        escrow.completedAt = block.timestamp;
        
        valuatorBalances[escrow.valuator] += valuatorAmount;
        platformBalance[address(this)] += platformFee;
        
        emit EscrowCompleted(requestId, valuatorAmount, platformFee);
    }
    
    function cancelEscrow(uint256 requestId, string memory reason) external {
        Escrow storage escrow = escrows[requestId];
        require(
            msg.sender == escrow.client || 
            msg.sender == escrow.valuator || 
            hasRole(PLATFORM_ROLE, msg.sender),
            "Not authorized"
        );
        
        if (msg.sender == escrow.client) {
            require(
                escrow.status == EscrowStatus.Created ||
                block.timestamp <= escrow.createdAt + CANCELLATION_WINDOW,
                "Past cancellation window"
            );
        }
        
        escrow.status = EscrowStatus.Cancelled;
        payable(escrow.client).transfer(escrow.amount);
        
        emit EscrowCancelled(requestId, reason);
    }
    
    function withdrawBalance() external nonReentrant {
        uint256 amount = valuatorBalances[msg.sender];
        require(amount > 0, "No balance to withdraw");
        
        valuatorBalances[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }
    
    function withdrawPlatformFees() external nonReentrant {
        require(hasRole(PLATFORM_ROLE, msg.sender), "Not platform");
        
        uint256 amount = platformBalance[address(this)];
        require(amount > 0, "No fees to withdraw");
        
        platformBalance[address(this)] = 0;
        payable(msg.sender).transfer(amount);
    }
    
    function raiseDispute(uint256 requestId, string memory reason) external {
        Escrow storage escrow = escrows[requestId];
        require(
            msg.sender == escrow.client || msg.sender == escrow.valuator,
            "Not a party to escrow"
        );
        require(
            escrow.status == EscrowStatus.Accepted ||
            escrow.status == EscrowStatus.Completed,
            "Invalid status for dispute"
        );
        
        escrow.status = EscrowStatus.Disputed;
        emit DisputeRaised(requestId, msg.sender, reason);
    }
    
    // Platform can resolve disputes and adjust payments
    function resolveDispute(
        uint256 requestId,
        uint256 clientRefund,
        uint256 valuatorPayment
    ) external {
        require(hasRole(PLATFORM_ROLE, msg.sender), "Not platform");
        
        Escrow storage escrow = escrows[requestId];
        require(escrow.status == EscrowStatus.Disputed, "Not disputed");
        require(
            clientRefund + valuatorPayment <= escrow.amount,
            "Invalid payment split"
        );
        
        if (clientRefund > 0) {
            payable(escrow.client).transfer(clientRefund);
        }
        
        if (valuatorPayment > 0) {
            valuatorBalances[escrow.valuator] += valuatorPayment;
        }
        
        // Remaining amount goes to platform
        uint256 platformFee = escrow.amount - clientRefund - valuatorPayment;
        if (platformFee > 0) {
            platformBalance[address(this)] += platformFee;
        }
        
        escrow.status = EscrowStatus.Completed;
        escrow.completedAt = block.timestamp;
    }
    
    receive() external payable {}
}
