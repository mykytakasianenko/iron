import * as SecureStore from "expo-secure-store";
import { File } from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";

export type Profile = {
  id: string;
  updated_at: string | null;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  website: string | null;
};

type ProfileState = {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;

  fetchProfile: (userId: string) => Promise<void>;
  createProfile: (profile: Omit<Profile, "updated_at">) => Promise<void>;
  updateProfileDb: (userId: string, updates: Partial<Omit<Profile, "id">>) => Promise<void>;
  deleteProfile: (userId: string) => Promise<void>;
  uploadAvatar: (userId: string, fileUri: string, fileType: string) => Promise<string | null>;
  deleteAvatar: (avatarUrl: string) => Promise<void>;

  setProfile: (profile: Profile) => void;
  updateProfile: (updates: Partial<Profile>) => void;
  clearProfile: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
};

export const useProfileStore = create(
  persist<ProfileState>(
    (set, get) => ({
      profile: null,
      isLoading: false,
      error: null,

      fetchProfile: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

          if (error) throw error;

          set({ profile: data, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      createProfile: async (profile) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("profiles")
            .insert([{ ...profile, updated_at: new Date().toISOString() }])
            .select()
            .single();

          if (error) throw error;

          set({ profile: data, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      updateProfileDb: async (userId: string, updates) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("profiles")
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq("id", userId)
            .select()
            .single();

          if (error) throw error;

          set({ profile: data, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      deleteProfile: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from("profiles")
            .delete()
            .eq("id", userId);

          if (error) throw error;

          set({ profile: null, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      uploadAvatar: async (userId: string, fileUri: string, fileType: string) => {
        set({ isLoading: true, error: null });
        try {
          const file = new File(fileUri);
          const base64 = await file.base64();

          const fileExt = fileType.split('/')[1] || 'jpg';
          const fileName = `${userId}-${Date.now()}.${fileExt}`;
          const filePath = `avatars/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('profiles')
            .upload(filePath, decode(base64), {
              contentType: fileType,
              upsert: true,
            });

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from('profiles')
            .getPublicUrl(filePath);

          await get().updateProfileDb(userId, { avatar_url: urlData.publicUrl });

          set({ isLoading: false });
          return urlData.publicUrl;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return null;
        }
      },

      deleteAvatar: async (avatarUrl: string) => {
        set({ isLoading: true, error: null });
        try {
          const urlParts = avatarUrl.split('/');
          const filePath = `avatars/${urlParts[urlParts.length - 1]}`;

          const { error } = await supabase.storage
            .from('profiles')
            .remove([filePath]);

          if (error) throw error;

          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      setProfile: (profile) => {
        set({ profile, error: null });
      },

      updateProfile: (updates) => {
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, ...updates, updated_at: new Date().toISOString() }
            : null,
        }));
      },

      clearProfile: () => {
        set({ profile: null, error: null });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },
    }),
    {
      name: "profile-state",
      storage: createJSONStorage(() => ({
        setItem: (key: string, value: string) =>
          SecureStore.setItemAsync(key, value),
        getItem: (key: string) => SecureStore.getItemAsync(key),
        removeItem: (key: string) => SecureStore.deleteItemAsync(key),
      })),
    }
  )
);