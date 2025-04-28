import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const nfts = await prisma.mintedNFT.findMany({
      orderBy: { createdAt: 'desc' },
    });
    // Parse serials from JSON string and return
    const formatted = nfts.map(nft => ({
      ...nft,
      serials: (() => { try { return JSON.parse(nft.serials); } catch { return []; } })(),
    }));
    return res.status(200).json({ nfts: formatted });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch minted NFTs' });
  }
}
