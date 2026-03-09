import type { ComponentType } from "react";

export type PortalRole = "client" | "freelancer";

export type Experience = {
  title: string;
  company: string;
  startDate: Date | string;
  endDate?: Date | string | null;
};

export type FreelancerSkill = {
  id?: string;
  freelancerId?: string;
  skillId: string;
  score?: number;
  validated?: boolean;
  lastTestedAt?: Date | string;
  expiresAt?: Date | string;
  updatedAt?: Date | string;
};

export type Role = "freelancer" | "client" | "admin";
export type UserStatus = "active" | "blocked";

export type User = {
  id: string;
  userId: string;
  subscriptionId?: string;
  role: Role;
  name: string;
  email: string;
  isPremium: boolean;
  status: UserStatus;
  createdAt: Date | string;
};

export type FreelancerProfile = {
  id: string;
  userId: string;
  imageUrl: string;
  jobCategory: string;
  jobSubCategory: string;
  bio: string;
  availability: string;
  location: string;
  experience: Experience[];
  portfolioUrl: string;
  skills?: FreelancerSkill[];
  updatedAt: Date | string;
  user: User;
};

export type RoleProfilePortalProps = {
  role: PortalRole;
  user: FreelancerProfile;
};

export type NavItem = {
  label: string;
  icon: ComponentType<{ className?: string }>;
  active?: boolean;
};

export type EditSection = "profile" | "about" | "portfolio" | "experience" | "skills" | null;
