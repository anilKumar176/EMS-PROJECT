import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, ShoppingBag } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary p-6">
      <div className="w-full max-w-lg space-y-8 text-center">
        <div className="space-y-3">
          <CalendarDays className="mx-auto h-16 w-16 text-primary-foreground" />
          <h1 className="text-4xl font-bold text-primary-foreground">
            Event Management System
          </h1>
          <p className="text-primary-foreground/80">
            Plan events, manage vendors, and organize everything in one place.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            size="lg"
            variant="secondary"
            className="w-full text-lg"
            onClick={() => navigate("/login")}
          >
            <Users className="mr-2 h-5 w-5" />
            Login
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate("/signup/user")}
            >
              Sign Up as User
            </Button>
            <Button
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate("/signup/vendor")}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Sign Up as Vendor
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
