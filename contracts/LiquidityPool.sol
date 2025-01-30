// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {AccessControl} from '@openzeppelin/contracts/access/AccessControl.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import './BLTMToken.sol';

contract LiquidityPool is AccessControl {
  IERC20 public usdcToken;
  BLTMToken public bltmToken;
  uint256 public exchangeRate; // 1 USDC = X BLTM
  uint256 public constant ROYALTY_PERCENTAGE = 2; // 2% royalty fee

  bytes32 public constant OWNER_ROLE = keccak256('OWNER_ROLE');

  event ExchangeRateUpdated(uint256 newRate);
  event TokensSwapped(address indexed owner, uint256 usdcAmount, uint256 bltmAmount);
  event TokensRedeemed(address indexed owner, uint256 bltmAmount, uint256 usdcAmount);
  event USDCWithdrawn(address indexed owner, uint256 amount);

  constructor(address _usdcToken, address _bltmToken, uint256 _exchangeRate) {
    require(_usdcToken != address(0), 'LiquidityPool: Invalid USDC token address');
    require(_bltmToken != address(0), 'LiquidityPool: Invalid BLTM token address');
    require(_exchangeRate > 0, 'LiquidityPool: Invalid must be greater than 0');

    usdcToken = IERC20(_usdcToken);
    bltmToken = BLTMToken(_bltmToken);
    exchangeRate = _exchangeRate;

    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(OWNER_ROLE, msg.sender);

    // Grant minter role to this contract for BLTM token
    // bltmToken.grantRole(bltmToken.MINTER_ROLE(), address(this));
  }

  function setExchangeRate(uint256 _exchangeRate) external onlyRole(OWNER_ROLE) {
    require(_exchangeRate > 0, 'LiquidityPool: Invalid must be greater than 0');
    exchangeRate = _exchangeRate;
    emit ExchangeRateUpdated(_exchangeRate);
  }

  // Swap USDC for BLTM
  function deposit(uint256 _usdcAmount) external {
    require(_usdcAmount > 0, 'LiquidityPool: amount must be greater than 0');

    uint256 royalty = (_usdcAmount * ROYALTY_PERCENTAGE) / 100;
    uint256 amountAfterRoyalty = _usdcAmount - royalty;
    uint256 bltmAmount = amountAfterRoyalty * exchangeRate;

    require(usdcToken.transferFrom(msg.sender, address(this), _usdcAmount), 'LiquidityPool: USDC transfer failed');
    bltmToken.mint(msg.sender, bltmAmount);

    emit TokensSwapped(msg.sender, _usdcAmount, bltmAmount);
  }

  // Swap BLTM for USDC
  function redeem(uint256 _bltmAmount) external {
    require(_bltmAmount > 0, 'LiquidityPool: amount must be greater than 0');

    uint256 userBalance = bltmToken.balanceOf(msg.sender);
    require(userBalance >= _bltmAmount, 'LiquidityPool: Insufficient BLTM balance');

    uint256 usdcAmount = _bltmAmount / exchangeRate;
    require(usdcToken.balanceOf(address(this)) >= usdcAmount, 'LiquidityPool: Insufficient USDC in contract');

    bltmToken.burnFrom(msg.sender, _bltmAmount);
    require(usdcToken.transfer(msg.sender, usdcAmount), 'LiquidityPool: USDC transfer failed');

    emit TokensRedeemed(msg.sender, _bltmAmount, usdcAmount);
  }

  function withdrawAll(uint256 _amount) external onlyRole(OWNER_ROLE) {
    require(_amount > 0, 'LiquidityPool: amount must be greater than 0');
    require(usdcToken.balanceOf(address(this)) >= _amount, 'LiquidityPool: Insufficient USDC balance');

    require(usdcToken.transfer(msg.sender, _amount), 'LiquidityPool: USDC transfer failed');
    emit USDCWithdrawn(msg.sender, _amount);
  }
}
