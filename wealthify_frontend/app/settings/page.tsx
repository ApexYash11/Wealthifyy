"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import authAPI from '@/lib/auth-api';

const SettingsPage = () => {
  const [user, setUser] = useState<{ name: string; email: string; joined: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'profile' | 'security' | 'contact'>('profile');

  useEffect(() => {
    const fetchUser = async () => {
      const userInfo = await authAPI.getCurrentUser();
      if (userInfo) {
        setUser({
          name: userInfo.user_metadata?.name || userInfo.email,
          email: userInfo.email,
          joined: userInfo.id ? new Date(parseInt(userInfo.id.substring(0,8), 16) * 1000).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '',
        });
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await authAPI.logout();
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = '/login';
  };

  const handleChangePassword = () => {
    // Placeholder: In production, open a modal or redirect to password reset
    alert('Password reset link sent to your email!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e1021] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e1021] flex flex-col items-center">
      {/* Top Navigation Tabs */}
      <div className="w-full flex justify-center pt-8 pb-4">
        <div className="flex gap-2 md:gap-4 bg-transparent rounded-xl">
          <button
            className={`px-6 py-2 rounded-xl font-medium text-base md:text-lg focus:outline-none border-2 shadow-md flex items-center gap-2 ${tab === 'profile' ? 'bg-[#181c36] text-white border-[#23244a]' : 'bg-transparent text-zinc-300 border-transparent hover:bg-[#181c36] hover:text-white transition'}`}
            style={tab === 'profile' ? {boxShadow:'0 2px 8px #0002'} : {}}
            onClick={() => setTab('profile')}
          >
            <span className="inline-block"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5.121 17.804A13.937 13.937 0 0 1 12 16c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" strokeLinecap="round" strokeLinejoin="round"/></svg></span> Profile
          </button>
          <button
            className={`px-6 py-2 rounded-xl font-medium text-base md:text-lg focus:outline-none border-2 shadow-md flex items-center gap-2 ${tab === 'security' ? 'bg-[#181c36] text-white border-[#23244a]' : 'bg-transparent text-zinc-300 border-transparent hover:bg-[#181c36] hover:text-white transition'}`}
            style={tab === 'security' ? {boxShadow:'0 2px 8px #0002'} : {}}
            onClick={() => setTab('security')}
          >
            Privacy &amp; Security
          </button>
          <button
            className={`px-6 py-2 rounded-xl font-medium text-base md:text-lg focus:outline-none border-2 shadow-md flex items-center gap-2 ${tab === 'contact' ? 'bg-[#181c36] text-white border-[#23244a]' : 'bg-transparent text-zinc-300 border-transparent hover:bg-[#181c36] hover:text-white transition'}`}
            style={tab === 'contact' ? {boxShadow:'0 2px 8px #0002'} : {}}
            onClick={() => setTab('contact')}
          >
            Contact Us
          </button>
        </div>
      </div>

      {/* Main Content */}
      {tab === 'profile' && (
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl px-4 md:px-0 justify-center items-start mt-4">
          {/* Profile Card */}
          <div className="flex-1 max-w-xs rounded-2xl bg-[#111426] border border-[#23244a] flex flex-col items-center justify-center p-8 shadow-lg" style={{minWidth:'300px'}}>
            <div className="rounded-full bg-[#181c36] w-28 h-28 flex items-center justify-center mb-6">
              <User className="h-16 w-16 text-orange-400" />
            </div>
            <div className="text-3xl font-bold text-orange-400 mb-2 text-center">{user?.name}</div>
            <div className="text-lg text-zinc-200 mb-1 text-center">{user?.email}</div>
            <div className="text-zinc-400 text-center">Joined {user?.joined}</div>
          </div>
          {/* Info Card */}
          <div className="flex-1 max-w-2xl rounded-2xl bg-[#111426] border border-[#23244a] p-10 shadow-lg flex flex-col justify-center" style={{minWidth:'340px'}}>
            <div className="text-3xl font-bold text-white mb-6">Profile</div>
            <div className="text-lg text-zinc-200 mb-6">
              <span className="font-semibold block mb-2">User Info</span>
              <div className="mb-1">Name: <span className="font-medium text-white">{user?.name}</span></div>
              <div className="mb-1">Email: <span className="font-medium text-white">{user?.email}</span></div>
              <div className="mt-2 text-zinc-400">Joined {user?.joined}</div>
            </div>
            <Button
              variant="destructive"
              className="mt-2 w-40 text-lg font-semibold flex items-center gap-2 justify-center"
              onClick={handleLogout}
              style={{background:'#b91c1c', borderRadius:'0.75rem', fontWeight:600, fontSize:'1.1rem'}}
            >
              <LogOut className="h-5 w-5" /> Sign Out
            </Button>
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className="w-full max-w-2xl mt-8 bg-[#111426] border border-[#23244a] rounded-2xl p-10 shadow-lg flex flex-col items-center">
          <div className="text-3xl font-bold text-white mb-6">Privacy &amp; Security</div>
          <div className="text-lg text-zinc-200 mb-6 text-center">Your privacy and data security are our top priorities. Here’s how we keep your information safe:</div>
          <ul className="list-disc text-zinc-200 text-base pl-6 mb-4 self-start">
            <li className="mb-2">Your financial data is encrypted and securely stored.</li>
            <li className="mb-2">We never share your personal information with third parties.</li>
            <li className="mb-2">All account activity is protected by industry-standard security protocols.</li>
            <li className="mb-2">You have full control over your data and privacy settings.</li>
            <li className="mb-2">Regular security audits keep your information safe.</li>
          </ul>
          <div className="text-zinc-400 text-sm mt-2 text-center">If you have any security concerns, please contact our support team.</div>
        </div>
      )}

      {tab === 'contact' && (
        <div className="w-full max-w-2xl mt-8 bg-[#111426] border border-[#23244a] rounded-2xl p-10 shadow-lg flex flex-col items-center">
          <div className="text-3xl font-bold text-white mb-6">Contact Us</div>
          <div className="text-lg text-zinc-200 mb-4 text-center">For any queries, feedback, or support, please contact us at:</div>
          <div className="text-xl font-semibold text-orange-400 select-all">wealthify.service@gmail.com</div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;