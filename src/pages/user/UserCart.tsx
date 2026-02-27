import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Trash2 } from "lucide-react";

const UserCart = () => {
  const { profileId } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    if (!profileId) return;
    const { data } = await supabase
      .from("cart_items")
      .select("*, products(name, price, vendor_id)")
      .eq("user_id", profileId);
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCart(); }, [profileId]);

  const removeItem = async (id: string) => {
    await supabase.from("cart_items").delete().eq("id", id);
    toast.success("Removed from cart");
    fetchCart();
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.products?.price || 0) * item.quantity, 0);

  const placeOrder = async () => {
    if (!profileId || items.length === 0) return;
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({ user_id: profileId, total_amount: totalAmount })
      .select()
      .single();
    if (orderError) { toast.error("Failed to place order"); return; }

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      vendor_id: item.products.vendor_id,
      quantity: item.quantity,
      price: item.products.price,
    }));
    await supabase.from("order_items").insert(orderItems);
    await supabase.from("cart_items").delete().eq("user_id", profileId);
    toast.success("Order placed!");
    navigate("/user/orders");
  };

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-primary p-4 text-primary-foreground">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate("/user")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">Cart</h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-6 space-y-4">
        <Card>
          <CardHeader><CardTitle>Your Cart</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : items.length === 0 ? (
              <p className="text-muted-foreground">Cart is empty.</p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.products?.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>Rs/- {item.products?.price}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="destructive" onClick={() => removeItem(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-lg font-bold">Total: Rs/- {totalAmount.toFixed(2)}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate("/user")}>Cancel</Button>
                    <Button onClick={placeOrder}>Place Order</Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UserCart;
