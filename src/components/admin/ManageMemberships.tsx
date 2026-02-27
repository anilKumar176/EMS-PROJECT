import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type MembershipDuration = "6_months" | "1_year" | "2_years";

export function ManageMemberships() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [duration, setDuration] = useState<MembershipDuration>("6_months");
  const [loading, setLoading] = useState(false);

  // For update tab
  const [membershipNumber, setMembershipNumber] = useState("");
  const [foundMembership, setFoundMembership] = useState<any>(null);
  const [updateAction, setUpdateAction] = useState<"extend" | "cancel">("extend");
  const [extendDuration, setExtendDuration] = useState<MembershipDuration>("6_months");

  const fetchData = async () => {
    const { data: vendorProfiles } = await supabase
      .from("user_roles")
      .select("user_id, profiles(id, name, email)")
      .eq("role", "vendor");
    setVendors(vendorProfiles?.map((v: any) => v.profiles) || []);

    const { data: mems } = await supabase
      .from("vendor_memberships")
      .select("*, profiles(name, email)")
      .order("created_at", { ascending: false });
    setMemberships(mems || []);
  };

  useEffect(() => { fetchData(); }, []);

  const addMembership = async () => {
    if (!selectedVendor) { toast.error("Select a vendor"); return; }
    setLoading(true);
    const now = new Date();
    const months = duration === "6_months" ? 6 : duration === "1_year" ? 12 : 24;
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + months);

    const { error } = await supabase.from("vendor_memberships").insert({
      vendor_id: selectedVendor,
      membership_type: duration,
      start_date: now.toISOString(),
      end_date: endDate.toISOString(),
    });
    if (error) toast.error(error.message);
    else { toast.success("Membership added"); fetchData(); }
    setLoading(false);
  };

  const searchMembership = async () => {
    if (!membershipNumber.trim()) { toast.error("Enter membership number"); return; }
    const { data } = await supabase
      .from("vendor_memberships")
      .select("*, profiles(name, email)")
      .eq("id", membershipNumber.trim())
      .single();
    if (data) setFoundMembership(data);
    else { toast.error("Membership not found"); setFoundMembership(null); }
  };

  const updateMembership = async () => {
    if (!foundMembership) return;
    setLoading(true);
    if (updateAction === "cancel") {
      await supabase.from("vendor_memberships").update({ status: "cancelled" }).eq("id", foundMembership.id);
      toast.success("Membership cancelled");
    } else {
      const months = extendDuration === "6_months" ? 6 : extendDuration === "1_year" ? 12 : 24;
      const newEnd = new Date(foundMembership.end_date);
      newEnd.setMonth(newEnd.getMonth() + months);
      await supabase.from("vendor_memberships").update({
        end_date: newEnd.toISOString(),
        status: "active",
        membership_type: extendDuration,
      }).eq("id", foundMembership.id);
      toast.success("Membership extended");
    }
    setFoundMembership(null);
    setMembershipNumber("");
    fetchData();
    setLoading(false);
  };

  return (
    <Tabs defaultValue="add">
      <TabsList>
        <TabsTrigger value="add">Add Membership</TabsTrigger>
        <TabsTrigger value="update">Update Membership</TabsTrigger>
        <TabsTrigger value="list">All Memberships</TabsTrigger>
      </TabsList>

      <TabsContent value="add">
        <Card>
          <CardHeader><CardTitle>Add Membership</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Vendor</Label>
              <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                <SelectContent>
                  {vendors.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.name} ({v.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Duration</Label>
              <RadioGroup value={duration} onValueChange={(v) => setDuration(v as MembershipDuration)} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="6_months" id="6m" />
                  <Label htmlFor="6m">6 Months</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1_year" id="1y" />
                  <Label htmlFor="1y">1 Year</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2_years" id="2y" />
                  <Label htmlFor="2y">2 Years</Label>
                </div>
              </RadioGroup>
            </div>
            <Button onClick={addMembership} disabled={loading}>
              {loading ? "Adding..." : "Add Membership"}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="update">
        <Card>
          <CardHeader><CardTitle>Update Membership</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3 items-end">
              <div className="flex-1 space-y-1">
                <Label>Membership Number (ID)</Label>
                <Input value={membershipNumber} onChange={(e) => setMembershipNumber(e.target.value)} placeholder="Enter membership ID" />
              </div>
              <Button onClick={searchMembership}>Search</Button>
            </div>

            {foundMembership && (
              <div className="space-y-4 rounded-lg border p-4">
                <p><strong>Vendor:</strong> {foundMembership.profiles?.name}</p>
                <p><strong>Type:</strong> {foundMembership.membership_type}</p>
                <p><strong>Status:</strong> <Badge className="capitalize">{foundMembership.status}</Badge></p>
                <p><strong>Expires:</strong> {new Date(foundMembership.end_date).toLocaleDateString()}</p>

                <RadioGroup value={updateAction} onValueChange={(v) => setUpdateAction(v as any)} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="extend" id="extend" />
                    <Label htmlFor="extend">Extend</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cancel" id="cancel" />
                    <Label htmlFor="cancel">Cancel Membership</Label>
                  </div>
                </RadioGroup>

                {updateAction === "extend" && (
                  <RadioGroup value={extendDuration} onValueChange={(v) => setExtendDuration(v as MembershipDuration)} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="6_months" id="ext6" />
                      <Label htmlFor="ext6">6 Months</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1_year" id="ext1y" />
                      <Label htmlFor="ext1y">1 Year</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2_years" id="ext2y" />
                      <Label htmlFor="ext2y">2 Years</Label>
                    </div>
                  </RadioGroup>
                )}

                <Button onClick={updateMembership} disabled={loading}>
                  {loading ? "Updating..." : updateAction === "cancel" ? "Cancel Membership" : "Extend Membership"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="list">
        <Card>
          <CardHeader><CardTitle>All Memberships</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberships.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-xs">{m.id.slice(0, 8)}</TableCell>
                    <TableCell>{m.profiles?.name}</TableCell>
                    <TableCell className="capitalize">{m.membership_type?.replace("_", " ")}</TableCell>
                    <TableCell><Badge className="capitalize">{m.status}</Badge></TableCell>
                    <TableCell>{new Date(m.end_date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
