import React, { useState } from 'react';
import { User, Lock, Bell, Globe, Palette, Database } from 'lucide-react';

export function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'security', icon: Lock, label: 'Security' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'general', icon: Globe, label: 'General' },
    { id: 'appearance', icon: Palette, label: 'Appearance' },
    { id: 'backup', icon: Database, label: 'Backup' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2 text-gray-800">Settings</h1>
        <p className="text-gray-600">Manage your system preferences and configurations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl text-gray-800">Profile Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Full Name</label>
                    <input
                      type="text"
                      defaultValue="Admin User"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Email</label>
                    <input
                      type="email"
                      defaultValue="admin@school.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Phone</label>
                    <input
                      type="tel"
                      defaultValue="+91 9876543210"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Role</label>
                    <input
                      type="text"
                      value="Administrator"
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                  Save Changes
                </button>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl text-gray-800">Security Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Current Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Confirm Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                  Update Password
                </button>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl text-gray-800">Notification Preferences</h2>
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-800">Email Notifications</p>
                      <p className="text-xs text-gray-500">Receive notifications via email</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-800">SMS Notifications</p>
                      <p className="text-xs text-gray-500">Receive notifications via SMS</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-800">Push Notifications</p>
                      <p className="text-xs text-gray-500">Receive browser push notifications</p>
                    </div>
                  </label>
                </div>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                  Save Preferences
                </button>
              </div>
            )}

            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-xl text-gray-800">General Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">School Name</label>
                    <input
                      type="text"
                      defaultValue="Delhi Public School"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Academic Year</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                      <option>2025-2026</option>
                      <option>2026-2027</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Timezone</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                      <option>Asia/Kolkata (IST)</option>
                      <option>UTC</option>
                    </select>
                  </div>
                </div>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                  Save Settings
                </button>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-xl text-gray-800">Appearance</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Theme</label>
                    <div className="grid grid-cols-3 gap-4">
                      <button className="p-4 border-2 border-blue-600 rounded-lg bg-blue-50">
                        <p className="text-sm text-gray-800">Light</p>
                      </button>
                      <button className="p-4 border border-gray-300 rounded-lg">
                        <p className="text-sm text-gray-800">Dark</p>
                      </button>
                      <button className="p-4 border border-gray-300 rounded-lg">
                        <p className="text-sm text-gray-800">Auto</p>
                      </button>
                    </div>
                  </div>
                </div>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                  Apply Theme
                </button>
              </div>
            )}

            {activeTab === 'backup' && (
              <div className="space-y-6">
                <h2 className="text-xl text-gray-800">Backup & Restore</h2>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">Last backup: April 5, 2026 at 10:30 AM</p>
                  </div>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                    Create Backup
                  </button>
                  <button className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition ml-3">
                    Restore from Backup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
