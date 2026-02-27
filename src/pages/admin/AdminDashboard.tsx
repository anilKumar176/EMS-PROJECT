import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManageMemberships } from "@/components/admin/ManageMemberships";
import { ManageUsers } from "@/components/admin/ManageUsers";
import { LogOut, Settings } from "lucide-react";

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const [tab, setTab] = useState("memberships");

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-primary p-4 text-primary-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <h1 className="text-xl font-bold">Admin — Maintenance Menu</h1>
          </div>
          <Button variant="secondary" size="sm" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Log Out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="memberships">Memberships</TabsTrigger>
            <TabsTrigger value="users">Users & Vendors</TabsTrigger>
          </TabsList>

          <TabsContent value="memberships">
            <ManageMemberships />
          </TabsContent>
          <TabsContent value="users">
            <ManageUsers />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
