'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Home, Users, DollarSign, BarChart3, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileNavProps {
  isAdmin?: boolean;
  onLogout?: () => void;
  userName?: string;
}

export function MobileNav({ isAdmin = false, onLogout, userName }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    setOpen(false);
    onLogout?.();
  };

  return (
    <>
      {/* Mobile hamburger button - visible only on small screens */}
      <div className="md:hidden">
        <button
          onClick={() => setOpen(!open)}
          className="p-2 text-slate-300 hover:bg-slate-700 rounded"
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile menu sidebar */}
      <div
        className={`fixed left-0 top-16 bottom-0 w-64 bg-slate-800 border-r border-slate-700 z-50 md:hidden overflow-y-auto transition-transform ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="p-4 space-y-2">
          {isAdmin ? (
            <>
              <Link href="/admin" onClick={() => setOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-300 hover:bg-slate-700 gap-3"
                >
                  <BarChart3 size={20} />
                  Dashboard
                </Button>
              </Link>
              <Link href="/admin/members" onClick={() => setOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-300 hover:bg-slate-700 gap-3"
                >
                  <Users size={20} />
                  Members
                </Button>
              </Link>
              <Link href="/admin/payments" onClick={() => setOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-300 hover:bg-slate-700 gap-3"
                >
                  <DollarSign size={20} />
                  Payments
                </Button>
              </Link>
              <Link href="/admin/reports" onClick={() => setOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-300 hover:bg-slate-700 gap-3"
                >
                  <BarChart3 size={20} />
                  Reports
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" onClick={() => setOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-300 hover:bg-slate-700 gap-3"
                >
                  <Home size={20} />
                  Dashboard
                </Button>
              </Link>
              <Link href="/dashboard/pay" onClick={() => setOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-300 hover:bg-slate-700 gap-3"
                >
                  <DollarSign size={20} />
                  Pay
                </Button>
              </Link>
              <Link href="/dashboard/contributions" onClick={() => setOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-300 hover:bg-slate-700 gap-3"
                >
                  <BarChart3 size={20} />
                  Contributions
                </Button>
              </Link>
              <Link href="/dashboard/family" onClick={() => setOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-300 hover:bg-slate-700 gap-3"
                >
                  <Users size={20} />
                  Family
                </Button>
              </Link>
            </>
          )}

          <div className="border-t border-slate-700 my-4 pt-4">
            <div className="px-2 py-2 text-xs text-slate-400 mb-2">Account</div>
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:bg-slate-700 gap-3"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              Logout
            </Button>
          </div>
        </nav>
      </div>
    </>
  );
}

// Desktop navigation component
export function DesktopNav({ isAdmin = false, onLogout, userName }: MobileNavProps) {
  return (
    <div className="hidden md:flex items-center gap-4">
      <span className="text-slate-300 text-sm">{userName}</span>
      <nav className="flex gap-2">
        {isAdmin ? (
          <>
            <Link href="/admin">
              <Button variant="ghost" className="text-slate-300 hover:bg-slate-700">
                Dashboard
              </Button>
            </Link>
            <Link href="/admin/members">
              <Button variant="ghost" className="text-slate-300 hover:bg-slate-700">
                Members
              </Button>
            </Link>
            <Link href="/admin/payments">
              <Button variant="ghost" className="text-slate-300 hover:bg-slate-700">
                Payments
              </Button>
            </Link>
            <Link href="/admin/reports">
              <Button variant="ghost" className="text-slate-300 hover:bg-slate-700">
                Reports
              </Button>
            </Link>
          </>
        ) : (
          <>
            <Link href="/dashboard">
              <Button variant="ghost" className="text-slate-300 hover:bg-slate-700">
                Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/pay">
              <Button variant="ghost" className="text-slate-300 hover:bg-slate-700">
                Pay
              </Button>
            </Link>
            <Link href="/dashboard/contributions">
              <Button variant="ghost" className="text-slate-300 hover:bg-slate-700">
                Contributions
              </Button>
            </Link>
            <Link href="/dashboard/family">
              <Button variant="ghost" className="text-slate-300 hover:bg-slate-700">
                Family
              </Button>
            </Link>
          </>
        )}
      </nav>
      <Button
        onClick={onLogout}
        variant="outline"
        className="border-slate-600 text-slate-300 hover:bg-slate-700"
      >
        Logout
      </Button>
    </div>
  );
}
