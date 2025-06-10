
-- Drop ALL existing policies on chat-related tables
DROP POLICY IF EXISTS "Users can view participants of rooms they're in" ON public.chat_room_participants;
DROP POLICY IF EXISTS "Users can view chat room participants" ON public.chat_room_participants;
DROP POLICY IF EXISTS "Users can join chat rooms" ON public.chat_room_participants;
DROP POLICY IF EXISTS "Users can view their chat rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Users can create chat rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Users can update chat rooms they created" ON public.chat_rooms;
DROP POLICY IF EXISTS "Users can view messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages in rooms they participate in" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to rooms they participate in" ON public.messages;

-- Drop policies on other tables that might exist
DROP POLICY IF EXISTS "Users can view their friendships" ON public.friends;
DROP POLICY IF EXISTS "Users can create friend requests" ON public.friends;
DROP POLICY IF EXISTS "Users can update friend requests they're involved in" ON public.friends;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Enable RLS on all chat tables
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to check if user is participant in a chat room
CREATE OR REPLACE FUNCTION public.is_chat_participant(room_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_room_participants 
    WHERE room_id = room_uuid AND user_id = user_uuid
  );
$$;

-- Chat rooms policies
CREATE POLICY "Users can view chat rooms they participate in" 
  ON public.chat_rooms 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_room_participants 
      WHERE room_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chat rooms" 
  ON public.chat_rooms 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update chat rooms they created" 
  ON public.chat_rooms 
  FOR UPDATE 
  USING (auth.uid() = created_by);

-- Chat room participants policies
CREATE POLICY "Users can view participants of rooms they are in" 
  ON public.chat_room_participants 
  FOR SELECT 
  USING (
    public.is_chat_participant(room_id, auth.uid())
  );

CREATE POLICY "Users can join chat rooms" 
  ON public.chat_room_participants 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.chat_rooms 
      WHERE id = room_id AND created_by = auth.uid()
    )
  );

-- Messages policies
CREATE POLICY "Users can view messages in rooms they participate in" 
  ON public.messages 
  FOR SELECT 
  USING (
    public.is_chat_participant(room_id, auth.uid())
  );

CREATE POLICY "Users can send messages to rooms they participate in" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id AND 
    public.is_chat_participant(room_id, auth.uid())
  );

CREATE POLICY "Users can update their own messages" 
  ON public.messages 
  FOR UPDATE 
  USING (auth.uid() = sender_id);

-- Friends table policies
CREATE POLICY "Users can view their friendships" 
  ON public.friends 
  FOR SELECT 
  USING (
    auth.uid() = requester_id OR 
    auth.uid() = addressee_id
  );

CREATE POLICY "Users can create friend requests" 
  ON public.friends 
  FOR INSERT 
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update friend requests they are involved in" 
  ON public.friends 
  FOR UPDATE 
  USING (
    auth.uid() = requester_id OR 
    auth.uid() = addressee_id
  );

-- Profiles table policies
CREATE POLICY "Users can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);
