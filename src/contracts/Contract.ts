import { Client, ContractExecuteTransaction, ContractCallQuery, ContractFunctionParameters, Hbar } from '@hashgraph/sdk';

export class Contract {
  private address: string;
  private abi: any[];
  private client: Client;

  constructor(address: string, abi: any[], client: Client) {
    this.address = address;
    this.abi = abi;
    this.client = client;
  }

  async execute(functionName: string, params: any[], options: { gasLimit?: number } = {}): Promise<any> {
    const functionParams = new ContractFunctionParameters();
    params.forEach(param => {
      if (typeof param === 'string') {
        functionParams.addString(param);
      } else if (typeof param === 'number') {
        functionParams.addUint256(param);
      } else if (typeof param === 'boolean') {
        functionParams.addBool(param);
      }
    });

    const transaction = new ContractExecuteTransaction()
      .setContractId(this.address)
      .setFunction(functionName, functionParams)
      .setGas(options.gasLimit || 100000)
      .setMaxTransactionFee(new Hbar(2));

    const txResponse = await transaction.execute(this.client);
    return await txResponse.getReceipt(this.client);
  }

  async call(functionName: string, params: any[]): Promise<any> {
    const functionParams = new ContractFunctionParameters();
    params.forEach(param => {
      if (typeof param === 'string') {
        functionParams.addString(param);
      } else if (typeof param === 'number') {
        functionParams.addUint256(param);
      } else if (typeof param === 'boolean') {
        functionParams.addBool(param);
      }
    });

    const query = new ContractCallQuery()
      .setContractId(this.address)
      .setFunction(functionName, functionParams)
      .setGas(100000);

    const response = await query.execute(this.client);
    return response;
  }
}
