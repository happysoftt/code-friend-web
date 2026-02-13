"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AnalyticsChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
        <XAxis 
            dataKey="name" 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
        />
        <YAxis 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            allowDecimals={false}
        />
        <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
            itemStyle={{ color: '#34d399' }}
            cursor={{ fill: '#334155', opacity: 0.4 }}
        />
        <Bar 
            dataKey="downloads" 
            fill="#10b981" 
            radius={[4, 4, 0, 0]} 
            barSize={40}
            name="จำนวนดาวน์โหลด"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}