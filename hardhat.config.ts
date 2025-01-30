import '@nomicfoundation/hardhat-chai-matchers';
import '@nomicfoundation/hardhat-toolbox-viem';
import 'dotenv/config';
import type { HardhatUserConfig } from 'hardhat/config';

const { SEPOLIA_API_URL, PRIVATE_KEY } = process.env;

const config: HardhatUserConfig = {
  solidity: '0.8.28',
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts'
  },
  networks: {
    hardhat: {},
    sepolia: {
      url: SEPOLIA_API_URL,
      accounts: [PRIVATE_KEY as string]
    }
  }
};

export default config;
