import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Trash2, Plus } from "lucide-react";

const UserGuestList = () => {
  const { profileId } = useAuth();
  const navigate = useNavigate();
  const [guests, setGuests] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchGuests = async () => {
    if (!profileId) return;
    const { data } = await supabase.from("guest_list").select("*").eq("user_id", profileId).order("created_at");
    setGuests(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchGuests(); }, [profileId]);

  const addGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Guest name is required"); return; }
    await supabase.from("guest_list").insert({ user_id: profileId, guest_name: name.trim(), guest_email: email.trim() || null });
    setName(""); setEmail("");
    toast.success("Guest added");
    fetchGuests();
  };

  const deleteGuest = async (id: string) => {
    await supabase.from("guest_list").delete().eq("id", id);
    toast.success("Guest removed");
    fetchGuests();
  };

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-primary p-4 text-primary-foreground">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate("/user")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">Guest List</h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-6 space-y-4">
        <Card>
          <CardHeader><CardTitle>Add Guest</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={addGuest} className="flex gap-3 items-end">
              <div className="flex-1 space-y-1">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Guest name" required />
              </div>
              <div className="flex-1 space-y-1">
                <Label>Email</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="guest@email.com" />
              </div>
              <Button type="submit"><Plus className="mr-1 h-4 w-4" /> Add</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Guests ({guests.length})</CardTitle></CardHeader>
          <CardContent>
            {guests.length === 0 ? (
              <p className="text-muted-foreground">No guests added yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>RSVP</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guests.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell>{g.guest_name}</TableCell>
                      <TableCell>{g.guest_email || "—"}</TableCell>
                      <TableCell className="capitalize">{g.rsvp_status}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="destructive" onClick={() => deleteGuest(g.id)}>
                          <Trash2 className="h-4 w-4" />
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

export default UserGuestList;
