import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../theme';

export function FilterIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18">
      <Path d="M3 5h12M5.5 9h7M8 13h2" fill="none" stroke={colors.ink} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function ActivityIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path d="M4 7h16M4 12h16M4 17h10" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function AgentsIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Circle cx={12} cy={9} r={4} fill="none" stroke={color} strokeWidth={2} />
      <Path d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function CardsIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Rect x={3} y={6} width={18} height={13} rx={3} fill="none" stroke={color} strokeWidth={2} />
      <Path d="M3 10.5h18" fill="none" stroke={color} strokeWidth={2} />
    </Svg>
  );
}

export function CloseIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12">
      <Path d="m2 2 8 8M10 2l-8 8" fill="none" stroke={colors.subtle} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function CheckIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16">
      <Path
        d="M3.428 8.342l2.972 2.858L12.572 4.914"
        fill="none"
        stroke={colors.accent}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ArrowIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22">
      <Path
        d="M4 11h13m-5-5 5 5-5 5"
        fill="none"
        stroke={colors.bg}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
