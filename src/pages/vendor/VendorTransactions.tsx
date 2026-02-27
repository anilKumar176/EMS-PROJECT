import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const VendorTransactions = () => {
  const { profileId } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileId) return;
    supabase
      .from("order_items")
      .select("*, orders(*), products(name)")
      .eq("vendor_id", profileId)
      .order("id")
      .then(({ data }) => {
        setItems(data || []);
        setLoading(false);
      });
  }, [profileId]);

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-primary p-4 text-primary-foreground">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate("/vendor")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">Transactions</h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6">
        <Card>
          <CardHeader><CardTitle>Order Items</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : items.length === 0 ? (
              <p className="text-muted-foreground">No transactions yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Order Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.products?.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>Rs/- {item.price}</TableCell>
                      <TableCell className="capitalize">{item.orders?.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default VendorTransactions;
