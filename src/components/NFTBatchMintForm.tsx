import React, { useState } from "react";

interface PropertyInput {
  name: string;
  description: string;
  attributes: { trait_type: string; value: string }[];
}

export default function NFTBatchMintForm() {
  const [properties, setProperties] = useState<PropertyInput[]>([
    { name: "", description: "", attributes: [{ trait_type: "Location", value: "" }] }
  ]);
  const [images, setImages] = useState<File[]>([]);
  const [minting, setMinting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePropertyChange = (idx: number, field: string, value: string) => {
    setProperties(props => {
      const updated = [...props];
      (updated[idx] as any)[field] = value;
      return updated;
    });
  };

  const handleAttributeChange = (idx: number, attrIdx: number, field: string, value: string) => {
    setProperties(props => {
      const updated = [...props];
      updated[idx].attributes[attrIdx][field as "trait_type" | "value"] = value;
      return updated;
    });
  };

  const handleImageChange = (idx: number, file: File | null) => {
    setImages(imgs => {
  const updated = [...imgs];
  if (file) {
    updated[idx] = file;
  } else {
    updated.splice(idx, 1);
  }
  return updated;
});
  };

  const addProperty = () => {
    setProperties(props => ([
      ...props,
      { name: "", description: "", attributes: [{ trait_type: "Location", value: "" }] }
    ]));
    setImages(imgs => ([...imgs, undefined]));
  };

  const removeProperty = (idx: number) => {
    setProperties(props => props.filter((_, i) => i !== idx));
    setImages(imgs => imgs.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMinting(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("properties", JSON.stringify(properties));
      images.forEach((file, idx) => {
        if (file) formData.append("images", file);
      });
      const res = await fetch("/api/nft/mint", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Minting failed");
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setMinting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold">Batch Mint Property NFTs</h2>
      {properties.map((property, idx) => (
        <div key={idx} className="border p-4 mb-4 rounded bg-gray-50">
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Name"
              value={property.name}
              onChange={e => handlePropertyChange(idx, "name", e.target.value)}
              className="border p-1 rounded flex-1"
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={property.description}
              onChange={e => handlePropertyChange(idx, "description", e.target.value)}
              className="border p-1 rounded flex-1"
              required
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1 font-semibold">Location</label>
            <input
              type="text"
              placeholder="Location"
              value={property.attributes[0]?.value || ""}
              onChange={e => handleAttributeChange(idx, 0, "value", e.target.value)}
              className="border p-1 rounded w-full"
              required
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1 font-semibold">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => handleImageChange(idx, e.target.files?.[0] ?? null)}
              required
            />
          </div>
          {properties.length > 1 && (
            <button type="button" className="text-red-600" onClick={() => removeProperty(idx)}>
              Remove Property
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={addProperty} className="bg-blue-100 px-4 py-2 rounded">
        + Add Another Property
      </button>
      <div>
        <button type="submit" disabled={minting} className="bg-blue-600 text-white px-6 py-2 rounded">
          {minting ? "Minting..." : "Mint Batch"}
        </button>
      </div>
      {error && <div className="text-red-600">Error: {error}</div>}
      {result && (
        <div className="bg-green-50 border p-4 mt-4 rounded">
          <div className="font-bold">Minted!</div>
          <div>Token ID: {result.tokenId}</div>
          <div>Serials: {result.serials?.join(", ")}</div>
          <div>Metadata URIs:</div>
          <ul className="list-disc pl-6">
            {result.metadataUris?.map((uri: string, i: number) => (
              <li key={i}><a href={`https://gateway.pinata.cloud/ipfs/${uri.replace('ipfs://','')}`} target="_blank" rel="noopener noreferrer">{uri}</a></li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}
