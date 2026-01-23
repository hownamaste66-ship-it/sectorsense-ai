import {
  Cpu,
  HeartPulse,
  Landmark,
  ShoppingCart,
  Zap,
  Factory,
  Building,
  Gem,
  Radio,
  Package,
  Plug,
  Brain,
  Building2,
  type LucideIcon,
} from 'lucide-react';

export const iconMap: Record<string, LucideIcon> = {
  cpu: Cpu,
  'heart-pulse': HeartPulse,
  landmark: Landmark,
  'shopping-cart': ShoppingCart,
  zap: Zap,
  factory: Factory,
  building: Building,
  gem: Gem,
  radio: Radio,
  package: Package,
  plug: Plug,
  brain: Brain,
  'building-2': Building2,
};

export function getIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || Building2;
}
