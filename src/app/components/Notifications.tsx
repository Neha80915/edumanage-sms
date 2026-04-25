import React from 'react';
import { Bell, Info, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { mockNotifications } from '../data/mockData';

export function Notifications() {
  const notifications = mockNotifications;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2 text-gray-800">Notifications</h1>
        <p className="text-gray-600">View all system notifications and alerts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Total Notifications</h3>
          <p className="text-3xl text-gray-800">{notifications.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Read</h3>
          <p className="text-3xl text-gray-800">{notifications.filter(n => n.read).length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Unread</h3>
          <p className="text-3xl text-gray-800">{notifications.filter(n => !n.read).length}</p>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`border rounded-xl p-6 ${getBgColor(notification.type)} ${
              !notification.read ? 'border-l-4' : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">{getIcon(notification.type)}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-gray-800">{notification.title}</h3>
                  <span className="text-xs text-gray-500">
                    {new Date(notification.date).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{notification.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
