import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const AdminStats = () => {
  const { API } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API}/analytics/monthly`);
        setData(res.data);
      } catch (error) {
        console.error("Error fetching stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API]);

  if (loading) return <div>Loading statistics...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Monthly Statistics</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Complaints Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Complaints Received</CardTitle>
            <CardDescription>Monthly trend of student complaints</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="complaints" fill="#ef4444" name="Complaints" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Food Saved Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Food Saved (kg)</CardTitle>
            <CardDescription>Impact of meal skipping feature</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="food_saved_kg" fill="#22c55e" name="Food Saved (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hygiene Rating Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Hygiene Rating Trend</CardTitle>
            <CardDescription>Average hygiene score (out of 5)</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="hygiene_rating" stroke="#3b82f6" strokeWidth={2} name="Hygiene Rating" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminStats;
