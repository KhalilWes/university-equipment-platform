import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts'

const equipmentChartColors = {
  available: '#16a34a',
  reserved: '#d97706',
  maintenance: '#ea580c',
  broken: '#e11d48',
}

export default function EquipmentStatusChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          cx="50%"
          cy="50%"
          innerRadius={45}
          outerRadius={70}
          paddingAngle={2}
        >
          {data.map((item) => (
            <Cell
              key={item.id}
              fill={equipmentChartColors[item.id] || '#64748b'}
            />
          ))}
        </Pie>
        <Tooltip formatter={(value, _name, item) => [value, item?.payload?.label]} />
      </PieChart>
    </ResponsiveContainer>
  )
}
