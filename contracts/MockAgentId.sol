// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title MockAgentId — minimal ERC-721 stand-in for the SPACE ID Agent ID
///        contract, TEST ONLY. Only balanceOf matters to AgentPass.
/// @dev Deliberately permissionless mint: tests mint to arbitrary wallets.
contract MockAgentId {
    mapping(address => uint256) private _balances;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    function mint(address to) external {
        _balances[to] += 1;
        emit Transfer(address(0), to, uint256(uint160(to)));
    }

    function balanceOf(address owner) external view returns (uint256) {
        return _balances[owner];
    }
}
