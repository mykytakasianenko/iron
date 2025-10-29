import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Message {
  id: number;
  user_id: string;
  username: string;
  message: string;
  created_at: string;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  channel: RealtimeChannel | null;
  fetchMessages: () => Promise<void>;
  sendMessage: (userId: string, username: string, message: string) => Promise<void>;
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  channel: null,

  fetchMessages: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      set({ messages: data || [] });
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  sendMessage: async (userId: string, username: string, message: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            user_id: userId,
            username: username,
            message: message,
          },
        ]);

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  subscribeToMessages: () => {
    const channel = supabase
      .channel('global-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new as Message;
          set((state) => ({
            messages: [...state.messages, newMessage],
          }));
        }
      )
      .subscribe();

    set({ channel });
  },

  unsubscribeFromMessages: () => {
    const { channel } = get();
    if (channel) {
      supabase.removeChannel(channel);
      set({ channel: null });
    }
  },
}));