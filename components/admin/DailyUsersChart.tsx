"use client";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DailyUsersChart({ data }: any) {
  return (
    <div className="bg-white p-8 rounded-[40px] shadow-xl">
      <h3 className="text-xl font-black mb-6">Daily New Users</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="_id" />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#5D5FEF" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
