import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogOut, Store, ShoppingCart, Users, ClipboardList } from "lucide-react";

const UserDashboard = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { label: "Vendor", icon: Store, path: "/user/vendors" },
    { label: "Cart", icon: ShoppingCart, path: "/user/cart" },
    { label: "Guest List", icon: Users, path: "/user/guests" },
    { label: "Order Status", icon: ClipboardList, path: "/user/orders" },
  ];

  return (
    <div className="min-h-screen bg-muted">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-8 p-6">
        <div className="w-full max-w-lg rounded-lg bg-primary p-6 text-center">
          <h1 className="text-2xl font-bold text-primary-foreground">WELCOME USER</h1>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {menuItems.map((item) => (
            <Button
              key={item.label}
              size="lg"
              className="h-auto min-w-[150px] flex-col gap-2 py-6"
              onClick={() => navigate(item.path)}
            >
              <item.icon className="h-6 w-6" />
              {item.label}
            </Button>
          ))}
        </div>

        <Button variant="default" size="lg" onClick={signOut}>
          <LogOut className="mr-2 h-5 w-5" /> LogOut
        </Button>
      </div>
    </div>
  );
};

export default UserDashboard;
