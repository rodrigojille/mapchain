import { create } from 'ipfs-http-client';

const projectId = process.env.NEXT_PUBLIC_IPFS_API_KEY;
const projectSecret = process.env.IPFS_API_SECRET;
const authorization = `Basic ${Buffer.from(`${projectId}:${projectSecret}`).toString('base64')}`;

const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization
  }
});

export const useIPFS = () => {
  const uploadToIPFS = async (content: string | File) => {
    try {
      let data;
      if (content instanceof File) {
        const buffer = await content.arrayBuffer();
        data = buffer;
      } else {
        data = content;
      }

      const result = await ipfs.add(data);
      return result.path;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw new Error('Failed to upload to IPFS');
    }
  };

  const getFromIPFS = async (hash: string) => {
    try {
      const stream = ipfs.cat(hash);
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks).toString();
    } catch (error) {
      console.error('Error fetching from IPFS:', error);
      throw new Error('Failed to fetch from IPFS');
    }
  };

  return {
    uploadToIPFS,
    getFromIPFS,
  };
};
