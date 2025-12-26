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
        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
        ${active
          ? 'bg-neutral-900 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] border border-neutral-800/50'
          : 'text-neutral-400 hover:bg-neutral-900/50 hover:text-neutral-200 hover:border hover:border-neutral-800/30'
        }
      `}
    >
      {/* Subtle glow effect on active */}
      {active && (
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent rounded-xl pointer-events-none"></div>
      )}

      {/* Icon Wrapper to handle colors */}
      <span className={`transition-colors relative z-10 ${active ? 'text-orange-500' : 'group-hover:text-neutral-100'}`}>
        {icon}
      </span>

      <span className="relative z-10">{text}</span>

      {/* Subtle Active Indicator (Right side dot) with pulse animation */}
      {active && (
        <div className="ml-auto relative z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]"></div>
          <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping opacity-75"></div>
        </div>
      )}
    </button>
  );
}
