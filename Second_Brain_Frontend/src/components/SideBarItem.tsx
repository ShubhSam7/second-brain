export function SideBarItem({ text, icon }: any) {
  return (
    <div className="flex items-center hover:bg-slate-200 transition-all duration-300 rounded-md">
      <div className="p-2">{icon}</div> <div>{text}</div>
    </div>
  );
}
