"use client";

import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { TrendingUp, Pencil, Trash2 } from "lucide-react";
import { getAssets, addAsset, getPortfolioOverview, getPortfolioHistory, updateAsset, deleteAsset } from '../../lib/api';
import { Button } from '@/components/ui/button';
import AddAssetModal from '@/components/add-asset-modal';
import EditAssetModal from '@/components/EditAssetModal';
import { formatRupees } from '@/lib/utils';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { PieChart as PieIcon } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, ArcElement, Tooltip, Legend);

export default function InvestmentsPage() {
  const [assets, setAssets] = useState([]);
  const [overview, setOverview] = useState<any>(null);
  const [history, setHistory] = useState([]);
  const [token, setToken] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const t = localStorage.getItem('jwt');
    if (t) setToken(t);
  }, []);

  const refreshAssets = () => {
    if (token) {
      getAssets(token).then(setAssets);
      getPortfolioOverview(token).then(setOverview);
      getPortfolioHistory(token).then(setHistory);
    }
  };

  useEffect(() => {
    refreshAssets();
    // eslint-disable-next-line
  }, [token]);

  const handleAddAsset = async (asset: any) => {
    try {
      if (!token) return;
      await addAsset(asset, token);
      refreshAssets();
    } catch (error) {
      console.error('Error adding asset:', error);
    }
  };

  const handleEditAsset = async (asset: any) => {
    try {
      if (!token) return;
      await updateAsset(asset.id, asset, token);
      refreshAssets();
    } catch (error) {
      console.error('Error editing asset:', error);
    }
  };

  const handleDeleteAsset = async (assetId: number) => {
    try {
      if (!token) return;
      await deleteAsset(assetId, token);
      refreshAssets();
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Error deleting asset:', error);
    }
  };

  const handleSnapshot = async () => {
    if (!token) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/portfolio/snapshot`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      toast({ title: 'Snapshot taken!', description: 'Portfolio snapshot saved successfully.' });
      refreshAssets();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to take snapshot.', variant: 'destructive' });
    }
  };

  // Prepare data for charts
  const lineData = {
    labels: history.map((h: any) => new Date(h.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: 'Portfolio Value',
        data: history.map((h: any) => h.value),
        borderColor: '#4ade80',
        backgroundColor: 'rgba(74,222,128,0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const pieColors = [
    '#a259ff', '#6ec1e4', '#ffb366', '#b5ead7', '#f67280', '#355c7d',
    '#f8b195', '#c06c84', '#355c7d', '#2a363b', '#99b898', '#feceab',
  ];
  const pieData = {
    labels: assets.map((a: any) => a.name),
    datasets: [
      {
        data: assets.map((a: any) => a.quantity * a.buy_price),
        backgroundColor: assets.map((_, idx) => pieColors[idx % pieColors.length]),
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="flex flex-col gap-10 p-6 md:p-10 max-w-5xl mx-auto">
      {/* Portfolio Overview Card */}
      <Card className="bg-[#18181a] rounded-2xl shadow-xl p-8 flex flex-col md:flex-row md:items-center md:justify-between mb-2">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-400 p-3 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </span>
            <span className="text-2xl font-bold text-white tracking-tight">Portfolio Overview</span>
          </div>
          {overview ? (
            <div className="flex flex-col md:flex-row md:items-end gap-8">
              <div>
                <div className="text-gray-400 text-lg">Total Value</div>
                <div className="text-4xl font-extrabold text-white mb-2">{formatRupees(overview.total_value)}</div>
              </div>
              <div>
                <div className="text-gray-400 text-lg">Assets</div>
                <div className="text-4xl font-extrabold text-white mb-2">{assets.length}</div>
              </div>
              <div>
                <div className="text-gray-400 text-lg">Overall Gain/Loss</div>
                <div className={`text-3xl font-bold ${overview.gain_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>{overview.gain_loss >= 0 ? '+' : ''}{formatRupees(overview.gain_loss)}</div>
                <div className={`text-md font-semibold ${overview.percent_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>{overview.percent_change >= 0 ? '↑' : '↓'} {overview.percent_change.toFixed(1)}%</div>
              </div>
            </div>
          ) : <span className="text-gray-500">No data yet.</span>}
        </div>
        <div className="flex flex-col gap-4">
          <Button
            onClick={() => setModalOpen(true)}
            className="h-12 px-8 text-lg font-bold bg-gradient-to-r from-purple-600 to-purple-400 shadow-lg hover:from-purple-700 hover:to-purple-600 ml-0 md:ml-8 mt-8 md:mt-0"
          >
            Add Asset
          </Button>
          <Button
            onClick={handleSnapshot}
            className="h-12 px-8 text-lg font-bold bg-gradient-to-r from-green-600 to-green-400 shadow-lg hover:from-green-700 hover:to-green-600 ml-0 md:ml-8 mt-2 md:mt-2"
          >
            Take Snapshot Now
          </Button>
        </div>
      </Card>
      <AddAssetModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onAddAsset={handleAddAsset} />
      <EditAssetModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        asset={selectedAsset}
        onEditAsset={handleEditAsset}
      />

      {/* Asset Allocation Card */}
      <Card className="bg-[#18181a] rounded-2xl shadow-xl p-8 flex flex-col md:flex-row gap-8 items-center">
        <div className="w-full md:w-1/2 flex flex-col items-center">
          <h2 className="text-xl font-bold text-purple-300 mb-4 flex items-center gap-2">
            <span className="inline-block w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-purple-400 flex items-center justify-center"><PieIcon className="w-4 h-4 text-white" /></span>
            Asset Allocation
          </h2>
          {assets.length > 0 ? (
            <Pie data={pieData} options={{ plugins: { legend: { display: false } } }} />
          ) : <span className="text-gray-500">No assets yet.</span>}
        </div>
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          {assets.length > 0 ? assets.map((a: any, idx: number) => (
            <div key={a.id} className="flex items-center justify-between bg-[#232325] rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="inline-block w-4 h-4 rounded-full" style={{ backgroundColor: pieData.datasets[0].backgroundColor[idx % pieData.datasets[0].backgroundColor.length] }}></span>
                <span className="font-semibold text-white text-lg">{a.name}</span>
                <span className="text-gray-400 text-md">({a.symbol})</span>
              </div>
              <span className="font-bold text-white text-lg">{formatRupees(a.quantity * a.buy_price)}</span>
              <span className="flex gap-2 ml-4">
                <button
                  className="p-2 rounded hover:bg-purple-700/40 transition"
                  title="Edit"
                  onClick={() => { setSelectedAsset(a); setEditModalOpen(true); }}
                >
                  <Pencil className="w-5 h-5 text-purple-400" />
                </button>
                <button
                  className="p-2 rounded hover:bg-red-700/40 transition"
                  title="Delete"
                  onClick={() => setDeleteConfirmId(a.id)}
                >
                  <Trash2 className="w-5 h-5 text-red-400" />
                </button>
              </span>
              {/* Delete Confirmation Dialog */}
              {deleteConfirmId === a.id && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60">
                  <div className="bg-[#232325] rounded-lg p-6 shadow-xl flex flex-col items-center">
                    <p className="text-white mb-4">Are you sure you want to delete <span className="font-bold">{a.name} ({a.symbol})</span>?</p>
                    <div className="flex gap-4">
                      <Button variant="destructive" onClick={() => handleDeleteAsset(a.id)}>Delete</Button>
                      <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )) : null}
        </div>
      </Card>

      {/* Performance Tracking Card */}
      <Card className="bg-[#18181a] rounded-2xl shadow-xl p-8 flex flex-col items-center">
        <h2 className="text-xl font-bold text-green-400 mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6" /> Performance Tracking
        </h2>
        {history.length > 0 ? (
          <div className="w-full max-w-2xl">
            <Line data={lineData} options={{
              plugins: { legend: { labels: { color: '#fff' } } },
              scales: { x: { ticks: { color: '#fff' } }, y: { ticks: { color: '#fff' } } },
            }} />
            <table className="w-full mt-8 text-white">
              <thead>
                <tr>
                  <th className="text-purple-300 text-left text-lg">Date</th>
                  <th className="text-purple-300 text-left text-lg">Portfolio Value</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h: any, i: number) => (
                  <tr key={i}>
                    <td className="py-2 text-lg">{new Date(h.timestamp).toLocaleDateString()}</td>
                    <td className="py-2 text-lg">{formatRupees(h.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <span className="text-gray-500">No history yet.</span>}
      </Card>
    </div>
  );
} 