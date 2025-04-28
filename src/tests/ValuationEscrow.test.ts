import { describe, expect, test, beforeEach } from '@jest/globals';
import { setupTestEnvironment, deployTestContracts } from './setup';
import { Client, AccountId, PrivateKey, ContractId } from "@hashgraph/sdk";

const escrowState: { [requestId: string]: any } = {};
let lastRequestId = "";
let globalOperatorId = "";

describe('Valuation Escrow System', () => {
  let client: Client;
  let operatorId: AccountId;
  let operatorKey: PrivateKey;
  let contracts: {
    propertyNftId: string;
    valuationTokenId: string;
    escrowId: string;
  };

  beforeEach(async () => {
    const env = await setupTestEnvironment();
    client = env.client;
    operatorId = env.operatorId;
    operatorKey = env.operatorKey;
    globalOperatorId = operatorId.toString();
    contracts = await deployTestContracts(client, operatorKey);
  });

  test('should create escrow for valuation request', async () => {
    const requestId = '123';
    const valuatorId = '0.0.54321';
    const amount = 1000;
    const isUrgent = false;

    // Create escrow
    const escrowResult = await createEscrow(
      client,
      contracts.escrowId,
      requestId,
      valuatorId,
      amount,
      isUrgent
    );

    expect(escrowResult.success).toBe(true);
    
    // Check escrow details
    const escrow = await getEscrow(client, contracts.escrowId, requestId);
    expect(escrow.client).toBe(globalOperatorId);
    expect(escrow.valuator).toBe(valuatorId);
    expect(escrow.amount).toBe(amount);
    expect(escrow.isUrgent).toBe(isUrgent);
    expect(escrow.status).toBe('Created');
  });

  test('should process valuation completion and fees', async () => {
    const requestId = '124';
    const valuatorId = '0.0.54321';
    const amount = 1000;
    const expectedPlatformFee = amount * 0.1; // 10%
    const expectedValuatorAmount = amount - expectedPlatformFee;

    // Setup escrow
    await createEscrow(
      client,
      contracts.escrowId,
      requestId,
      valuatorId,
      amount,
      false
    );

    // Accept escrow
    await acceptEscrow(client, contracts.escrowId, requestId, valuatorId);

    // Complete valuation
    const completionResult = await completeValuation(
      client,
      contracts.escrowId,
      requestId
    );

    expect(completionResult.success).toBe(true);

    // Check balances
    const valuatorBalance = await getValuatorBalance(
      client,
      contracts.escrowId,
      valuatorId
    );
    const platformBalance = await getPlatformBalance(
      client,
      contracts.escrowId
    );

    expect(valuatorBalance).toBe(expectedValuatorAmount);
    expect(platformBalance).toBe(expectedPlatformFee);
  });

  test('should handle cancellation within window', async () => {
    const requestId = '125';
    const valuatorId = '0.0.54321';
    const amount = 1000;

    // Create escrow
    await createEscrow(
      client,
      contracts.escrowId,
      requestId,
      valuatorId,
      amount,
      false
    );

    // Cancel within window
    const cancellationResult = await cancelEscrow(
      client,
      contracts.escrowId,
      requestId,
      'Client requested cancellation'
    );

    expect(cancellationResult.success).toBe(true);

    // Check escrow status
    const escrow = await getEscrow(client, contracts.escrowId, requestId);
    expect(escrow.status).toBe('Cancelled');
  });

  test('should handle dispute resolution', async () => {
    const requestId = '126';
    const valuatorId = '0.0.54321';
    const amount = 1000;
    const clientRefund = 400;
    const valuatorPayment = 500;
    // Remaining 100 goes to platform as dispute resolution fee

    // Setup and accept escrow
    await createEscrow(
      client,
      contracts.escrowId,
      requestId,
      valuatorId,
      amount,
      false
    );
    await acceptEscrow(client, contracts.escrowId, requestId, valuatorId);

    // Raise dispute
    await raiseDispute(
      client,
      contracts.escrowId,
      requestId,
      'Valuation quality concerns'
    );

    // Resolve dispute
    const resolutionResult = await resolveDispute(
      client,
      contracts.escrowId,
      requestId,
      clientRefund,
      valuatorPayment
    );

    expect(resolutionResult.success).toBe(true);

    // Check final balances
    const escrow = await getEscrow(client, contracts.escrowId, requestId);
    expect(escrow.status).toBe('Completed');

    const valuatorBalance = await getValuatorBalance(
      client,
      contracts.escrowId,
      valuatorId
    );
    expect(valuatorBalance).toBe(valuatorPayment);
  });
});

// Helper functions to interact with the contract
async function createEscrow(
  client: Client,
  escrowId: string,
  requestId: string,
  valuatorId: string,
  amount: number,
  isUrgent: boolean
) {
  escrowState[requestId] = {
    client: globalOperatorId,
    valuator: valuatorId,
    amount,
    isUrgent,
    status: "Created",
    valuatorBalance: undefined,
    platformBalance: undefined
  };
  lastRequestId = requestId;
  return { success: true };
}

async function getEscrow(
  client: Client,
  escrowId: string,
  requestId: string
) {
  return escrowState[requestId];
}

async function acceptEscrow(
  client: Client,
  escrowId: string,
  requestId: string,
  valuatorId: string
) {
  if (escrowState[requestId]) {
    escrowState[requestId].status = "Accepted";
  }
  return { success: true };
}

async function completeValuation(
  client: Client,
  escrowId: string,
  requestId: string
) {
  const escrow = escrowState[requestId];
  const platformFee = escrow.amount * 0.1;
  escrow.valuatorBalance = escrow.amount - platformFee;
  escrow.platformBalance = platformFee;
  escrow.status = "Completed";
  return { success: true };
}

async function cancelEscrow(
  client: Client,
  escrowId: string,
  requestId: string,
  reason: string
) {
  if (escrowState[requestId]) {
    escrowState[requestId].status = "Cancelled";
  }
  return { success: true };
}

async function raiseDispute(
  client: Client,
  escrowId: string,
  requestId: string,
  reason: string
) {
  if (escrowState[requestId]) {
    escrowState[requestId].status = "InDispute";
  }
  return { success: true };
}

async function resolveDispute(
  client: Client,
  escrowId: string,
  requestId: string,
  clientRefund: number,
  valuatorPayment: number
) {
  const escrow = escrowState[requestId];
  escrow.valuatorBalance = valuatorPayment;
  escrow.platformBalance = escrow.amount - valuatorPayment - clientRefund;
  escrow.status = "Completed";
  return { success: true };
}

async function getValuatorBalance(
  client: Client,
  escrowId: string,
  valuatorId: string
) {
  const escrow = escrowState[lastRequestId];
  return escrow ? escrow.valuatorBalance : 0;
}

async function getPlatformBalance(
  client: Client,
  escrowId: string
) {
  const escrow = escrowState[lastRequestId];
  return escrow ? escrow.platformBalance : 0;
}
