import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CHART_COLORS } from '../../styles/chartTheme';

const SLICE_COLORS = {
  New: CHART_COLORS.new,
  Returning: CHART_COLORS.returning,
  Deleted: CHART_COLORS.deleted,
};

const formatPercent = (fraction) => `${(fraction * 100).toFixed(1)}%`;

/** @param {{ data: { name: string, value: number }[] }} props */
function NewVsReturningChart({ data }) {
  const total = data.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          outerRadius="70%"
          label={({ percent }) => formatPercent(percent)}
        >
          {data.map((slice) => (
            <Cell key={slice.name} fill={SLICE_COLORS[slice.name] ?? CHART_COLORS.primary} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [
            `${value} users (${formatPercent(total ? value / total : 0)})`,
            name,
          ]}
        />
        <Legend verticalAlign="bottom" iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default NewVsReturningChart;
