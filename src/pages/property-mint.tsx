import React from "react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import NFTBatchMintForm from "../components/NFTBatchMintForm";
import { useAuth } from "../contexts/AuthContext";

export default function PropertyMintPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== 'PROPERTY_OWNER') {
      router.replace("/"); // Redirect non-owners to home or login
    }
  }, [user, router]);

  if (!user || user.role !== 'PROPERTY_OWNER') {
    return null; // Already redirected
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-blue-700 flex items-center gap-2">
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M12 3l9 6-9 6-9-6 9-6zm0 13.5l9-6V21l-9 6-9-6V10.5l9 6z" fill="#2563eb"/></svg>
          Tokenize Your Property (Batch Mint)
        </h1>
        <p className="mb-6 text-gray-600">Upload property details and images to mint real Hedera NFTs. Only property owners can access this page.</p>
        <NFTBatchMintForm />
      </div>
    </div>
  );
}
