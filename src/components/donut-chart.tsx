import Svg, { Circle } from 'react-native-svg';

import { colors } from '@/theme';

type DonutSegment = {
  value: number;
  color: string;
};

export function DonutChart({ segments, size = 142, strokeWidth = 22 }: { segments: DonutSegment[]; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, segment) => sum + Math.max(segment.value, 0), 0);
  let offset = 0;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#E8D5B3"
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      {total <= 0 ? (
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.unvisited}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
        />
      ) : (
        segments.map((segment, index) => {
          const portion = Math.max(segment.value, 0) / total;
          const dashLength = circumference * portion;
          const dashOffset = -offset;
          offset += dashLength;

          return (
            <Circle
              key={`${segment.color}-${index}`}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={segment.color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="butt"
              rotation="-90"
              origin={`${size / 2}, ${size / 2}`}
            />
          );
        })
      )}
    </Svg>
  );
}

export function ProgressDonut({ percentage, size = 116 }: { percentage: number; size?: number }) {
  const radius = (size - 18) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, percentage));

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#E8D5B3" strokeWidth={18} fill="transparent" />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={colors.accentTeal}
        strokeWidth={18}
        fill="transparent"
        strokeDasharray={`${circumference * (progress / 100)} ${circumference}`}
        strokeLinecap="round"
        rotation="-90"
        origin={`${size / 2}, ${size / 2}`}
      />
    </Svg>
  );
}
