"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch } from "react-redux";
import {
  Bell,
  BriefcaseBusiness,
  CircleDollarSign,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquare,
  Pencil,
  Settings,
  ShieldCheck,
} from "lucide-react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Input,
  Label,
} from "@/components/atomic/atoms";
import { fetchSkillsByCategory } from "@/lib/api/freelancer/get-skills.api";
import { logOut } from "@/lib/api/auth/logout.api";
import { FREELANCER_JOB_CATEGORIES } from "@/lib/constants/freelancer-profile.constants";
import { ROUTES } from "@/lib/constants/routes.constants";
import { cn } from "@/lib/utils/utils";
import { clearUser } from "@/store/slices/user.slice";
import type {
  EditSection,
  Experience,
  FreelancerProfile,
  NavItem,
  RoleProfilePortalProps,
} from "./RoleProfilePortal.types";

const FREELANCER_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Find Work", icon: BriefcaseBusiness },
  { label: "My Proposals", icon: BriefcaseBusiness },
  { label: "Profile", icon: Mail, active: true },
  { label: "Messages", icon: MessageSquare },
  { label: "Settings", icon: Settings },
  { label: "Earnings", icon: CircleDollarSign },
  { label: "Active Contracts", icon: ShieldCheck },
];

const CLIENT_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "My Jobs", icon: BriefcaseBusiness },
  { label: "Contracts", icon: ShieldCheck },
  { label: "Profile", icon: Mail, active: true },
  { label: "Messages", icon: MessageSquare },
  { label: "Settings", icon: Settings },
  { label: "Payments", icon: CircleDollarSign },
];

const CATEGORY_OPTIONS = FREELANCER_JOB_CATEGORIES.map((category) => category.label);
const SUB_CATEGORY_OPTIONS_BY_CATEGORY = FREELANCER_JOB_CATEGORIES.reduce<Record<string, readonly string[]>>(
  (acc, category) => {
    acc[category.label] = category.subCategories;
    return acc;
  },
  {}
);

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  jobCategory: z
    .string()
    .min(2, "Job category is required")
    .refine((value) => CATEGORY_OPTIONS.includes(value), "Choose a valid category"),
  jobSubCategory: z.string().min(2, "Job sub-category is required"),
  location: z.string().min(2, "Location is required"),
}).superRefine((values, ctx) => {
  const validSubCategories = SUB_CATEGORY_OPTIONS_BY_CATEGORY[values.jobCategory] ?? [];
  if (!validSubCategories.includes(values.jobSubCategory)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Choose a valid sub-category",
      path: ["jobSubCategory"],
    });
  }
});

const aboutSchema = z.object({
  bio: z.string().min(20, "Bio must be at least 20 characters").max(500, "Bio must be under 500 characters"),
});

const portfolioSchema = z.object({
  portfolioUrl: z.string().url("Enter a valid URL"),
});

