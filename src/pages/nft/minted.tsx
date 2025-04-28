import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface MintedNFT {
  tokenId: string;
  metadataUri: string;
  mintTxId: string;
  serials: number[];
  metadata?: any;
}

const MintedNFTsPage: React.FC = () => {
  const [nfts, setNfts] = useState<MintedNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // For demo: fetch from a local endpoint or mock data
    // In production, replace with your backend endpoint that lists minted NFTs
    const fetchNFTs = async () => {
      setLoading(true);
      setError(null);
      try {
        // This should be replaced with your real endpoint or DB call
        const res = await axios.get('/api/nft/minted');
        const items = res.data.nfts || [];
        // Optionally, fetch metadata for each NFT from IPFS
        const withMeta = await Promise.all(items.map(async (nft: MintedNFT) => {
          try {
            const ipfsUrl = nft.metadataUri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
            const metaRes = await axios.get(ipfsUrl);
            return { ...nft, metadata: metaRes.data };
          } catch {
            return nft;
          }
        }));
        setNfts(withMeta);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch NFTs');
      }
      setLoading(false);
    };
    fetchNFTs();
  }, []);

  return (
    <div style={{ padding: 32 }}>
      <h1>Minted Property NFTs</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        {nfts.map((nft, idx) => (
          <div key={idx} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, width: 320 }}>
            <h2>{nft.metadata?.name || 'Property NFT'}</h2>
            {nft.metadata?.image && (
              <img src={nft.metadata.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')} alt="nft" style={{ width: '100%', borderRadius: 4 }} />
            )}
            <p><strong>Description:</strong> {nft.metadata?.description}</p>
            <p><strong>Owner:</strong> {nft.metadata?.owner}</p>
            <p><strong>Address:</strong> {nft.metadata?.address}</p>
            <p><strong>Valuation:</strong> {nft.metadata?.valuation}</p>
            <p><strong>Valuation Date:</strong> {nft.metadata?.valuationDate}</p>
            <p><strong>Valuator:</strong> {nft.metadata?.valuator}</p>
            <p><strong>Type:</strong> {nft.metadata?.type}</p>
            <p><strong>Size:</strong> {nft.metadata?.size}</p>
            <p><strong>Token ID:</strong> {nft.tokenId}</p>
            <p><strong>Mint Tx ID:</strong> {nft.mintTxId}</p>
            <p><strong>Serials:</strong> {nft.serials && nft.serials.join(', ')}</p>
            <a href={nft.metadataUri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')} target="_blank" rel="noopener noreferrer">View Metadata on IPFS</a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MintedNFTsPage;
