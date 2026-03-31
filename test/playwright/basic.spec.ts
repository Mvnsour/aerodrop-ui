import basicSetup from '../wallet-setup/basic.setup';
import { testWithSynpress } from '@synthetixio/synpress';
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright'

const test = testWithSynpress(metaMaskFixtures(basicSetup));
const { expect } = test;

test('has title', async ({ page }) => {
  await page.goto('/');
  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle('AeroDrop');
});

// The core test for wallet connection and UI change
test('should display the airdrop form when connected, otherwhise , not', async({ page, context, metamaskPage, extensionId }) => {
  // The test function now receives Synpress/MetaMask fixtures: context, metamaskPage, extensionId
  await page.goto('/');
  // check we see "please connect a wallet"
  await expect(page.getByText('Please connect a wallet')).toBeVisible(); // Check for a disconnected message
  await expect(page.getByText('Token Address')).not.toBeVisible(); // Check that the form element is initially hidden

  const metamask = new MetaMask(context, metamaskPage, basicSetup.walletPassword, extensionId);
  // Use getByTestId for robust element selection if your Dapp includes test IDs
  await page.getByTestId('rk-connect-button').click();
  await page.getByTestId('rk-wallet-option-io.metamask').waitFor({
    state: 'visible',
    timeout: 30000
  });

  await page.getByTestId('rk-wallet-option-io.metamask').click();
  await metamask.connectToDapp();

  // Add a custom network if needed for testing (e.g., local Anvil/Hardhat)
    const customNetwork = {
     name: 'Anvil',
     rpcUrl: 'http://127.0.0.1:8545',
     chainId: 31337,
     symbol: 'ETH',
   };
   await metamask.addNetwork(customNetwork);

  // Wait for potential asynchronous updates after connection
  await expect(page.getByText('Token Address')).toBeVisible({ timeout: 10000 }); // Check if a form label is now visible
  await expect(page.getByText('Please connect')).not.toBeVisible(); // Check the disconnected message is gone
});