const experienceSchema = z
  .object({
    title: z.string().min(2, "Title is required"),
    company: z.string().min(2, "Company is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
  })
  .refine(
    (values) => {
      if (!values.endDate) {
        return true;
      }
      return new Date(values.endDate) >= new Date(values.startDate);
    },
    {
      message: "End date cannot be before start date",
      path: ["endDate"],
    }
  );

const MAX_SKILLS_PER_USER = 5;

const skillsSchema = z.object({
  skills: z
    .array(z.string())
    .min(1, "Select at least one skill")
    .max(MAX_SKILLS_PER_USER, `You can add up to ${MAX_SKILLS_PER_USER} skills only`),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type AboutFormValues = z.infer<typeof aboutSchema>;
type PortfolioFormValues = z.infer<typeof portfolioSchema>;
type ExperienceFormValues = z.infer<typeof experienceSchema>;
type SkillsFormValues = z.infer<typeof skillsSchema>;

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .slice(0, 2);
}

function toDate(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toInputDate(value: Date | string | null | undefined) {
  const date = toDate(value);
  if (!date) {
    return "";
  }
  return date.toISOString().slice(0, 10);
}

export default function RoleProfilePortal({ role, user }: RoleProfilePortalProps) {
  const router = useRouter();
  const dispatch = useDispatch();

  const [profile, setProfile] = useState<FreelancerProfile>(user);
  const [activeEditSection, setActiveEditSection] = useState<EditSection>(null);
  const [editingExperienceIndex, setEditingExperienceIndex] = useState<number | null>(null);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [skillsError, setSkillsError] = useState<string | null>(null);
  const [isSkillsLoading, setIsSkillsLoading] = useState(false);
  const [selectedProfileImage, setSelectedProfileImage] = useState<string | null>(null);
  const [pendingProfileImage, setPendingProfileImage] = useState<string | null>(null);

  useEffect(() => {
    setProfile(user);
  }, [user]);

  console.log(profile)
  const navItems = role === "freelancer" ? FREELANCER_NAV_ITEMS : CLIENT_NAV_ITEMS;
  const panelLabel = role === "freelancer" ? "Freelancer Portal" : "Client Portal";
  const displayName = profile.user.name ?? "User";
  const title = `${profile.jobCategory ?? 'nil'}  |  ${profile.jobSubCategory ?? 'nil'}`;

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: {
      name: profile.user.name ?? "",
      jobCategory: profile.jobCategory,
      jobSubCategory: profile.jobSubCategory,
      location: profile.location,
    },
  });

  const aboutForm = useForm<AboutFormValues>({
    resolver: zodResolver(aboutSchema),
    mode: "onChange",
    defaultValues: {
      bio: profile.bio,
    },
  });

  const portfolioForm = useForm<PortfolioFormValues>({
    resolver: zodResolver(portfolioSchema),
    mode: "onChange",
    defaultValues: {
      portfolioUrl: profile.portfolioUrl,
    },
  });

  const experienceForm = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    mode: "onChange",
    defaultValues: {
      title: profile.experience[0]?.title ?? "",
      company: profile.experience[0]?.company ?? "",
      startDate: toInputDate(profile.experience[0]?.startDate),
      endDate: toInputDate(profile.experience[0]?.endDate),
    },
  });

  const skillsForm = useForm<SkillsFormValues>({
    resolver: zodResolver(skillsSchema),
    mode: "onChange",
    defaultValues: {
      skills: profile.skills?.map((skill) => skill.skillId) ?? [],
    },
  });

  const selectedCategory = profileForm.watch("jobCategory");
  const selectedSkills = skillsForm.watch("skills");
  const availableSubCategories = useMemo(
    () => SUB_CATEGORY_OPTIONS_BY_CATEGORY[selectedCategory] ?? [],
    [selectedCategory]
  );

  useEffect(() => {
    const currentSubCategory = profileForm.getValues("jobSubCategory");
    if (!availableSubCategories.includes(currentSubCategory)) {
      profileForm.setValue("jobSubCategory", "", { shouldValidate: true });
    }
  }, [availableSubCategories, profileForm]);

  const openEditor = (section: Exclude<EditSection, null>) => {
    setActiveEditSection(section);

    if (section === "profile") {
      setPendingProfileImage(null);
      profileForm.reset({
        name: profile.user.name ?? "",
        jobCategory: profile.jobCategory,
        jobSubCategory: profile.jobSubCategory,
        location: profile.location,
      });
    }

    if (section === "about") {
      aboutForm.reset({ bio: profile.bio });
    }

    if (section === "portfolio") {
      portfolioForm.reset({ portfolioUrl: profile.portfolioUrl });
    }

    if (section === "experience") {
      setEditingExperienceIndex(null);
      experienceForm.reset({
        title: "",
        company: "",
        startDate: "",
        endDate: "",
      });
    }
  };

  const onOpenSkillsEditor = async () => {
    setSkillsError(null);
    setActiveEditSection("skills");

    if (!profile.jobCategory || !profile.jobSubCategory) {
      setSkillsError("Category and sub-category are required before editing skills.");
      skillsForm.reset({ skills: [] });
      return;
    }

    try {
      setIsSkillsLoading(true);
      const skills = await fetchSkillsByCategory(profile.jobSubCategory);

      setAvailableSkills(skills);
      const currentSkills = profile.skills?.map((skill) => skill.skillId) ?? [];
      const selectedSkills = currentSkills.filter((skill) => skills.includes(skill));
      skillsForm.reset({ skills: selectedSkills });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch skills";
      setSkillsError(message);
      setAvailableSkills([]);
      skillsForm.reset({ skills: [] });
    } finally {
      setIsSkillsLoading(false);
    }
  };

  const onLogoutHandler = async () => {
    try {
      await logOut();
    } finally {
      dispatch(clearUser());
      router.replace(ROUTES.SIGN_IN.ROOT);
    }
  };

  const onProfileSubmit = (values: ProfileFormValues) => {
      setProfile((prev) => ({
        ...prev,
        imageUrl: pendingProfileImage ?? prev.imageUrl,
        skills:
          prev.jobCategory !== values.jobCategory || prev.jobSubCategory !== values.jobSubCategory
            ? []
            : prev.skills,
        jobCategory: values.jobCategory,
        jobSubCategory: values.jobSubCategory,
        location: values.location,
      user: {
        ...prev.user,
        name: values.name,
      },
    }));
    setPendingProfileImage(null);
    setActiveEditSection(null);
  };

  const onProfileCancel = () => {
    if (pendingProfileImage?.startsWith("blob:")) {
      URL.revokeObjectURL(pendingProfileImage);
      if (selectedProfileImage === pendingProfileImage) {
        setSelectedProfileImage(null);
      }
    }
    setPendingProfileImage(null);
    setActiveEditSection(null);
  };

  const onAboutSubmit = (values: AboutFormValues) => {
    setProfile((prev) => ({ ...prev, bio: values.bio }));
    setActiveEditSection(null);
  };

  const onPortfolioSubmit = (values: PortfolioFormValues) => {
    setProfile((prev) => ({ ...prev, portfolioUrl: values.portfolioUrl }));
    setActiveEditSection(null);
  };

  const onEditExperience = (index: number) => {
    const selectedExperience = profile.experience[index];
    if (!selectedExperience) {
      return;
    }

    setEditingExperienceIndex(index);
    experienceForm.reset({
      title: selectedExperience.title,
      company: selectedExperience.company,
      startDate: toInputDate(selectedExperience.startDate),
      endDate: toInputDate(selectedExperience.endDate),
    });
  };

  const onAddExperience = () => {
    if (profile.experience.length >= 5) {
      return;
    }

    setEditingExperienceIndex(null);
    experienceForm.reset({
      title: "",
      company: "",
      startDate: "",
      endDate: "",
    });
  };

  const onExperienceSubmit = (values: ExperienceFormValues) => {
    setProfile((prev) => {
      const currentExperience = [...prev.experience];
      const nextExperienceItem: Experience = {
        title: values.title,
        company: values.company,
        startDate: new Date(values.startDate),
        endDate: values.endDate ? new Date(values.endDate) : null,
      };

      if (editingExperienceIndex === null) {
        if (currentExperience.length >= 5) {
          return prev;
        }
        currentExperience.push(nextExperienceItem);
      } else {
        currentExperience[editingExperienceIndex] = nextExperienceItem;
      }

      return {
        ...prev,
        experience: currentExperience,
      };
    });
    setEditingExperienceIndex(null);
    experienceForm.reset({
      title: "",
      company: "",
      startDate: "",
      endDate: "",
    });
  };

  const onSkillsSubmit = (values: SkillsFormValues) => {
    setProfile((prev) => {
      const existingSkills = new Map((prev.skills ?? []).map((skill) => [skill.skillId, skill]));
      const nextSkills = values.skills
        .slice(0, MAX_SKILLS_PER_USER)
        .map((skillId) => existingSkills.get(skillId) ?? { skillId });
      return {
        ...prev,
        skills: nextSkills,
      };
    });
    setActiveEditSection(null);
  };

  const onProfileImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedProfileImage((prev) => {
      if (prev?.startsWith("blob:")) {
        URL.revokeObjectURL(prev);
      }
      return objectUrl;
    });
    setPendingProfileImage((prev) => {
      if (prev?.startsWith("blob:")) {
        URL.revokeObjectURL(prev);
      }
      return objectUrl;
    });
    event.target.value = "";
  };

  useEffect(() => {
    return () => {
      if (selectedProfileImage?.startsWith("blob:")) {
        URL.revokeObjectURL(selectedProfileImage);
      }
    };
  }, [selectedProfileImage]);

  return (
    <div className="bg-muted/30 min-h-screen">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[220px_1fr]">
        <aside className="bg-card sticky top-0 hidden h-screen border-r lg:flex lg:flex-col">
          <div className="border-b px-4 py-5">
            <div className="flex items-center gap-1">
              <Image src="/logo.png" width={14} height={14} alt="Zephyr logo" />
              <p className="text-sm font-semibold">Zephyr</p>
            </div>
            <p className="text-muted-foreground text-xs">{panelLabel}</p>
          </div>

          <nav className="flex-1 space-y-1 px-2 py-4">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                className={cn(
                  "text-muted-foreground hover:text-foreground hover:bg-muted flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm",
                  item.active && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="border-t p-2">
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground w-full justify-start"
              onClick={onLogoutHandler}
            >
              <LogOut className="size-4" />
              Logout
            </Button>
          </div>
        </aside>

        <main className="flex min-h-screen flex-col">
          <header className="bg-card flex h-16 items-center justify-between border-b px-4 md:px-6">
            <div className="ml-auto flex items-center gap-3">
              <Button type="button" variant="ghost" size="icon" className="relative">
                <Bell className="size-4" />
                <span className="bg-destructive absolute top-2 right-2 size-2 rounded-full" />
              </Button>
              

              <span className="hidden text-sm font-medium md:inline">{displayName}</span>
              <span className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-full text-xs font-semibold">
                {getInitials(displayName) || "US"}
              </span>
            </div>
          </header>

          <div className="h-24 bg-gradient-to-r from-indigo-700 via-indigo-500 to-indigo-400" />

          <section className="-mt-10 space-y-4 px-4 pb-8 md:space-y-5 md:px-6">
            <Card className="overflow-hidden border-none shadow-md">
              <CardContent className="space-y-5 p-4 md:p-6">
                {activeEditSection === "profile" ? (
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="profile-image">Profile Picture</Label>
                        <div className="flex items-center gap-4">
                          <div className="ring-background relative size-16 overflow-hidden rounded-full ring-2">
                            <Image
                              src={pendingProfileImage || profile.imageUrl || "/logo.png"}
                              alt={displayName}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                          <Input id="profile-image" type="file" accept="image/*" onChange={onProfileImageChange} />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={profileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <Label htmlFor="profile-name">Name</Label>
                              <FormControl>
                                <Input id="profile-name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <Label htmlFor="profile-location">Location</Label>
                              <FormControl>
                                <Input id="profile-location" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="jobCategory"
                          render={({ field }) => (
                            <FormItem>
                              <Label htmlFor="profile-category">Category</Label>
                              <FormControl>
                                <select
                                  id="profile-category"
                                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                  value={field.value}
                                  onChange={field.onChange}
                                  onBlur={field.onBlur}
                                  name={field.name}
                                  ref={field.ref}
                                >
                                  <option value="">Select category</option>
                                  {FREELANCER_JOB_CATEGORIES.map((category) => (
                                    <option key={category.id} value={category.label}>
                                      {category.label}
                                    </option>
                                  ))}
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="jobSubCategory"
                          render={({ field }) => (
                            <FormItem>
                              <Label htmlFor="profile-sub-category">Sub-category</Label>
                              <FormControl>
                                <select
                                  id="profile-sub-category"
                                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                  value={field.value}
                                  onChange={field.onChange}
                                  onBlur={field.onBlur}
                                  name={field.name}
                                  ref={field.ref}
                                  disabled={availableSubCategories.length === 0}
                                >
                                  <option value="">Select sub-category</option>
                                  {availableSubCategories.map((subCategory) => (
                                    <option key={subCategory} value={subCategory}>
                                      {subCategory}
                                    </option>
                                  ))}
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit">Save</Button>
                        <Button type="button" variant="outline" onClick={onProfileCancel}>Cancel</Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="ring-background relative size-20 overflow-hidden rounded-full ring-4">
                          <Image
                            src={profile.imageUrl || "/avatar_default.png"}
                            alt={displayName}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>

                        <div>
                          <p className="text-base font-semibold">{displayName}</p>
                          <p className="text-muted-foreground text-sm">{title}</p>
                          <p className="text-muted-foreground mt-1 text-xs">{profile.location}</p>
                        </div>
                      </div>

                      <Button type="button" variant="outline" className="self-start" onClick={() => openEditor("profile")}>
                        <Pencil className="size-4" />
                        Edit
                      </Button>
                    </div>
                    <div className="grid gap-3 border-t pt-4 sm:grid-cols-3">
                      <div>
                        <p className="text-muted-foreground text-xs">Completed Jobs</p>
                        <p className="text-sm font-semibold">156</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Success Rate</p>
                        <p className="text-sm font-semibold">98%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Response Time</p>
                        <p className="text-sm font-semibold">2 hours</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">About</p>
                    <Button type="button" variant="ghost" size="icon" onClick={() => openEditor("about")}>
                      <Pencil className="text-muted-foreground size-3.5" />
                    </Button>
                  </div>

                  {activeEditSection === "about" ? (
                    <Form {...aboutForm}>
                      <form onSubmit={aboutForm.handleSubmit(onAboutSubmit)} className="space-y-3">
                        <FormField
                          control={aboutForm.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <Label htmlFor="about-bio">Bio</Label>
                              <FormControl>
                                <textarea
                                  id="about-bio"
                                  rows={4}
                                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-2">
                          <Button type="submit" disabled={!aboutForm.formState.isValid}>Save</Button>
                          <Button type="button" variant="outline" onClick={() => setActiveEditSection(null)}>Cancel</Button>
                        </div>
                      </form>
                    </Form>
                  ) : (
                    <p className="text-muted-foreground text-sm">{profile.bio ?? 'add a brief about you'}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Skills</p>
                    <Button type="button" variant="ghost" size="icon" onClick={onOpenSkillsEditor}>
                      <Pencil className="text-muted-foreground size-3.5" />
                    </Button>
                  </div>

                  {activeEditSection === "skills" ? (
                    <Form {...skillsForm}>
                      <form onSubmit={skillsForm.handleSubmit(onSkillsSubmit)} className="space-y-3">
                        {isSkillsLoading && <p className="text-muted-foreground text-sm">Loading skills...</p>}
                        {skillsError && <p className="text-xs text-red-500">{skillsError}</p>}

                        {!isSkillsLoading && !skillsError && (
                          <>
                            {availableSkills.length === 0 ? (
                              <p className="text-muted-foreground text-sm">No skills available for this sub-category.</p>
                            ) : (
                              <div className="space-y-2">
                                {availableSkills.map((skill) => {
                                  const isChecked = selectedSkills.includes(skill);
                                  const isLimitReached = selectedSkills.length >= MAX_SKILLS_PER_USER;

                                  return (
                                    <label key={skill} className="flex items-center gap-2 text-sm">
                                      <Checkbox
                                        checked={isChecked}
                                        disabled={!isChecked && isLimitReached}
                                        onCheckedChange={(checked) => {
                                          const nextSkills = checked
                                            ? selectedSkills.includes(skill)
                                              ? selectedSkills
                                              : selectedSkills.length >= MAX_SKILLS_PER_USER
                                                ? selectedSkills
                                                : [...selectedSkills, skill]
                                            : selectedSkills.filter((item) => item !== skill);
                                          skillsForm.setValue("skills", nextSkills, { shouldValidate: true });
                                        }}
                                      />
                                      <span>{skill}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}
                            <p className="text-muted-foreground text-xs">
                              {selectedSkills.length}/{MAX_SKILLS_PER_USER} skills selected
                            </p>
                            {skillsForm.formState.errors.skills?.message && (
                              <p className="text-xs text-red-500">{skillsForm.formState.errors.skills.message}</p>
                            )}
                          </>
                        )}

                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            disabled={isSkillsLoading || availableSkills.length === 0 || !skillsForm.formState.isValid}
                          >
                            Save
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setActiveEditSection(null)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Form>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(profile.skills?.length ?? 0) > 0 ? (
                        profile.skills?.map((skill) => (
                          <Badge key={skill.id ?? skill.skillId} variant="secondary">
                            {skill.skillId}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">No skills added</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Portfolio</p>
                    <Button type="button" variant="ghost" size="icon" onClick={() => openEditor("portfolio")}>
                      <Pencil className="text-muted-foreground size-3.5" />
                    </Button>
                  </div>

                  {activeEditSection === "portfolio" ? (
                    <Form {...portfolioForm}>
                      <form onSubmit={portfolioForm.handleSubmit(onPortfolioSubmit)} className="space-y-3">
                        <FormField
                          control={portfolioForm.control}
                          name="portfolioUrl"
                          render={({ field }) => (
                            <FormItem>
                              <Label htmlFor="portfolio-url">Portfolio URL</Label>
                              <FormControl>
                                <Input id="portfolio-url" placeholder="https://your-portfolio.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-2">
                          <Button type="submit" disabled={!portfolioForm.formState.isValid}>Save</Button>
                          <Button type="button" variant="outline" onClick={() => setActiveEditSection(null)}>Cancel</Button>
                        </div>
                      </form>
                    </Form>
                  ) : (
                    <>
                      <p className="text-muted-foreground text-sm">Showcase projects, case studies, and links here.</p>
                      <a 
                        href={profile.portfolioUrl} 
                        target="_blank"
                        className="text-blue-600"
                        rel="noopener noreferrer"
                      >
                        {profile.portfolioUrl}
                      </a>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Experience</p>
                    <Button type="button" variant="ghost" size="icon" onClick={() => openEditor("experience")}>
                      <Pencil className="text-muted-foreground size-3.5" />
                    </Button>
                  </div>

                  {activeEditSection === "experience" ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        {profile.experience.map((exp, index) => {
                          const startDate = toDate(exp.startDate);
                          const endDate = toDate(exp.endDate);

                          return (
                            <div key={`${exp.company}-${index}`} className="bg-muted/30 rounded-md border p-2">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-medium">{exp.title}</p>
                                  <p className="text-muted-foreground text-xs">{exp.company}</p>
                                  <p className="text-muted-foreground text-xs">
                                    {startDate ? startDate.toLocaleDateString() : "N/A"} - {endDate ? endDate.toLocaleDateString() : "Present"}
                                  </p>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={() => onEditExperience(index)}>
                                  Edit
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <Button type="button" variant="outline" onClick={onAddExperience} disabled={profile.experience.length >= 5}>
                        Add Experience ({profile.experience.length}/5)
                      </Button>
                      {profile.experience.length >= 5 && (
                        <p className="text-muted-foreground text-xs">Maximum 5 experiences allowed.</p>
                      )}

                      <Form {...experienceForm}>
                        <form onSubmit={experienceForm.handleSubmit(onExperienceSubmit)} className="space-y-3 border-t pt-3">
                          <FormField
                            control={experienceForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <Label htmlFor="experience-title">Title</Label>
                                <FormControl>
                                  <Input id="experience-title" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={experienceForm.control}
                            name="company"
                            render={({ field }) => (
                              <FormItem>
                                <Label htmlFor="experience-company">Company</Label>
                                <FormControl>
                                  <Input id="experience-company" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={experienceForm.control}
                            name="startDate"
                            render={({ field }) => (
                              <FormItem>
                                <Label htmlFor="experience-start-date">Start date</Label>
                                <FormControl>
                                  <Input id="experience-start-date" type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={experienceForm.control}
                            name="endDate"
                            render={({ field }) => (
                              <FormItem>
                                <Label htmlFor="experience-end-date">End date</Label>
                                <FormControl>
                                  <Input id="experience-end-date" type="date" {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex gap-2">
                            <Button
                              type="submit"
                              disabled={!experienceForm.formState.isValid || (editingExperienceIndex === null && profile.experience.length >= 5)}
                            >
                              {editingExperienceIndex === null ? "Add" : "Save"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setActiveEditSection(null)}>Close</Button>
                          </div>
                        </form>
                      </Form>
                    </div>
                  ) : (
                    profile.experience.map((exp, index) => {
                      const startDate = toDate(exp.startDate);
                      const endDate = toDate(exp.endDate);

                      return (
                        <div key={`${exp.company}-${index}`}>
                          <p className="text-sm font-medium">{exp.title}</p>
                          <p className="text-muted-foreground text-xs">{exp.company}</p>
                          <p className="text-muted-foreground text-xs">
                            {startDate ? startDate.toLocaleDateString() : "N/A"} - {endDate ? endDate.toLocaleDateString() : "Present"}
                          </p>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardContent className="space-y-2 p-4">
                  <p className="text-sm font-semibold">Client Reviews</p>
                  <p className="text-sm font-medium">Michael Chen</p>
                  <p className="text-muted-foreground text-sm">
                    Outstanding work. Delivered a beautiful, high-performance website that exceeded expectations.
                  </p>
                  <p className="text-muted-foreground text-xs">E-commerce Website - Dec 2025</p>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
