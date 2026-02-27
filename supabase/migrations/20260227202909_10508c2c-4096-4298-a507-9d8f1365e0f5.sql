
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'vendor', 'user');

-- Create membership type enum
CREATE TYPE public.membership_type AS ENUM ('6_months', '1_year', '2_years');

-- Create membership status enum
CREATE TYPE public.membership_status AS ENUM ('active', 'expired', 'cancelled');

-- Create order status enum
CREATE TYPE public.order_status AS ENUM ('pending', 'processing', 'completed', 'cancelled');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Vendor categories
CREATE TABLE public.vendor_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);

-- Seed default categories
INSERT INTO public.vendor_categories (name) VALUES ('Catering'), ('Florist'), ('Decoration'), ('Lighting');

-- Vendor memberships
CREATE TABLE public.vendor_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  membership_type membership_type NOT NULL DEFAULT '6_months',
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ NOT NULL,
  status membership_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.vendor_categories(id),
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cart items
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status order_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  vendor_id UUID REFERENCES public.profiles(id) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- Guest list
CREATE TABLE public.guest_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT,
  rsvp_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_list ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE p.auth_id = _user_id AND ur.role = _role
  )
$$;

-- Get profile id from auth id
CREATE OR REPLACE FUNCTION public.get_profile_id(_auth_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE auth_id = _auth_id LIMIT 1
$$;

-- RLS: profiles
CREATE POLICY "Anyone authenticated can view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth_id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth_id = auth.uid());
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS: user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = public.get_profile_id(auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS: vendor_categories (public read)
CREATE POLICY "Anyone can view categories" ON public.vendor_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.vendor_categories FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update categories" ON public.vendor_categories FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete categories" ON public.vendor_categories FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS: vendor_memberships
CREATE POLICY "View own or admin memberships" ON public.vendor_memberships FOR SELECT TO authenticated USING (vendor_id = public.get_profile_id(auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert memberships" ON public.vendor_memberships FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update memberships" ON public.vendor_memberships FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS: products (public read, vendor manage own)
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Vendors can insert own products" ON public.products FOR INSERT TO authenticated WITH CHECK (vendor_id = public.get_profile_id(auth.uid()) AND public.has_role(auth.uid(), 'vendor'));
CREATE POLICY "Vendors can update own products" ON public.products FOR UPDATE TO authenticated USING (vendor_id = public.get_profile_id(auth.uid()) AND public.has_role(auth.uid(), 'vendor'));
CREATE POLICY "Vendors can delete own products" ON public.products FOR DELETE TO authenticated USING (vendor_id = public.get_profile_id(auth.uid()) AND public.has_role(auth.uid(), 'vendor'));

-- RLS: cart_items (user manages own)
CREATE POLICY "Users manage own cart" ON public.cart_items FOR SELECT TO authenticated USING (user_id = public.get_profile_id(auth.uid()));
CREATE POLICY "Users can add to cart" ON public.cart_items FOR INSERT TO authenticated WITH CHECK (user_id = public.get_profile_id(auth.uid()));
CREATE POLICY "Users can update cart" ON public.cart_items FOR UPDATE TO authenticated USING (user_id = public.get_profile_id(auth.uid()));
CREATE POLICY "Users can remove from cart" ON public.cart_items FOR DELETE TO authenticated USING (user_id = public.get_profile_id(auth.uid()));

-- RLS: orders
CREATE POLICY "Users view own orders or admin" ON public.orders FOR SELECT TO authenticated USING (user_id = public.get_profile_id(auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (user_id = public.get_profile_id(auth.uid()));
CREATE POLICY "Users can update own pending orders" ON public.orders FOR UPDATE TO authenticated USING (user_id = public.get_profile_id(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

-- RLS: order_items
CREATE POLICY "View own order items" ON public.order_items FOR SELECT TO authenticated USING (
  order_id IN (SELECT id FROM public.orders WHERE user_id = public.get_profile_id(auth.uid()))
  OR public.has_role(auth.uid(), 'admin')
  OR vendor_id = public.get_profile_id(auth.uid())
);
CREATE POLICY "Insert order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (
  order_id IN (SELECT id FROM public.orders WHERE user_id = public.get_profile_id(auth.uid()))
);

-- RLS: guest_list
CREATE POLICY "Users manage own guest list" ON public.guest_list FOR SELECT TO authenticated USING (user_id = public.get_profile_id(auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can add guests" ON public.guest_list FOR INSERT TO authenticated WITH CHECK (user_id = public.get_profile_id(auth.uid()));
CREATE POLICY "Users can update guests" ON public.guest_list FOR UPDATE TO authenticated USING (user_id = public.get_profile_id(auth.uid()));
CREATE POLICY "Users can delete guests" ON public.guest_list FOR DELETE TO authenticated USING (user_id = public.get_profile_id(auth.uid()));

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (auth_id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), NEW.email);
  
  -- Auto-assign role based on metadata
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    (SELECT id FROM public.profiles WHERE auth_id = NEW.id),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'user')
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
