import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader } from '../../ui/Card';

const data = [
  { name: 'Jan', vendors: 4 },
  { name: 'Feb', vendors: 3 },
  { name: 'Mar', vendors: 5 },
  { name: 'Apr', vendors: 4 },
  { name: 'May', vendors: 6 },
  { name: 'Jun', vendors: 8 },
  { name: 'Jul', vendors: 10 },
];

export function VendorGrowthChart() {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold">New Vendor Signups</h3>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="vendors" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
