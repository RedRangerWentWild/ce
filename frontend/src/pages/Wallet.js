import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet as WalletIcon, ArrowRightLeft, QrCode } from 'lucide-react';
import { toast } from 'sonner';

const Wallet = () => {
  const { API } = useAuth();
  const [data, setData] = useState({ balance: 0, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [payOpen, setPayOpen] = useState(false);
  const [payData, setPayData] = useState({ vendor_id: '', amount: '' });
  const [payLoading, setPayLoading] = useState(false);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API}/wallet/`);
      setData(res.data);
    } catch (error) {
      console.error("Error fetching wallet", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePay = async (e) => {
    e.preventDefault();
    setPayLoading(true);
    try {
      await axios.post(`${API}/wallet/pay`, {
        vendor_id: payData.vendor_id,
        amount: parseFloat(payData.amount)
      });
      toast.success("Payment successful!");
      setPayOpen(false);
      setPayData({ vendor_id: '', amount: '' });
      fetchData(); // Refresh balance
    } catch (error) {
      toast.error(error.response?.data?.detail || "Payment failed");
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WalletIcon /> My Wallet
            </CardTitle>
            <CardDescription className="text-primary-foreground/80">Current Balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{data.balance.toFixed(2)} Credits</div>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-center items-center p-6">
          <Dialog open={payOpen} onOpenChange={setPayOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full h-full text-lg gap-2">
                <QrCode /> Pay Vendor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Pay Vendor</DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePay} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vendor_id">Vendor</Label>
                  <Select
                    value={payData.vendor_id}
                    onValueChange={(value) => setPayData({ ...payData, vendor_id: value })}
                  >
                    <SelectTrigger id="vendor_id">
                      <SelectValue placeholder="Select a vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ChaiAdda">ChaiAdda</SelectItem>
                      <SelectItem value="CCD">CCD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    min="1"
                    placeholder="0.00" 
                    value={payData.amount}
                    onChange={e => setPayData({...payData, amount: e.target.value})}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={payLoading}>
                    {payLoading ? "Processing..." : "Confirm Payment"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft size={20} /> Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{new Date(tx.timestamp).toLocaleDateString()}</TableCell>
                  <TableCell className="capitalize">{tx.type.replace('_', ' ')}</TableCell>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell className={`text-right font-medium ${
                    tx.type === 'vendor_payment' ? 'text-red-500' : 'text-green-600'
                  }`}>
                    {tx.type === 'vendor_payment' ? '-' : '+'}{tx.amount}
                  </TableCell>
                </TableRow>
              ))}
              {data.transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No transactions yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Wallet;
