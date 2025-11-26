import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'student'
  });
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRoleChange = (value) => {
    setFormData({ ...formData, role: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await register(formData);
    if (success) {
      navigate('/login');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Enter your information to get started
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input 
                id="full_name" 
                value={formData.full_name}
                onChange={handleChange}
                required 
                data-testid="register-name-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                value={formData.email}
                onChange={handleChange}
                required 
                data-testid="register-email-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={formData.password}
                onChange={handleChange}
                required 
                data-testid="register-password-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">I am a</Label>
              <Select onValueChange={handleRoleChange} defaultValue="student">
                <SelectTrigger data-testid="register-role-select">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="admin">Mess Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={loading} data-testid="register-submit-button">
              {loading ? "Creating account..." : "Create account"}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline" data-testid="register-login-link">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Register;
