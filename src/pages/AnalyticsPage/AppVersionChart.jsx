import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AXIS_TICK, CHART_COLORS } from '../../styles/chartTheme';
import styles from './AnalyticsPage.module.scss';

const MIN_BAR_SLOT_PX = 22;

/** @param {{ data: { version: string, count: number }[] }} props */
function AppVersionChart({ data }) {
  return (
    <div className={styles.horizontalScroll}>
      <div style={{ minWidth: data.length * MIN_BAR_SLOT_PX }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="version"
              interval={0}
              angle={-60}
              textAnchor="end"
              height={56}
              tick={{ ...AXIS_TICK, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: CHART_COLORS.grid }}
            />
            <YAxis
              allowDecimals={false}
              domain={[0, 'dataMax']}
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <Tooltip
              labelFormatter={(version) => `Version ${version}`}
              formatter={(value) => [value, 'Users']}
              cursor={{ fill: CHART_COLORS.grid, opacity: 0.5 }}
            />
            <Bar dataKey="count" name="Users" fill={CHART_COLORS.primary} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AppVersionChart;
