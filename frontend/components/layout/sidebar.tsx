'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Building2,
  Briefcase,
  CheckSquare,
  FileText,
  Receipt,
  ScrollText,
  ShoppingCart,
  Target,
  DollarSign,
  Megaphone,
  Tag,
  Share2,
  LifeBuoy,
  BookOpen,
  FolderKanban,
  UserCog,
  Clock,
  CalendarDays,
  Banknote,
  UserSearch,
  Star,
  GraduationCap,
  TrendingDown,
  TrendingUp,
  PiggyBank,
  Landmark,
  BarChart3,
  Package,
  Layers,
  Warehouse,
  Archive,
  Truck,
  ClipboardList,
  FileQuestion,
  ShoppingBag,
  Cpu,
  FileStack,
  Calendar,
  MessageCircle,
  Bell,
  GitBranch,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/context';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  permission: string | null;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    group: 'CRM',
    items: [
      { label: 'Dashboard',  href: '/dashboard',  icon: LayoutDashboard, permission: null },
      { label: 'Contacts',   href: '/contacts',   icon: Users,           permission: 'contact.read' },
      { label: 'Leads',      href: '/leads',      icon: UserPlus,        permission: 'lead.read' },
      { label: 'Companies',  href: '/companies',  icon: Building2,       permission: 'company.read' },
      { label: 'Deals',      href: '/deals',      icon: Briefcase,       permission: 'deal.read' },
      { label: 'Activities', href: '/activities', icon: CheckSquare,     permission: 'activity.read' },
    ],
  },
  {
    group: 'Finance & Sales',
    items: [
      { label: 'Quotes',         href: '/quotes',            icon: FileText,    permission: 'quote.read' },
      { label: 'Invoices',       href: '/invoices',          icon: Receipt,     permission: 'invoice.read' },
      { label: 'Contracts',      href: '/contracts',         icon: ScrollText,  permission: 'contract.read' },
      { label: 'Sales Orders',   href: '/sales/orders',      icon: ShoppingCart,permission: 'sale.read' },
      { label: 'Sales Targets',  href: '/sales/targets',     icon: Target,      permission: 'sale.read' },
      { label: 'Commissions',    href: '/sales/commissions', icon: DollarSign,  permission: 'sale.read' },
    ],
  },
  {
    group: 'Marketing',
    items: [
      { label: 'Campaigns', href: '/marketing/campaigns', icon: Megaphone, permission: 'marketing.read' },
      { label: 'Coupons',   href: '/marketing/coupons',   icon: Tag,       permission: 'marketing.read' },
      { label: 'Referrals', href: '/marketing/referrals', icon: Share2,    permission: 'marketing.read' },
    ],
  },
  {
    group: 'Support',
    items: [
      { label: 'Tickets',        href: '/support/tickets',        icon: LifeBuoy, permission: 'ticket.read' },
      { label: 'Knowledge Base', href: '/support/knowledge-base', icon: BookOpen, permission: 'ticket.read' },
    ],
  },
  {
    group: 'Projects',
    items: [
      { label: 'Projects', href: '/projects', icon: FolderKanban, permission: 'project.read' },
    ],
  },
  {
    group: 'HR',
    items: [
      { label: 'Employees',    href: '/hrms/employees',   icon: UserCog,    permission: 'hr.read' },
      { label: 'Attendance',   href: '/hrms/attendance',  icon: Clock,      permission: 'hr.read' },
      { label: 'Leaves',       href: '/hrms/leaves',      icon: CalendarDays,permission: 'hr.read' },
      { label: 'Payroll',      href: '/hrms/payroll',     icon: Banknote,   permission: 'hr.read' },
      { label: 'Recruitment',  href: '/hr/recruitment',   icon: UserSearch, permission: 'hr.read' },
      { label: 'Reviews',      href: '/hr/reviews',       icon: Star,       permission: 'hr.read' },
      { label: 'Training',     href: '/hr/training',      icon: GraduationCap, permission: 'hr.read' },
    ],
  },
  {
    group: 'Finance',
    items: [
      { label: 'Expenses',      href: '/finance/expenses', icon: TrendingDown, permission: 'finance.read' },
      { label: 'Income',        href: '/finance/income',   icon: TrendingUp,   permission: 'finance.read' },
      { label: 'Budget',        href: '/finance/budget',   icon: PiggyBank,    permission: 'finance.read' },
      { label: 'Bank Accounts', href: '/finance/banks',    icon: Landmark,     permission: 'finance.read' },
      { label: 'Reports',       href: '/finance/reports',  icon: BarChart3,    permission: 'finance.read' },
    ],
  },
  {
    group: 'Inventory',
    items: [
      { label: 'Products',    href: '/inventory/products',    icon: Package,   permission: 'inventory.read' },
      { label: 'Categories',  href: '/inventory/categories',  icon: Layers,    permission: 'inventory.read' },
      { label: 'Warehouses',  href: '/inventory/warehouses',  icon: Warehouse, permission: 'inventory.read' },
      { label: 'Stock',       href: '/inventory/stock',       icon: Archive,   permission: 'inventory.read' },
    ],
  },
  {
    group: 'Procurement',
    items: [
      { label: 'Vendors',           href: '/procurement/vendors',   icon: Truck,        permission: 'procurement.read' },
      { label: 'Purchase Requests', href: '/procurement/requests',  icon: ClipboardList,permission: 'procurement.read' },
      { label: 'RFQs',              href: '/procurement/rfqs',      icon: FileQuestion, permission: 'procurement.read' },
      { label: 'Purchase Orders',   href: '/procurement/orders',    icon: ShoppingBag,  permission: 'procurement.read' },
    ],
  },
  {
    group: 'Other',
    items: [
      { label: 'Assets',         href: '/assets',        icon: Cpu,         permission: 'asset.read' },
      { label: 'Documents',      href: '/documents',     icon: FileStack,   permission: 'document.read' },
      { label: 'Calendar',       href: '/calendar',      icon: Calendar,    permission: 'calendar.read' },
      { label: 'Chat',           href: '/chat',          icon: MessageCircle, permission: 'chat.read' },
      { label: 'Announcements',  href: '/announcements', icon: Bell,        permission: 'chat.read' },
      { label: 'Workflows',      href: '/workflows',     icon: GitBranch,   permission: 'workflow.read' },
      { label: 'Reports',        href: '/reports',       icon: BarChart3,   permission: 'reports.view' },
    ],
  },
];

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout, hasPermission } = useAuth();

  // Filter each group's items by permission, then drop empty groups
  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) => item.permission === null || hasPermission(item.permission)
    ),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onToggle}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* Sidebar panel */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'fixed lg:static w-64 h-full bg-card border-r border-border z-40',
          'flex flex-col lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">C</span>
            </div>
            <span className="hidden sm:inline">CRM</span>
          </Link>
          <button onClick={onToggle} className="lg:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role badge */}
        {user && (
          <div className="mx-6 mb-4 px-3 py-2 rounded-lg bg-muted/30 border border-border/50 shrink-0">
            <p className="text-xs text-muted-foreground">Logged in as</p>
            <p className="text-sm font-semibold text-foreground capitalize">{user.role.displayName}</p>
          </div>
        )}

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 pb-2 space-y-4">
          {visibleGroups.map((group) => (
            <div key={group.group}>
              <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 select-none">
                {group.group}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  // Exact match for dashboard, prefix match for everything else
                  const isActive =
                    item.href === '/dashboard'
                      ? pathname === '/dashboard'
                      : pathname?.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-accent/10'
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 pt-2 pb-4 border-t border-border space-y-0.5 shrink-0">
          <Link
            href="/settings"
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium',
              pathname?.startsWith('/settings')
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-accent/10'
            )}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Settings</span>
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-foreground hover:bg-destructive/10 transition-all duration-200 text-sm font-medium"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>

        {/* User info */}
        {user && (
          <div className="px-6 py-3 border-t border-border text-xs text-muted-foreground shrink-0">
            <p className="font-medium text-foreground truncate">{user.name}</p>
            <p className="truncate">{user.email}</p>
          </div>
        )}
      </motion.aside>
    </>
  );
}
