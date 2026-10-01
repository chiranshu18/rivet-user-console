import { useMemo } from 'react';
import { useTheme } from '../theme/ThemeContext';

/** Screen-reader hint for recharts' keyboard support (charts are Tab stops; arrows move the tooltip). */
export const CHART_KEYBOARD_HINT =
  'Use the left and right arrow keys to move between data points; press Enter to show or hide details.';

const COLOR_VARIABLES = {
  primary: '--color-primary',
  grid: '--color-border',
  axis: '--color-text-muted',
  surface: '--color-surface',
  text: '--color-text',
  new: '--color-status-new',
  returning: '--color-status-returning',
  deleted: '--color-status-deleted',
};

/**
 * Chart colors and shared recharts styles for the active theme.
 * recharts takes colors as JS props, so they are read from the CSS variables in _themes.scss.
 */
export function useChartTheme() {
  const { theme } = useTheme();

  return useMemo(() => {
    const computed = getComputedStyle(document.documentElement);
    const colors = Object.fromEntries(
      Object.entries(COLOR_VARIABLES).map(([key, cssVar]) => [
        key,
        computed.getPropertyValue(cssVar).trim(),
      ])
    );

    return {
      colors,
      axisTick: { fontSize: 12, fill: colors.axis },
      tooltip: {
        contentStyle: {
          background: colors.surface,
          border: `1px solid ${colors.grid}`,
          borderRadius: 4,
          color: colors.text,
        },
        labelStyle: { color: colors.text },
      },
    };
    // `theme` is the trigger: the CSS variables change when it does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);
}
