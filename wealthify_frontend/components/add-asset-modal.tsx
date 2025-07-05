"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAsset: (asset: { name: string; symbol: string; quantity: number; buy_price: number; type: string; }) => void;
}

export default function AddAssetModal({ isOpen, onClose, onAddAsset }: AddAssetModalProps) {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [type, setType] = useState("crypto");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !symbol || !quantity || !buyPrice) return;
    onAddAsset({
      name,
      symbol,
      quantity: parseFloat(quantity),
      buy_price: parseFloat(buyPrice),
      type,
    });
    setName("");
    setSymbol("");
    setQuantity("");
    setBuyPrice("");
    setType("crypto");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Add New Asset
          </DialogTitle>
          <DialogDescription>Enter the details of your asset below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Bitcoin" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="symbol">Symbol</Label>
            <Input id="symbol" value={symbol} onChange={e => setSymbol(e.target.value)} placeholder="e.g., BTC" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input id="quantity" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="e.g., 1.5" min="0" step="any" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="buy_price">Buy Price ($)</Label>
            <Input id="buy_price" type="number" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} placeholder="e.g., 30000" min="0" step="any" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <select id="type" value={type} onChange={e => setType(e.target.value)} required className="w-full rounded border px-3 py-2 bg-black text-white">
              <option value="crypto">Crypto</option>
              <option value="stock">Stock</option>
              <option value="mutual_fund">Mutual Fund</option>
              <option value="cash">Cash</option>
            </select>
          </div>
          <DialogFooter className="pt-4">
            <Button type="submit">Add Asset</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 