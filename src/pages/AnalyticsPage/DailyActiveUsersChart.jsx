import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CHART_KEYBOARD_HINT, useChartTheme } from '../../styles/chartTheme';
import { formatDate, formatShortDate } from '../../utils/formatDate';

/** @param {{ data: { date: string, value: number }[] }} props */
function DailyActiveUsersChart({ data }) {
  const { colors, axisTick, tooltip } = useChartTheme();

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart
        data={data}
        margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
        title="Daily active users line chart"
        desc={CHART_KEYBOARD_HINT}
      >
        <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatShortDate}
          tick={axisTick}
          tickLine={false}
          axisLine={{ stroke: colors.grid }}
          minTickGap={24}
        />
        <YAxis tick={axisTick} tickLine={false} axisLine={false} width={40} />
        <Tooltip
          {...tooltip}
          cursor={{ stroke: colors.grid }}
          labelFormatter={formatDate}
          formatter={(value) => [value, 'Active users']}
        />
        <Line
          type="monotone"
          dataKey="value"
          name="Active users"
          stroke={colors.primary}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, stroke: colors.surface }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default DailyActiveUsersChart;
