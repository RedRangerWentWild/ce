import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { AlertCircle, Upload } from 'lucide-react';

const Complaints = () => {
  const { API } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [formData, setFormData] = useState({
    category: 'hygiene',
    description: '',
    file: null
  });
  const [loading, setLoading] = useState(false);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get(`${API}/complaints/`);
      setComplaints(res.data);
    } catch (error) {
      console.error("Error fetching complaints", error);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const data = new FormData();
    data.append('category', formData.category);
    data.append('description', formData.description);
    if (formData.file) {
      data.append('file', formData.file);
    }

    try {
      await axios.post(`${API}/complaints/`, data);
      toast.success("Complaint submitted successfully");
      setFormData({ category: 'hygiene', description: '', file: null });
      fetchComplaints();
    } catch (error) {
      toast.error("Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Submit a Complaint</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(val) => setFormData({...formData, category: val})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hygiene">Hygiene Issue</SelectItem>
                  <SelectItem value="quality">Food Quality</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Describe the issue..." 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Photo Evidence (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="file" 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
                  className="cursor-pointer"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit Complaint"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">My Complaints</h2>
        {complaints.map((comp) => (
          <Card key={comp.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base capitalize flex items-center gap-2">
                  <AlertCircle size={16} className="text-amber-500" />
                  {comp.category}
                </CardTitle>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  comp.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {comp.status}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(comp.created_at).toLocaleDateString()}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{comp.description}</p>
              {comp.image_url && (
                <img 
                  src={`${process.env.REACT_APP_BACKEND_URL}${comp.image_url}`} 
                  alt="Evidence" 
                  className="mt-2 rounded-md w-full h-32 object-cover"
                />
              )}
            </CardContent>
          </Card>
        ))}
        {complaints.length === 0 && (
          <div className="text-center p-8 text-muted-foreground bg-muted/20 rounded-lg">
            No complaints submitted yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Complaints;
