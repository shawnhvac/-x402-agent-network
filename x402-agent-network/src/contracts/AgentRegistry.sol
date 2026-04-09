// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * AgentRegistry - On-Chain Agent Registration & Discovery
 * 
 * Allows autonomous agents to register, advertise services, and build reputation
 * Required for AI-to-AI autonomous payment economy
 */

contract AgentRegistry {
    
    struct Agent {
        address walletAddress;
        string name;
        string ipfsMetadata; // Links to detailed agent config
        uint256 reputation; // 0-100 score
        uint256 totalTransactions;
        uint256 successRate; // 0-100
        bool active;
        uint256 registeredAt;
    }
    
    struct Service {
        string serviceId;
        address agentAddress;
        string name;
        string description;
        uint256 basePriceUSDC;
        bool active;
    }
    
    struct Transaction {
        uint256 txId;
        address initiatorAgent;
        address serviceAgent;
        string serviceId;
        uint256 amountUSDC;
        uint256 timestamp;
        bool completed;
        bool successful;
    }
    
    // Registry mappings
    mapping(address => Agent) public agents;
    mapping(bytes32 => Service) public services; // keccak256(agentAddr, serviceId) => Service
    mapping(uint256 => Transaction) public transactions;
    mapping(address => uint256[]) public agentTransactions;
    
    // State
    address[] public registeredAgents;
    uint256 public nextTransactionId = 1;
    address public admin;
    
    // Events
    event AgentRegistered(address indexed agentAddress, string name);
    event AgentUpdated(address indexed agentAddress);
    event ServiceRegistered(address indexed agentAddress, string serviceId);
    event TransactionInitiated(uint256 indexed txId, address from, address to);
    event TransactionCompleted(uint256 indexed txId, bool successful);
    event ReputationUpdated(address indexed agent, uint256 newScore);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Admin only");
        _;
    }
    
    modifier onlyRegisteredAgent() {
        require(agents[msg.sender].active, "Not a registered agent");
        _;
    }
    
    constructor() {
        admin = msg.sender;
    }
    
    /**
     * Register a new autonomous agent
     */
    function registerAgent(
        string memory _name,
        string memory _ipfsMetadata
    ) external returns (bool) {
        require(agents[msg.sender].walletAddress == address(0), "Already registered");
        
        agents[msg.sender] = Agent({
            walletAddress: msg.sender,
            name: _name,
            ipfsMetadata: _ipfsMetadata,
            reputation: 50, // Start at 50/100
            totalTransactions: 0,
            successRate: 100,
            active: true,
            registeredAt: block.timestamp
        });
        
        registeredAgents.push(msg.sender);
        
        emit AgentRegistered(msg.sender, _name);
        return true;
    }
    
    /**
     * Update agent metadata
     */
    function updateAgent(string memory _ipfsMetadata) external onlyRegisteredAgent {
        agents[msg.sender].ipfsMetadata = _ipfsMetadata;
        emit AgentUpdated(msg.sender);
    }
    
    /**
     * Register a service offered by this agent
     */
    function registerService(
        string memory _serviceId,
        string memory _name,
        string memory _description,
        uint256 _basePriceUSDC
    ) external onlyRegisteredAgent {
        bytes32 serviceKey = keccak256(abi.encodePacked(msg.sender, _serviceId));
        
        services[serviceKey] = Service({
            serviceId: _serviceId,
            agentAddress: msg.sender,
            name: _name,
            description: _description,
            basePriceUSDC: _basePriceUSDC,
            active: true
        });
        
        emit ServiceRegistered(msg.sender, _serviceId);
    }
    
    /**
     * Initiate a transaction (agent calling another agent's service)
     */
    function initiateTransaction(
        address _serviceAgent,
        string memory _serviceId,
        uint256 _amountUSDC
    ) external onlyRegisteredAgent returns (uint256) {
        require(agents[_serviceAgent].active, "Service agent not registered");
        
        bytes32 serviceKey = keccak256(abi.encodePacked(_serviceAgent, _serviceId));
        require(services[serviceKey].active, "Service not found");
        
        uint256 txId = nextTransactionId++;
        
        transactions[txId] = Transaction({
            txId: txId,
            initiatorAgent: msg.sender,
            serviceAgent: _serviceAgent,
            serviceId: _serviceId,
            amountUSDC: _amountUSDC,
            timestamp: block.timestamp,
            completed: false,
            successful: false
        });
        
        agentTransactions[msg.sender].push(txId);
        agentTransactions[_serviceAgent].push(txId);
        
        emit TransactionInitiated(txId, msg.sender, _serviceAgent);
        return txId;
    }
    
    /**
     * Complete a transaction and update reputation
     */
    function completeTransaction(
        uint256 _txId,
        bool _successful
    ) external {
        Transaction storage tx = transactions[_txId];
        require(!tx.completed, "Transaction already completed");
        require(msg.sender == tx.serviceAgent || msg.sender == admin, "Unauthorized");
        
        tx.completed = true;
        tx.successful = _successful;
        
        // Update reputation
        if (_successful) {
            _updateReputation(tx.serviceAgent, true);
        } else {
            _updateReputation(tx.serviceAgent, false);
        }
        
        // Update transaction count
        agents[tx.serviceAgent].totalTransactions++;
        
        emit TransactionCompleted(_txId, _successful);
    }
    
    /**
     * Update agent reputation based on transaction success
     */
    function _updateReputation(address _agent, bool _success) internal {
        Agent storage agent = agents[_agent];
        
        if (_success) {
            // Increase reputation, cap at 100
            if (agent.reputation < 100) {
                agent.reputation = agent.reputation + 1;
            }
        } else {
            // Decrease reputation, floor at 10
            if (agent.reputation > 10) {
                agent.reputation = agent.reputation - 2;
            }
        }
        
        emit ReputationUpdated(_agent, agent.reputation);
    }
    
    // ===== QUERIES =====
    
    /**
     * Get agent info
     */
    function getAgent(address _address) external view returns (Agent memory) {
        return agents[_address];
    }
    
    /**
     * Get all registered agents
     */
    function getRegisteredAgents() external view returns (address[] memory) {
        return registeredAgents;
    }
    
    /**
     * Get agent's services
     */
    function getAgentService(
        address _agent,
        string memory _serviceId
    ) external view returns (Service memory) {
        bytes32 key = keccak256(abi.encodePacked(_agent, _serviceId));
        return services[key];
    }
    
    /**
     * Get transaction details
     */
    function getTransaction(uint256 _txId) external view returns (Transaction memory) {
        return transactions[_txId];
    }
    
    /**
     * Get agent's transaction history
     */
    function getAgentTransactionHistory(address _agent) external view returns (uint256[] memory) {
        return agentTransactions[_agent];
    }
}
