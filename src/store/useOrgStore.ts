import { create } from 'zustand';
import type { Organization, UserProfile } from '@/lib/types';

interface OrgState {
  organization: Organization | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  setOrganization: (org: Organization | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useOrgStore = create<OrgState>((set) => ({
  organization: null,
  userProfile: null,
  isLoading: true,
  setOrganization: (organization) => set({ organization }),
  setUserProfile: (userProfile) => set({ userProfile }),
  setLoading: (isLoading) => set({ isLoading }),
}));

