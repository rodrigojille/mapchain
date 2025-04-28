import { PrismaClient } from '@prisma/client';
import { User } from '@prisma/client';

const prisma = new PrismaClient();

export class ValuatorService {
  /**
   * Get all valuators (users with role VALUATOR)
   */
  public async getAllValuators(): Promise<User[]> {
    return prisma.user.findMany({
      where: { role: 'VALUATOR' },
      select: {
        id: true,
        email: true,
        name: true,
        walletAddress: true,
        createdAt: true,
        updatedAt: true,
        // Add additional fields as needed
      },
    });
  }
}
