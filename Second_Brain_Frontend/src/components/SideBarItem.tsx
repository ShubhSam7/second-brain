interface SideBarItemProps {
  text: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export function SideBarItem({ text, icon, active, onClick }: SideBarItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
        ${active
          ? 'bg-neutral-900 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]'
          : 'text-neutral-400 hover:bg-neutral-900/50 hover:text-neutral-200'
        }
      `}
    >
      {/* Icon Wrapper to handle colors */}
      <span className={`transition-colors ${active ? 'text-orange-500' : 'group-hover:text-neutral-100'}`}>
        {icon}
      </span>

      {text}

      {/* Subtle Active Indicator (Right side dot) */}
      {active && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]"></div>
      )}
    </button>
  );
}
