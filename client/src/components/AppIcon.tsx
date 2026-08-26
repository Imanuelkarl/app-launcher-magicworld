import { AppWindow, Boxes, Globe2, MonitorDown } from 'lucide-react'; import type { AppType } from '../types';
const icons = { web: Globe2, desktop: MonitorDown, mobile: AppWindow, service: Boxes };
export function AppIcon({ type, large = false }: { type: AppType; large?: boolean }) { const Icon = icons[type]; return <div className={`grid place-items-center rounded-xl bg-gradient-to-br from-magic to-violet-400 text-white ${large ? 'h-16 w-16' : 'h-11 w-11'}`}><Icon size={large ? 30 : 21}/></div>; }
