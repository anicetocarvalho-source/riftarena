-- 1. Drop the overly permissive SELECT policy on profiles
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- 2. Create new policy that only allows authenticated users to view profiles
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 3. Also add a policy so users can always see their own profile even if not fully authenticated
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);