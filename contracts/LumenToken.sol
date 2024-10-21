// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LumenToken {
    string public name = "Lumen";
    string public symbol = "LMN";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    address public owner;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => mapping(address => uint256)) public requests;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
    event Request(
        address indexed requester,
        address indexed from,
        uint256 value
    );
    event RequestApproved(
        address indexed from,
        address indexed to,
        uint256 value
    );
    event RequestDeclined(address indexed from, address indexed to);
    event Distribution(address indexed to, uint256 value);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    constructor(uint256 _initialSupply) {
        totalSupply = _initialSupply * (10 ** uint256(decimals));
        balanceOf[address(this)] = totalSupply; // Contract holds the total supply
        owner = msg.sender; // Set the contract owner
        emit Transfer(address(0), address(this), totalSupply); // Emit event for minting
    }

    // Function for requesting tokens from another address
    function requestTokens(
        address _from,
        uint256 _value
    ) public returns (bool success) {
        require(
            balanceOf[_from] >= _value,
            "Requested address has insufficient balance"
        );
        requests[_from][msg.sender] = _value; // Log the request
        emit Request(msg.sender, _from, _value); // Emit request event
        return true;
    }

    // Function for approving a token request
    function approveRequest(address _to) public returns (bool success) {
        uint256 requestedAmount = requests[msg.sender][_to];
        require(requestedAmount > 0, "No pending request");

        // Perform the transfer
        require(
            balanceOf[msg.sender] >= requestedAmount,
            "Insufficient balance"
        );
        balanceOf[msg.sender] -= requestedAmount;
        balanceOf[_to] += requestedAmount;
        requests[msg.sender][_to] = 0; // Clear the request

        emit Transfer(msg.sender, _to, requestedAmount); // Emit transfer event
        emit RequestApproved(msg.sender, _to, requestedAmount); // Emit approval event
        return true;
    }

    // Function for declining a token request
    function declineRequest(address _to) public returns (bool success) {
        uint256 requestedAmount = requests[msg.sender][_to];
        require(requestedAmount > 0, "No pending request");

        requests[msg.sender][_to] = 0; // Clear the request

        emit RequestDeclined(msg.sender, _to); // Emit decline event
        return true;
    }

    // Function for the owner to distribute tokens from the contract's balance
    function distribute(
        address _to,
        uint256 _value
    ) public onlyOwner returns (bool success) {
        require(
            balanceOf[address(this)] >= _value,
            "Insufficient contract balance"
        );
        balanceOf[address(this)] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(address(this), _to, _value); // Emit a transfer event from the contract to recipient
        emit Distribution(_to, _value); // Emit distribution event
        return true;
    }

    function transfer(
        address _to,
        address _from,
        uint256 _value
    ) public returns (bool success) {
        require(balanceOf[_from] >= _value, "Insufficient balance");
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(_from, _to, _value);
        return true;
    }

    // Approve tokens for a spender
    function approve(
        address _spender,
        uint256 _value
    ) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    // Transfer tokens on behalf of another address (requires approval)
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        require(_value <= balanceOf[_from], "Insufficient balance");
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(_from, _to, _value);
        return true;
    }
    function getHolderBalance(address _holder) public view returns (uint256) {
        return balanceOf[_holder];
    }
}
