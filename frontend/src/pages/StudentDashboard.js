import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import MealCard from '../components/MealCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Utensils } from 'lucide-react';
import { toast } from 'sonner';

const StudentDashboard = () => {
  const { API, user, refreshUser } = useAuth();
  const [meals, setMeals] = useState([]);
  const [selections, setSelections] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [mealsRes, selectionsRes] = await Promise.all([
        axios.get(`${API}/meals/`),
        axios.get(`${API}/meals/my-selections`)
      ]);
      
      setMeals(mealsRes.data);
      
      // Convert selections array to map for easier lookup
      const selMap = {};
      selectionsRes.data.forEach(s => {
        selMap[s.meal_id] = s;
      });
      setSelections(selMap);
      
    } catch (error) {
      console.error("Error fetching data", error);
      toast.error("Failed to load meals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggle = async (mealId, status) => {
    setActionLoading(true);
    try {
      await axios.post(`${API}/meals/${mealId}/select?status=${status}`);
      
      // Optimistic update
      setSelections(prev => ({
        ...prev,
        [mealId]: { ...prev[mealId], status }
      }));
      
      toast.success(status === 'skipped' ? "Meal skipped. Credits added!" : "Meal marked as attending.");

      // Refresh user so wallet_balance updates in the dashboard
      if (refreshUser) {
        await refreshUser();
      }
      
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to update selection");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading meals...</div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.wallet_balance?.toFixed(2)} Credits</div>
            <p className="text-xs text-muted-foreground">Available to spend</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meals This Week</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meals.length}</div>
            <p className="text-xs text-muted-foreground">Upcoming meals</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Upcoming Meals</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {meals.map(meal => (
            <MealCard 
              key={meal.id} 
              meal={meal} 
              selection={selections[meal.id]} 
              onToggle={handleToggle}
              loading={actionLoading}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
