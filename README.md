# Rodrigo Santana Gonçalves Basic dApp for RWA Invesing
A decentralized application to swap USDC for BLTM tokens representing ownership in Real-World Assets (RWA).

## Description
This dApp allows users to:  
✅ Connect their MetaMask wallet  
✅ View their USDC and BLTM balances  
✅ Swap USDC for BLTM tokens  
✅ Redeem BLTM tokens back for USDC  
✅ Track deposit and withdrawal transactions in real time  

Users interact with a **LiquidityPool smart contract** that facilitates token swaps, enforces exchange rates, and maintains a balance of USDC and BLTM tokens.  

## Technologies Used
- **Frontend:** Next.js (TypeScript), React, Tailwind CSS, Wagmi, Viem  
- **Smart Contracts:** Solidity, Hardhat, OpenZeppelin  
- **Blockchain:** Hardhat Local Node (Ethereum-compatible)  
- **Wallet Integration:** MetaMask (Injected Connector) 

## Setup Instructions

### 📌 Prerequisites  
Ensure you have the following installed:  
- [Node.js](https://nodejs.org/) (v16+ recommended)  
- [MetaMask](https://metamask.io/) browser extension  
- Hardhat (installed via npm)  

### 🚀 Steps to Run the Project  

#### 1️. Clone the Repository  
```bash
git clone https://github.com/yourusername/bltm-token-swap.git
cd bltm-token-swap
```

#### 2. Install Dependencies  
```bash
npm install
```

#### 3. Start the Hardhat Local Node  
```bash
npx hardhat node
```

#### 4. Deploy the Smart Contracts  
```bash
npx hardhat run scripts/deploy.ts --network localhost
```

#### 5. Start the Next.js Frontend  
```bash
cd frontend
npm run dev
```

#### 6️. Connect MetaMask to the Localhost (Hardhat Network)
1. Open **Metamask** in your browser
1. Click **Networks → Add Network → Custom RPC**
1. Enter the following details:
   - **Network Name:** `Hardhat`
   - **New RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337`
1. Click **Save**
1. (Optional) Import **USDC and BLTM** manually using deployed addresses

## Approach and Challenges

### Approach
- Implemented and tested **ERC-20 token (BLTM)** using OpenZeppelin's contracts.
- Developed a **LiquidityPool contract** to facilitate token swaps and enforce exchange rates following the defined rules.
- Created a **React + Next.js frontend** to interact with the smart contracts and display user balances and transactions.
- Used **Wagmi & Viem** for efficient blockchain interaction and wallet connection.

### Challenges and how they were overcome
- **Issue**: Not enough allowance to swap tokens  
✅ **Fix**: Called `approve()` function to allow the LiquidityPool contract to transfer USDC and burn BLTM on behalf of the user.
- **Issue:** Incorrect `burn()` function call in BLTM contract  
✅ **Fix:** Fixed the function signature to `burnForm()` and tested the contract using Hardhat tests.
- **Issue:** ERC20InsufficientBalance error when redeeming BLTM  
✅ Fix: Ensured users had enough BLTM before attempting to burn tokens.
- **Issue:**: Hardhat local node resets after restarting  
✅ Fix: Used local snapshots or manually re-minted tokens for testing.
- **Issue:**: Internal JSON-RPC errors when interacting with the smart contracts after restarting local node and redeploying contracts  
✅ Fix: Clean Metamask cache and restart the browser.

### 🔮 Suggested Improvements
- Persist transactions in local storage or a database (e.g., Firebase, PostgreSQL).
- Expand to multiple chains (Polygon, Arbitrum) using Wagmi’s or Wallet Connect multi-chain support.
- Improve UI with better styling and animations.
- Add "owner only" features like change BLTM exchange rate and withdraw all remain USDCs from the pool.
