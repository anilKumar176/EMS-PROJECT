import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const VendorAddItem = () => {
  const { profileId } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price.trim()) {
      toast.error("Product name and price are required");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("products").insert({
      vendor_id: profileId,
      name: name.trim(),
      price: parseFloat(price),
      image_url: imageUrl.trim() || null,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Product added!");
      navigate("/vendor/items");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-primary p-4 text-primary-foreground">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate("/vendor")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">Add New Item</h1>
        </div>
      </header>

      <main className="mx-auto max-w-xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>New Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name" required />
              </div>
              <div className="space-y-2">
                <Label>Product Price (Rs/-)</Label>
                <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" required />
              </div>
              <div className="space-y-2">
                <Label>Product Image URL</Label>
                <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Adding..." : "Add The Product"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default VendorAddItem;
