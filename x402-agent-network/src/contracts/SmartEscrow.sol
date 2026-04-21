// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * SmartEscrow - Conditional Payment Engine for Agent Economy
 * 
 * Enables autonomous agents to:
 * - Deposit funds conditionally
 * - Release payments on milestone completion
 * - Handle disputes with timeout arbitration
 * - Execute complex payment conditions programmatically
 */

contract SmartEscrow is ReentrancyGuard {
    
    // USDC token address (Solana USDC bridge or native)
    address public USDC;
    
    enum EscrowState {
        CREATED,      // Waiting for service agent acceptance
        ACTIVE,       // Service in progress
        COMPLETED,    // Service completed, awaiting confirmation
        DISPUTED,     // Payment disputed
        RESOLVED,     // Dispute resolved
        REFUNDED      // Refund issued
    }
    
    enum DisputeResolution {
        REFUND_BUYER,
        PAY_SELLER,
        SPLIT_PAYMENT
    }
    
    struct Milestone {
        uint256 index;
        string description;
        uint256 paymentAmountUSDC;
        string completionCriteria; // Hash of expected result
        bool completed;
        uint256 completedAt;
    }
    
    struct EscrowAgreement {
        uint256 escrowId;
        address buyerAgent;      // Requesting agent (vehicle)
        address sellerAgent;     // Service provider (mechanic)
        uint256 totalAmountUSDC;
        
        // Milestones
        Milestone[] milestones;
        uint256 completedMilestones;
        
        // Timeline
        uint256 createdAt;
        uint256 deadline;        // When service must complete
        uint256 disputeTimeout;  // How long to resolve dispute
        
        // State
        EscrowState state;
        string serviceType;      // 'tune-up', 'data-feed', etc.
        
        // Dispute
        bool disputed;
        address disputeInitiator;
        string disputeReason;
        DisputeResolution resolution;
        
        // Payments
        uint256 totalPaidToSeller;
    }
    
    struct NegotiatedTerms {
        uint256 escrowId;
        uint256 priceUSDC;
        uint256 maxTimelineMinutes;
        uint256 milestonesCount;
        bool autoRelease; // Auto-release on completion signal
    }
    
    // Registry
    mapping(uint256 => EscrowAgreement) public escrows;
    mapping(address => uint256[]) public agentEscrows;
    uint256 public nextEscrowId = 1;
    
    // Admin
    address public arbitrator;
    uint256 public arbitrationFee = 100; // 0.01 USDC
    
    // Events
    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        uint256 deadline
    );
    
    event EscrowAccepted(uint256 indexed escrowId, address indexed seller);
    
    event MilestoneCompleted(
        uint256 indexed escrowId,
        uint256 milestoneIndex,
        uint256 paymentReleased
    );
    
    event DisputeInitiated(
        uint256 indexed escrowId,
        address indexed initiator,
        string reason
    );
    
    event DisputeResolved(
        uint256 indexed escrowId,
        DisputeResolution resolution
    );
    
    event EscrowRefunded(uint256 indexed escrowId, uint256 amount);
    
    event PaymentReleased(
        uint256 indexed escrowId,
        address indexed recipient,
        uint256 amount
    );
    
    modifier onlyBuyer(uint256 _escrowId) {
        require(msg.sender == escrows[_escrowId].buyerAgent, "Not buyer agent");
        _;
    }
    
    modifier onlySeller(uint256 _escrowId) {
        require(msg.sender == escrows[_escrowId].sellerAgent, "Not seller agent");
        _;
    }
    
    modifier onlyArbitrator() {
        require(msg.sender == arbitrator, "Not arbitrator");
        _;
    }
    
    modifier escrowExists(uint256 _escrowId) {
        require(_escrowId < nextEscrowId, "Escrow does not exist");
        _;
    }
    
    constructor(address _usdc, address _arbitrator) {
        USDC = _usdc;
        arbitrator = _arbitrator;
    }
    
    // ===== ESCROW CREATION =====
    
    /**
     * Buyer agent creates escrow with milestone-based payment
     * 
     * Example:
     * Buyer: Vehicle wants tune-up
     * Seller: Mechanic offers service
     * Milestones:
     *   1. Inspection (20% of cost)
     *   2. Parts replacement (50% of cost)
     *   3. Testing & delivery (30% of cost)
     */
    function createEscrow(
        address _sellerAgent,
        uint256 _totalAmountUSDC,
        string memory _serviceType,
        uint256 _deadlineMinutes,
        string[] memory _milestoneCriteria,
        uint256[] memory _milestonePayments
    ) external nonReentrant returns (uint256) {
        require(_sellerAgent != address(0), "Invalid seller");
        require(_totalAmountUSDC > 0, "Amount must be > 0");
        require(_milestoneCriteria.length == _milestonePayments.length, "Mismatch");
        
        // Verify total of milestones equals escrow amount
        uint256 totalMilestones = 0;
        for (uint i = 0; i < _milestonePayments.length; i++) {
            totalMilestones += _milestonePayments[i];
        }
        require(totalMilestones == _totalAmountUSDC, "Milestone sum mismatch");
        
        // Transfer USDC from buyer to this contract
        IERC20(USDC).transferFrom(msg.sender, address(this), _totalAmountUSDC);
        
        uint256 escrowId = nextEscrowId++;
        EscrowAgreement storage escrow = escrows[escrowId];
        
        escrow.escrowId = escrowId;
        escrow.buyerAgent = msg.sender;
        escrow.sellerAgent = _sellerAgent;
        escrow.totalAmountUSDC = _totalAmountUSDC;
        escrow.serviceType = _serviceType;
        escrow.createdAt = block.timestamp;
        escrow.deadline = block.timestamp + (_deadlineMinutes * 60);
        escrow.disputeTimeout = 24 hours;
        escrow.state = EscrowState.CREATED;
        
        // Create milestones
        for (uint i = 0; i < _milestoneCriteria.length; i++) {
            escrow.milestones.push(Milestone({
                index: i,
                description: _milestoneCriteria[i],
                paymentAmountUSDC: _milestonePayments[i],
                completionCriteria: _milestoneCriteria[i],
                completed: false,
                completedAt: 0
            }));
        }
        
        agentEscrows[msg.sender].push(escrowId);
        agentEscrows[_sellerAgent].push(escrowId);
        
        emit EscrowCreated(
            escrowId,
            msg.sender,
            _sellerAgent,
            _totalAmountUSDC,
            escrow.deadline
        );
        
        return escrowId;
    }
    
    /**
     * Seller agent accepts escrow and begins work
     */
    function acceptEscrow(uint256 _escrowId) external onlySeller(_escrowId) escrowExists(_escrowId) {
        EscrowAgreement storage escrow = escrows[_escrowId];
        require(escrow.state == EscrowState.CREATED, "Invalid state");
        require(block.timestamp < escrow.deadline, "Deadline passed");
        
        escrow.state = EscrowState.ACTIVE;
        emit EscrowAccepted(_escrowId, msg.sender);
    }
    
    // ===== MILESTONE COMPLETION =====
    
    /**
     * Seller agent signals milestone completion
     * Buyer agent verifies and releases payment
     */
    function completeMilestone(
        uint256 _escrowId,
        uint256 _milestoneIndex,
        string memory _resultHash // IPFS hash or data hash
    ) external onlySeller(_escrowId) escrowExists(_escrowId) nonReentrant {
        EscrowAgreement storage escrow = escrows[_escrowId];
        require(escrow.state == EscrowState.ACTIVE, "Not active");
        require(_milestoneIndex < escrow.milestones.length, "Invalid milestone");
        
        Milestone storage milestone = escrow.milestones[_milestoneIndex];
        require(!milestone.completed, "Already completed");
        require(block.timestamp < escrow.deadline, "Deadline passed");
        
        milestone.completed = true;
        milestone.completedAt = block.timestamp;
        
        // In production: verify _resultHash matches completionCriteria
        // For now: assume seller is honest (can add oracle verification)
        
        escrow.completedMilestones++;
        
        // Release payment
        uint256 paymentAmount = milestone.paymentAmountUSDC;
        IERC20(USDC).transfer(escrow.sellerAgent, paymentAmount);
        escrow.totalPaidToSeller += paymentAmount;
        
        emit MilestoneCompleted(_escrowId, _milestoneIndex, paymentAmount);
        emit PaymentReleased(_escrowId, escrow.sellerAgent, paymentAmount);
        
        // If all milestones completed, mark escrow as completed
        if (escrow.completedMilestones == escrow.milestones.length) {
            escrow.state = EscrowState.COMPLETED;
        }
    }
    
    /**
     * Buyer agent verifies all work and closes escrow
     */
    function completeEscrow(uint256 _escrowId) external onlyBuyer(_escrowId) escrowExists(_escrowId) {
        EscrowAgreement storage escrow = escrows[_escrowId];
        require(escrow.state == EscrowState.COMPLETED, "Not ready");
        require(escrow.completedMilestones == escrow.milestones.length, "Incomplete");
        
        escrow.state = EscrowState.RESOLVED;
    }
    
    // ===== DISPUTE HANDLING =====
    
    /**
     * Either party can initiate dispute within deadline
     */
    function initializeDispute(
        uint256 _escrowId,
        string memory _reason
    ) external escrowExists(_escrowId) nonReentrant {
        EscrowAgreement storage escrow = escrows[_escrowId];
        require(
            msg.sender == escrow.buyerAgent || msg.sender == escrow.sellerAgent,
            "Not party to escrow"
        );
        require(block.timestamp < escrow.deadline + escrow.disputeTimeout, "Dispute window closed");
        require(!escrow.disputed, "Already disputed");
        
        escrow.disputed = true;
        escrow.disputeInitiator = msg.sender;
        escrow.disputeReason = _reason;
        escrow.state = EscrowState.DISPUTED;
        
        emit DisputeInitiated(_escrowId, msg.sender, _reason);
    }
    
    /**
     * Arbitrator resolves dispute
     */
    function resolveDispute(
        uint256 _escrowId,
        DisputeResolution _resolution,
        uint256 _buyerAmount,
        uint256 _sellerAmount
    ) external onlyArbitrator escrowExists(_escrowId) nonReentrant {
        EscrowAgreement storage escrow = escrows[_escrowId];
        require(escrow.disputed, "Not disputed");
        require(escrow.state == EscrowState.DISPUTED, "Invalid state");
        require(_buyerAmount + _sellerAmount <= escrow.totalAmountUSDC, "Invalid split");
        
        escrow.resolution = _resolution;
        escrow.state = EscrowState.RESOLVED;
        
        // Execute resolution
        if (_resolution == DisputeResolution.REFUND_BUYER) {
            // Return remaining funds to buyer
            uint256 refundAmount = escrow.totalAmountUSDC - escrow.totalPaidToSeller;
            if (refundAmount > 0) {
                IERC20(USDC).transfer(escrow.buyerAgent, refundAmount);
                emit EscrowRefunded(_escrowId, refundAmount);
            }
        } else if (_resolution == DisputeResolution.PAY_SELLER) {
            // Pay remaining to seller
            uint256 remainingAmount = escrow.totalAmountUSDC - escrow.totalPaidToSeller;
            if (remainingAmount > 0) {
                IERC20(USDC).transfer(escrow.sellerAgent, remainingAmount);
                emit PaymentReleased(_escrowId, escrow.sellerAgent, remainingAmount);
            }
        } else if (_resolution == DisputeResolution.SPLIT_PAYMENT) {
            // Custom split
            if (_buyerAmount > 0) {
                IERC20(USDC).transfer(escrow.buyerAgent, _buyerAmount);
            }
            if (_sellerAmount > 0 && _sellerAmount > escrow.totalPaidToSeller) {
                uint256 additionalPayment = _sellerAmount - escrow.totalPaidToSeller;
                IERC20(USDC).transfer(escrow.sellerAgent, additionalPayment);
            }
        }
        
        emit DisputeResolved(_escrowId, _resolution);
    }
    
    // ===== TIMEOUT HANDLING =====
    
    /**
     * If deadline passes and work incomplete, buyer can request refund
     */
    function requestTimeoutRefund(uint256 _escrowId) external onlyBuyer(_escrowId) escrowExists(_escrowId) nonReentrant {
        EscrowAgreement storage escrow = escrows[_escrowId];
        require(block.timestamp > escrow.deadline, "Deadline not passed");
        require(escrow.state == EscrowState.ACTIVE, "Not active");
        
        // Refund remaining amount
        uint256 refundAmount = escrow.totalAmountUSDC - escrow.totalPaidToSeller;
        if (refundAmount > 0) {
            IERC20(USDC).transfer(escrow.buyerAgent, refundAmount);
            emit EscrowRefunded(_escrowId, refundAmount);
        }
        
        escrow.state = EscrowState.REFUNDED;
    }
    
    // ===== QUERIES =====
    
    function getEscrow(uint256 _escrowId) external view returns (EscrowAgreement memory) {
        return escrows[_escrowId];
    }
    
    function getMilestones(uint256 _escrowId) external view returns (Milestone[] memory) {
        return escrows[_escrowId].milestones;
    }
    
    function getAgentEscrows(address _agent) external view returns (uint256[] memory) {
        return agentEscrows[_agent];
    }
    
    function getRemainingBalance(uint256 _escrowId) external view returns (uint256) {
        return escrows[_escrowId].totalAmountUSDC - escrows[_escrowId].totalPaidToSeller;
    }
}
