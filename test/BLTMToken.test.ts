import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers';
import { expect } from 'chai';
import hre from 'hardhat';

// Deployment function to set up the initial state
const deployBLTMToken = async () => {
  const bltmToken = await hre.viem.deployContract('BLTMToken');

  return { bltmToken };
};

describe('BLTMToken Contract Tests', function () {
  it('should have correct initial setup', async function () {
    const { bltmToken } = await loadFixture(deployBLTMToken);

    const name = await bltmToken.read.name();
    const symbol = await bltmToken.read.symbol();
    const decimals = await bltmToken.read.decimals();

    expect(name).to.equal('BLTM');
    expect(symbol).to.equal('BLTM');
    expect(decimals).to.equal(6);
  });

  it('should the deployer have the default roles', async () => {
    const { bltmToken } = await loadFixture(deployBLTMToken);

    const [owner] = await hre.viem.getWalletClients();
    const minterRole = await bltmToken.read.MINTER_ROLE();
    const pauserRole = await bltmToken.read.PAUSER_ROLE();

    const isOwnerMinter = await bltmToken.read.hasRole([minterRole, owner.account.address]);
    const isOwnerPauser = await bltmToken.read.hasRole([pauserRole, owner.account.address]);

    expect(isOwnerMinter).to.be.true;
    expect(isOwnerPauser).to.be.true;
  });

  it('should allow minting by minter', async () => {
    const { bltmToken } = await loadFixture(deployBLTMToken);

    const [owner, minter, recipient] = await hre.viem.getWalletClients();
    const minterRole = await bltmToken.read.MINTER_ROLE();

    await bltmToken.write.grantRole([minterRole, minter.account.address], { account: owner.account });

    const mintAmount = 1n;
    await bltmToken.write.mint([recipient.account.address, mintAmount], { account: minter.account });

    const balance = await bltmToken.read.balanceOf([recipient.account.address]);
    expect(balance).to.equal(mintAmount);
  });

  it('should revert minting by non-minter', async () => {
    const { bltmToken } = await loadFixture(deployBLTMToken);

    const [, nonMinter, recipient] = await hre.viem.getWalletClients();

    const mintAmount = 1n;
    await expect(
      bltmToken.write.mint([recipient.account.address, mintAmount], { account: nonMinter.account })
    ).to.be.rejectedWith('AccessControl');
  });

  it('should allow burning by holder', async () => {
    const { bltmToken } = await loadFixture(deployBLTMToken);

    const [owner, holder] = await hre.viem.getWalletClients();

    const mintAmount = 1n;
    await bltmToken.write.mint([holder.account.address, mintAmount], { account: owner.account });

    await bltmToken.write.burn([mintAmount], { account: holder.account });

    const balance = await bltmToken.read.balanceOf([holder.account.address]);
    expect(balance).to.equal(0n);
  });

  it('should revert burning by non-holder', async () => {
    const { bltmToken } = await loadFixture(deployBLTMToken);

    const [owner, holder, nonHolder] = await hre.viem.getWalletClients();

    const mintAmount = 1n;
    await bltmToken.write.mint([holder.account.address, mintAmount], { account: owner.account });

    await expect(bltmToken.write.burn([mintAmount], { account: nonHolder.account })).to.be.rejected;
  });

  it('should allow pausing and unpausing by pauser', async () => {
    const { bltmToken } = await loadFixture(deployBLTMToken);

    const [owner, pauser, sender, recipient] = await hre.viem.getWalletClients();
    const pauserRole = await bltmToken.read.PAUSER_ROLE();

    await bltmToken.write.grantRole([pauserRole, pauser.account.address], { account: owner.account });

    const mintAmount = 50_000n * 10n ** 6n;
    await bltmToken.write.mint([sender.account.address, mintAmount], { account: owner.account });

    await bltmToken.write.pause({ account: pauser.account });

    await expect(
      bltmToken.write.transfer([recipient.account.address, 10_000n * 10n ** 6n], { account: sender.account })
    ).to.be.rejected;

    await bltmToken.write.unpause({ account: pauser.account });

    await bltmToken.write.transfer([recipient.account.address, 10_000n * 10n ** 6n], { account: sender.account });

    const recipientBalance = await bltmToken.read.balanceOf([recipient.account.address]);
    expect(recipientBalance).to.equal(10_000n * 10n ** 6n);
  });

  it('should allow transferring by holder', async () => {
    const { bltmToken } = await loadFixture(deployBLTMToken);

    const [owner, sender, recipient] = await hre.viem.getWalletClients();

    const mintAmount = 50n;
    await bltmToken.write.mint([sender.account.address, mintAmount], { account: owner.account });

    await bltmToken.write.transfer([recipient.account.address, 10n], { account: sender.account });

    const recipientBalance = await bltmToken.read.balanceOf([recipient.account.address]);
    expect(recipientBalance).to.equal(10n);
  });

});
