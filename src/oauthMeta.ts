import { LoginType, OAuthFetcher } from './types';
import { ethers } from 'ethers';

export class OAuthContractMeta implements OAuthFetcher {
  private appContract: ethers.Contract;
  constructor(appAddress: string, rpcUrl: string) {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.appContract = new ethers.Contract(
      appAddress,
      [
        'function googleClientId() public view returns (string)',
        'function redditClientId() public view returns (string)',
        'function githubClientId() public view returns (string)',
        'function twitterClientId() public view returns (string)',
        'function discordClientId() public view returns (string)',
        'function twitchClientId() public view returns (string)',
      ],
      provider
    );
  }

  public async getClientID(loginType: LoginType): Promise<string> {
    const clientID: string[] = await this.appContract.functions[
      `${loginType}ClientId`
    ]();
    return clientID[0];
  }
}
