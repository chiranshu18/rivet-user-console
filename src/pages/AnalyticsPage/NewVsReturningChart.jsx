import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useChartTheme } from '../../styles/chartTheme';

const formatPercent = (fraction) => `${(fraction * 100).toFixed(1)}%`;

/** @param {{ data: { name: string, value: number }[] }} props */
function NewVsReturningChart({ data }) {
  const { colors, tooltip } = useChartTheme();
  const sliceColors = { New: colors.new, Returning: colors.returning, Deleted: colors.deleted };
  const total = data.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          outerRadius="70%"
          stroke={colors.surface}
          label={({ percent }) => formatPercent(percent)}
        >
          {data.map((slice) => (
            <Cell key={slice.name} fill={sliceColors[slice.name] ?? colors.primary} />
          ))}
        </Pie>
        <Tooltip
          {...tooltip}
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
