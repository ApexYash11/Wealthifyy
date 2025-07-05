"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { User, HelpCircle, Star, Lock, Eye, Database, Trash, Mail, AlertTriangle, Github, Users, MessageCircle, Palette, CheckCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import ThemeToggle from "@/components/ThemeToggle";

export default function SettingsPage() {
  const [tab, setTab] = useState("profile");
  const [theme, setTheme] = useState("system");
  const [accent, setAccent] = useState("purple");
  const { user, logout } = useAuth();
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleSendFeedback = async () => {
    if (!feedback.trim()) {
      toast({ title: "Please enter feedback before sending.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setShowSuccess(false);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: feedback }),
      });
      if (res.ok) {
        toast({ title: "Feedback sent! Thank you." });
        setFeedback("");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } else {
        toast({ title: "Failed to send feedback.", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error sending feedback.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 p-10 max-w-6xl mx-auto">
      {/* Theme Toggle - Top Right */}
      <div className="fixed top-4 right-4 z-50 md:hidden">
        <ThemeToggle />
      </div>
      
      {/* Sidebar */}
      <div className="flex flex-col gap-8 w-full md:w-1/3 max-w-xs">
        {/* Profile Summary */}
        <Card className="bg-[#111113] text-white shadow-lg p-8 rounded-2xl border border-[#232325] items-center flex flex-col">
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-full bg-[#232325] p-4 mb-2">
              <User className="w-12 h-12 text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-orange-300">{user?.name || 'User'}</div>
            <div className="text-gray-300"><a href={`mailto:${user?.email}`} className="hover:underline">{user?.email}</a></div>
            <div className="text-sm text-gray-400">Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-8">
        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="flex w-full justify-between bg-[#18181a] border border-[#232325] rounded-2xl mb-6 p-2">
            <TabsTrigger value="profile" className="flex items-center gap-2 text-lg px-4 py-2"><User className="w-5 h-5" /> Profile</TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2 text-lg px-4 py-2"><Lock className="w-5 h-5" /> Privacy & Security</TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2 text-lg px-4 py-2"><MessageCircle className="w-5 h-5" /> Contact Us</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="bg-[#111113] text-white shadow-lg p-8 rounded-2xl border border-[#232325] mb-8">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="mb-2 text-lg font-semibold">User Info</div>
                <div className="mb-1">Name: <span className="font-medium">{user?.name || 'User'}</span></div>
                <div className="mb-1">Email: <span className="font-medium"><a href={`mailto:${user?.email}`} className="hover:underline">{user?.email}</a></span></div>
                <div className="mb-1 text-sm text-gray-400">Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</div>
                <Button variant="destructive" className="flex items-center gap-2 text-lg mt-4" onClick={handleLogout}><AlertTriangle className="w-5 h-5" /> Sign Out</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy & Security Tab */}
          <TabsContent value="privacy">
            <Card className="bg-[#111113] text-white shadow-lg p-8 rounded-2xl border border-[#232325]">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Privacy & Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-lg font-semibold">Your Data & Privacy</div>
                <div className="text-gray-300">Your data is encrypted and never shared. You can export or delete your data at any time from your account settings. Wealthify is committed to keeping your information safe and private.</div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Us Tab */}
          <TabsContent value="contact">
            <Card className="bg-[#111113] text-white shadow-lg p-8 rounded-2xl border border-[#232325]">
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center gap-2"><HelpCircle className="w-6 h-6 text-yellow-300" /> Contact & Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-lg font-semibold">Need help or have feedback?</div>
                <div className="text-gray-300 mb-2">We're here to help! For any questions, support, or suggestions, reach out to:</div>
                <div className="mb-4">
                  <div className="font-semibold">Wealthify Service</div>
                  <div className="text-orange-400 font-medium"><a href="mailto:wealthify.service@gmail.com" className="hover:underline">wealthify.service@gmail.com</a></div>
                </div>
                <div>
                  <div className="mb-2 font-semibold">Send Feedback</div>
                  <Textarea
                    className="bg-[#18181a] text-white mb-2"
                    placeholder="Your feedback or message..."
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    disabled={loading || showSuccess}
                  />
                  <Button
                    className="bg-gradient-to-r from-purple-700 to-purple-500 text-white flex items-center justify-center"
                    onClick={handleSendFeedback}
                    disabled={loading || showSuccess}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2"><svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Sending...</span>
                    ) : showSuccess ? (
                      <span className="flex items-center gap-2 text-green-400"><CheckCircle className="h-5 w-5" /> Sent!</span>
                    ) : (
                      "Send"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 