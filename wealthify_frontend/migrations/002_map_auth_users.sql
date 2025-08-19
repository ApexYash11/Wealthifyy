-- Add supabase_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS supabase_id uuid UNIQUE;

-- Create trigger function to sync Supabase auth with users table
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
BEGIN
    -- Create a new user record if it doesn't exist
    INSERT INTO public.users (
        email,
        username,
        supabase_id,
        created_at,
        savings_goal,
        current_savings
    ) 
    VALUES (
        NEW.email,
        split_part(NEW.email, '@', 1),  -- Use email prefix as username
        NEW.id,
        NEW.created_at,
        10000.0,  -- Default savings goal
        0.0       -- Default current savings
    )
    ON CONFLICT (supabase_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ language plpgsql security definer;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
