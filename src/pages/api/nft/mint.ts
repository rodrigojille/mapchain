import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File, Fields, Files } from 'formidable';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import { HederaService } from '../../../lib/hedera';
import { prisma } from '../../../lib/prisma';

const PINATA_API_KEY = process.env.PINATA_API_KEY!;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET!;
const HEDERA_OPERATOR_ID = process.env.HEDERA_OPERATOR_ID!;
const HEDERA_OPERATOR_KEY = process.env.HEDERA_OPERATOR_KEY!;

export const config = {
  api: {
    bodyParser: false,
  },
};

function parseForm(req: NextApiRequest): Promise<{ fields: Fields; files: Files }> {
  const form = formidable({ multiples: true, keepExtensions: true });
  return new Promise((resolve, reject) => {
    form.parse(req, (err: any, fields: Fields, files: Files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

async function pinFileToIPFS(file: File) {
  const data = new FormData();
  data.append('file', fs.createReadStream(file.filepath), {
    filename: file.originalFilename,
  });
  const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', data, {
    maxBodyLength: Infinity,
    headers: {
      ...data.getHeaders(),
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_API_SECRET,
    },
  });
  return response.data.IpfsHash;
}

async function pinJSONToIPFS(json: any) {
  const response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', json, {
    headers: {
      'Content-Type': 'application/json',
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_API_SECRET,
    },
  });
  return response.data.IpfsHash;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fields, files } = await parseForm(req);
    const properties = JSON.parse(fields.properties as string);
    const images = files.images;
    let imageFile: File & { filepath: string; originalFilename: string };
    if (Array.isArray(images)) {
      imageFile = images[0] as File & { filepath: string; originalFilename: string }; // Only minting one NFT at a time for this demo
    } else {
      imageFile = images as File & { filepath: string; originalFilename: string };
    }

    // 1. Pin image to Pinata
    const imageIpfsHash = await pinFileToIPFS(imageFile);
    const imageUri = `ipfs://${imageIpfsHash}`;

    // 2. Prepare NFT metadata (standard real estate fields)
    const property = properties[0];
    const metadata = {
      name: property.name,
      description: property.description,
      image: imageUri,
      owner: property.owner || '',
      address: property.address || '',
      valuation: property.valuation || '',
      valuationDate: property.valuationDate || '',
      valuator: property.valuator || '',
      type: property.type || '',
      size: property.size || '',
      attributes: property.attributes || [],
    };


    // 3. Pin metadata to Pinata
    const metadataIpfsHash = await pinJSONToIPFS(metadata);
    const metadataUri = `ipfs://${metadataIpfsHash}`;

    // 4. Mint NFT on Hedera
    const hedera = new HederaService(HEDERA_OPERATOR_ID, HEDERA_OPERATOR_KEY);
    // Create a new NFT collection for each property (or reuse if you want)
    const tokenId = await hedera.createPropertyNFT(property.name, property.name.slice(0, 4).toUpperCase());
    if (!tokenId) {
      console.error('Token creation failed: tokenId is undefined');
      return res.status(500).json({ error: 'Token creation failed: tokenId is undefined. Check your HBAR balance and Hedera status.' });
    }
    const mintResult = await hedera.mintPropertyNFT(tokenId, metadataUri);

    // Flatten serials (protobuf Long objects) to plain numbers
    const serials = (mintResult.serials || []).map((s: any) => typeof s.toNumber === 'function' ? s.toNumber() : s);

    // Save to DB (MintedNFT)
    try {
      await prisma.mintedNFT.create({
        data: {
          tokenId,
          metadataUri,
          mintTxId: mintResult.transactionId,
          serials: JSON.stringify(serials),
        },
      });
    } catch (e) {
      console.error('Failed to save MintedNFT to DB:', e);
    }

    return res.status(200).json({
      message: 'NFT minted successfully',
      tokenId,
      metadataUri,
      mintTxId: mintResult.transactionId,
      serials,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to process minting' });
  }
}
