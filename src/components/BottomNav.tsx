import { NavLink } from 'react-router-dom';
import { Compass, Plus, CalendarCheck, User, MessageCircle } from 'lucide-react';

const ITEMS = [
  { to: '/', label: 'Discover', icon: Compass },
  { to: '/chat', label: 'Chat', icon: MessageCircle },
  { to: '/my-games', label: 'My Games', icon: CalendarCheck },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  return (
    <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-30 border-t border-line bg-surface/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-2">
        {ITEMS.slice(0, 2).map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        <NavLink
          to="/create"
          className="relative -mt-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-lime text-void shadow-lg shadow-lime/30 transition-transform active:scale-95"
        >
          <Plus size={26} strokeWidth={2.5} />
        </NavLink>

        {ITEMS.slice(2).map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </div>
    </nav>
  );
}

function NavItem({ to, label, icon: Icon }: { to: string; label: string; icon: typeof Compass }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 px-2.5 py-2 text-[10px] font-semibold transition-colors ${
          isActive ? 'text-lime' : 'text-ink-faint'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={21} strokeWidth={isActive ? 2.5 : 2} />
          {label}
        </>
      )}
    </NavLink>
  );
}
