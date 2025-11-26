import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { IndianRupee, ArrowDownToLine } from 'lucide-react';

const VendorWithdrawals = () => {
  const { API } = useAuth();
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchWallet = async () => {
    try {
      const res = await axios.get(`${API}/wallet/`);
      setWallet(res.data);
    } catch (error) {
      console.error("Error fetching wallet", error);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/wallet/withdraw`, {
        amount: parseFloat(amount)
      });
      toast.success("Withdrawal request submitted!");
      setAmount('');
      fetchWallet();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  // Filter only withdrawal transactions
  const withdrawals = wallet.transactions.filter(tx => tx.type === 'withdrawal');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Weekly Withdrawals</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Request Withdrawal</CardTitle>
            <CardDescription>Convert your credits to Rupees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="text-sm text-green-600 font-medium">Available Balance</div>
              <div className="text-3xl font-bold text-green-700 flex items-center">
                <IndianRupee size={24} />
                {wallet.balance.toFixed(2)}
              </div>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount to Withdraw (₹)</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  min="1"
                  max={wallet.balance}
                  placeholder="0.00" 
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || wallet.balance <= 0}>
                {loading ? "Processing..." : "Withdraw Funds"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Withdrawal History</CardTitle>
            <CardDescription>Past weekly settlements</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{new Date(tx.timestamp).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Processed
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{tx.amount}
                    </TableCell>
                  </TableRow>
                ))}
                {withdrawals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No withdrawals yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorWithdrawals;
