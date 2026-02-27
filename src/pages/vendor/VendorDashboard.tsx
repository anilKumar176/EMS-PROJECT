import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogOut, Package, PlusCircle, Receipt } from "lucide-react";

const VendorDashboard = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { label: "Your Items", icon: Package, path: "/vendor/items" },
    { label: "Add New Item", icon: PlusCircle, path: "/vendor/items/new" },
    { label: "Transactions", icon: Receipt, path: "/vendor/transactions" },
  ];

  return (
    <div className="min-h-screen bg-primary">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-8 p-6">
        <div className="w-full max-w-lg rounded-lg bg-secondary p-6 text-center">
          <h1 className="text-2xl font-bold text-secondary-foreground">Welcome</h1>
          <p className="text-lg text-muted-foreground">Vendor</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {menuItems.map((item) => (
            <Button
              key={item.label}
              variant="secondary"
              size="lg"
              className="h-auto min-w-[150px] flex-col gap-2 py-6"
              onClick={() => navigate(item.path)}
            >
              <item.icon className="h-6 w-6" />
              {item.label}
            </Button>
          ))}
          <Button
            variant="secondary"
            size="lg"
            className="h-auto min-w-[150px] flex-col gap-2 py-6"
            onClick={signOut}
          >
            <LogOut className="h-6 w-6" />
            LogOut
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
