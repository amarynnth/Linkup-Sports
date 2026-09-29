import { NavLink } from 'react-router-dom';
import { Compass, Plus, CalendarCheck, User, MessageCircle } from 'lucide-react';
import { useChat } from '../context/ChatContext';

const LEFT_ITEMS = [
  { to: '/', label: 'Discover', icon: Compass },
  { to: '/chat', label: 'Chat', icon: MessageCircle },
];
const RIGHT_ITEMS = [
  { to: '/my-games', label: 'Games', icon: CalendarCheck },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const { hasUnread } = useChat();

  return (
    <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-30 border-t border-line bg-surface/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-2">
        {LEFT_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} showDot={item.to === '/chat' && hasUnread} />
        ))}

        {/* Inline with the rest of the row (not elevated/floating) so it can
            never overlap a page's own fixed bottom bar, e.g. the chat composer. */}
        <NavLink
          to="/create"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lime text-void shadow-md shadow-lime/30 transition-transform active:scale-95"
        >
          <Plus size={22} strokeWidth={2.5} />
        </NavLink>

        {RIGHT_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </div>
    </nav>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
  showDot,
}: {
  to: string;
  label: string;
  icon: typeof Compass;
  showDot?: boolean;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative flex flex-col items-center gap-1 px-2.5 py-2 text-[10px] font-semibold transition-colors ${
          isActive ? 'text-lime' : 'text-ink-faint'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className="relative">
            <Icon size={21} strokeWidth={isActive ? 2.5 : 2} />
            {showDot && (
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-coral" />
            )}
          </span>
          {label}
        </>
      )}
    </NavLink>
  );
}
