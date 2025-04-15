
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Wallet, 
  Receipt, 
  LayoutDashboard,
  Webhook,
  Settings,
  Users,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { testWorkerConnection } from '../services/shopifyWorker';

interface PlatformStatus {
  name: string;
  isConnected: boolean;
  error?: string;
}

interface SidebarProps {
  onCloseMobile?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const location = useLocation();
  const [platformStatuses, setPlatformStatuses] = useState<PlatformStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const testConnections = async () => {
    try {
      const platforms = ['Shopify', 'Facebook'];
      const statuses = await Promise.all(
        platforms.map(async (platform) => {
          try {
            switch (platform) {
              case 'Shopify':
                const shopifyResult = await testWorkerConnection();
                return {
                  name: platform,
                  isConnected: shopifyResult.isConnected,
                  error: !shopifyResult.isConnected ? shopifyResult.error : undefined
                };

              case 'Facebook':
                const fbResponse = await fetch(
                  `https://graph.facebook.com/v19.0/debug_token?input_token=${import.meta.env.VITE_FB_ACCESS_TOKEN}&access_token=${import.meta.env.VITE_FB_ACCESS_TOKEN}`
                );
                return {
                  name: platform,
                  isConnected: fbResponse.ok,
                  error: !fbResponse.ok ? 'Failed to connect' : undefined
                };

              default:
                return {
                  name: platform,
                  isConnected: false,
                  error: 'Unknown platform'
                };
            }
          } catch (error) {
            return {
              name: platform,
              isConnected: false,
              error: error instanceof Error ? error.message : 'Connection failed'
            };
          }
        })
      );

      setPlatformStatuses(statuses);
    } catch (error) {
      console.error('Error checking platform connections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testConnections();
    const interval = setInterval(testConnections, 300000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const getWebhookStatus = () => {
    if (isLoading) return null;
    
    const allConnected = platformStatuses.every(p => p.isConnected);
    const anyDisconnected = platformStatuses.some(p => !p.isConnected);
    
    if (allConnected) return { icon: CheckCircle, color: 'text-green-400' };
    if (anyDisconnected) return { icon: XCircle, color: 'text-red-400' };
    return null;
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: `/` },
    { icon: Wallet, label: 'Wallets', path: `/wallets` },
    { icon: Receipt, label: 'Transactions', path: `/transactions` },
    { 
      icon: Webhook, 
      label: 'Webhooks', 
      path: `/webhooks`,
      status: getWebhookStatus()
    },
    { icon: Users, label: 'Employees', path: `/employees` },
    { icon: Settings, label: 'Cost Settings', path: `/cost-settings` }
  ];

  const handleNavClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  // Helper function to check if a route is active
  const isRouteActive = (path: string) => {
    // Exact match for dashboard route
    if (path === `/` && location.pathname === path) {
      return true;
    }
    
    // For other routes, check if the current path starts with the menu item path
    // This prevents dashboard from being highlighted when on other pages
    if (path !== `/`) {
      return location.pathname.startsWith(path);
    }
    
    return false;
  };

  return (
    <div className="bg-gray-900 text-white w-64 h-full min-h-screen px-4 py-6">
      <div className="flex items-center mb-8 px-2">
        <img 
          src="https://cdn.shopify.com/s/files/1/0668/4396/7665/files/Logos_6ec5eb45-f5e0-437d-a920-52dfd5cb8ca7.webp?v=1742442431"
          alt="Taqcare Logo"
          className="w-8 h-8 mr-2 object-contain"
        />
        <span className="text-xl font-bold">Taqcare BR</span>
      </div>
      
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg transition-colors ${
                isRouteActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span className="flex-1">{item.label}</span>
            {item.status && (
              <item.status.icon className={`w-4 h-4 ${item.status.color}`} />
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
