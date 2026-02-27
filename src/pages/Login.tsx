import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("admin");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("All fields are required");
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("Logged in successfully");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="rounded-lg bg-primary p-4 text-center">
          <h1 className="text-2xl font-bold text-primary-foreground">Event Management System</h1>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="admin">Admin</TabsTrigger>
            <TabsTrigger value="vendor">Vendor</TabsTrigger>
            <TabsTrigger value="user">User</TabsTrigger>
          </TabsList>

          {["admin", "vendor", "user"].map((role) => (
            <TabsContent key={role} value={role}>
              <Card>
                <CardHeader>
                  <CardTitle className="capitalize">{role} Login</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">User Id (Email)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={`${role}@example.com`}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/")}>
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <button className="text-primary underline" onClick={() => navigate("/signup/user")}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
