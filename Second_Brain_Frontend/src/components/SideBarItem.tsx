interface SideBarItemProps {
  text: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export function SideBarItem({ text, icon, active, onClick }: SideBarItemProps) {
  return (
    <div
      className={`flex items-center hover:bg-slate-200 transition-all duration-300 rounded-md cursor-pointer ${
        active ? 'bg-purple-100 border-l-4 border-purple-600' : ''
      }`}
      onClick={onClick}
    >
      <div className="p-2">{icon}</div>
      <div className={active ? 'font-semibold text-purple-600' : ''}>{text}</div>
    </div>
  );
}
