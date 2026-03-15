'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import {
  LayoutDashboard,
  ShieldAlert,
  Users,
  MessageSquareWarning,
  Sparkles,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface SidebarProps {
  onLogout: () => void;
  queueCount?: number;
  appealCount?: number;
}

export default function Sidebar({ onLogout, queueCount, appealCount }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: 'Mod Queue',
      href: '/queue',
      icon: <ShieldAlert size={20} />,
      badge: queueCount,
    },
    {
      label: 'Users',
      href: '/users',
      icon: <Users size={20} />,
    },
    {
      label: 'Appeals',
      href: '/appeals',
      icon: <MessageSquareWarning size={20} />,
      badge: appealCount,
    },
    {
      label: 'Prompts',
      href: '/prompts',
      icon: <Sparkles size={20} />,
    },
  ];

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-brand-charcoal text-white flex flex-col transition-all duration-200 z-50',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-brand-rose flex items-center justify-center font-bold text-sm flex-shrink-0">
          MM
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-bold text-sm leading-tight">MitiMaiti</h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative group',
                isActive
                  ? 'bg-brand-rose text-white'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              )}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={cn(
                    'flex items-center justify-center text-[10px] font-bold rounded-full',
                    collapsed
                      ? 'absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white'
                      : 'ml-auto min-w-[20px] h-5 px-1 bg-red-500 text-white'
                  )}
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-white/10 p-2 space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-colors w-full"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          {!collapsed && <span>Collapse</span>}
        </button>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors w-full"
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
