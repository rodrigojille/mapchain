declare module 'hedera-services' {
  export class HederaService {
    constructor();
    
    // Client management
    createClient(accountId: string, privateKey: string): Promise<any>;
    
    // Contract operations
    createContract(bytecode: string, params: any[]): Promise<string>;
    executeContract(contractId: string, functionName: string, params: any[]): Promise<any>;
    queryContract(contractId: string, functionName: string, params: any[]): Promise<any>;
    
    // Token operations
    createToken(name: string, symbol: string, decimals: number): Promise<string>;
    mintToken(tokenId: string, amount: number): Promise<any>;
    transferToken(tokenId: string, to: string, amount: number): Promise<any>;
    
    // Account operations
    getAccountBalance(accountId: string): Promise<number>;
    transferHbar(to: string, amount: number): Promise<any>;
    
    // Utility functions
    getClient(): any;
    getNetwork(): string;
    setNetwork(network: 'mainnet' | 'testnet'): void;
  }
}
