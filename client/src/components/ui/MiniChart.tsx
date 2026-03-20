import { ResponsiveContainer, LineChart, Line } from 'recharts'

export function MiniChart({
  data,
  color = '#00f0ff',
}: {
  data: number[]
  color?: string
}) {
  const chartData = data.map((value, i) => ({ i, value }))
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
