'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

const jobData = [
  { name: 'Plumbing', value: 45, color: COLORS[0] },
  { name: 'Electrical', value: 32, color: COLORS[1] },
  { name: 'AC', value: 18, color: COLORS[2] },
  { name: 'Cleaning', value: 25, color: COLORS[3] },
];

const workerData = [
  { month: 'Jan', jobs: 45, earnings: 6750 },
  { month: 'Feb', jobs: 52, earnings: 8320 },
  { month: 'Mar', jobs: 48, earnings: 7200 },
  { month: 'Apr', jobs: 61, earnings: 9150 },
  { month: 'May', jobs: 55, earnings: 8250 },
  { month: 'Jun', jobs: 58, earnings: 8700 },
];

export function AnalyticsChart() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Jobs by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={jobData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {jobData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Monthly Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={workerData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="jobs" fill="#3B82F6" name="Jobs" />
            <Bar dataKey="earnings" fill="#10B981" name="Earnings (TND)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
