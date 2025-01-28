// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {AccessControl} from '@openzeppelin/contracts/access/AccessControl.sol';
import {ERC20} from '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import {ERC20Burnable} from '@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol';
import {ERC20Pausable} from '@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol';

contract BLTMToken is ERC20Burnable, ERC20Pausable, AccessControl {
  // Define roles
  bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');
  bytes32 public constant PAUSER_ROLE = keccak256('PAUSER_ROLE');

  constructor() ERC20('BLTM', 'BLTM') {
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // Deployer has admin role
    _grantRole(MINTER_ROLE, msg.sender); // Deployer has minter role
    _grantRole(PAUSER_ROLE, msg.sender); // Deployer has pauser role
  }

  // Override decimals to set it to 6
  function decimals() public pure override returns (uint8) {
    return 6;
  }

  /**
   * @dev Mint new tokens to a specified address.
   * Restricted to addresses with the MINTER_ROLE.
   */
  function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
    _mint(to, amount);
  }

  /**
   * @dev Pause all token transfers.
   * Restricted to addresses with the PAUSER_ROLE.
   */
  function pause() external onlyRole(PAUSER_ROLE) {
    _pause();
  }

  /**
   * @dev Unpause all token transfers.
   * Restricted to addresses with the PAUSER_ROLE.
   */
  function unpause() external onlyRole(PAUSER_ROLE) {
    _unpause();
  }

  // The following functions are overrides required by Solidity.

  // Override _burn to update the balance of the recipient
  function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Pausable) {
    super._update(from, to, value);
  }
}
