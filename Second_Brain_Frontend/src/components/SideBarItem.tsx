interface SideBarItemProps {
  text: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export function SideBarItem({ text, icon, active, onClick }: SideBarItemProps) {
  return (
    <div
      className={`flex items-center cursor-pointer rounded-lg px-4 py-3 transition-all duration-300 ${
        active
          ? 'bg-accent-primary/10 text-accent-primary border-l-2 border-accent-primary'
          : 'text-text-secondary hover:bg-surface hover:text-text-primary'
      }`}
      onClick={onClick}
    >
      <div className="pr-3">{icon}</div>
      <div className={`font-medium ${active ? 'font-semibold' : ''}`}>{text}</div>
    </div>
  );
}
