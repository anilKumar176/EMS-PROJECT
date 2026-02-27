import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ShoppingCart } from "lucide-react";

const UserVendors = () => {
  const { profileId } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("vendor_categories").select("*").then(({ data }) => {
      setCategories(data || []);
    });
  }, []);

  useEffect(() => {
    let query = supabase.from("products").select("*, profiles!products_vendor_id_fkey(name), vendor_categories(name)").eq("is_active", true);
    if (selectedCategory !== "all") {
      query = query.eq("category_id", selectedCategory);
    }
    query.then(({ data }) => {
      setProducts(data || []);
      setLoading(false);
    });
  }, [selectedCategory]);

  const addToCart = async (productId: string) => {
    if (!profileId) return;
    const { error } = await supabase.from("cart_items").insert({
      user_id: profileId,
      product_id: productId,
      quantity: 1,
    });
    if (error) toast.error("Failed to add to cart");
    else toast.success("Added to cart!");
  };

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-primary p-4 text-primary-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={() => navigate("/user")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold">Browse Vendors</h1>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate("/user/cart")}>
            <ShoppingCart className="mr-2 h-4 w-4" /> Cart
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6 space-y-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Card>
          <CardHeader><CardTitle>Products</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : products.length === 0 ? (
              <p className="text-muted-foreground">No products found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.profiles?.name}</TableCell>
                      <TableCell>{p.vendor_categories?.name}</TableCell>
                      <TableCell>Rs/- {p.price}</TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => addToCart(p.id)}>
                          Add to Cart
                        </Button>
                      </TableCell>
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

export default UserVendors;
