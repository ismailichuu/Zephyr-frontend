"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { ArrowRight, Upload, UserRound } from "lucide-react";

import { Button, Card, CardContent, Input, Label } from "@/components/atomic/atoms";
import { AppLogo } from "@/components/atomic/molecules";
import { AuthPageShell } from "@/components/atomic/templates";
import { useToast } from "@/components/providers/toast-provider";
import { FREELANCER_JOB_CATEGORIES } from "@/lib/constants/freelancer-profile.constants";

type FormValues = {
  categoryId: string;
  subCategory: string;
  bio: string;
};

export default function FreelancerCompleteProfile() {
  const toast = useToast();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [values, setValues] = useState<FormValues>({
    categoryId: "",
    subCategory: "",
    bio: "",
  });

  const subCategories = useMemo(() => {
    const selectedCategory = FREELANCER_JOB_CATEGORIES.find(
      (category) => category.id === values.categoryId,
    );
    return selectedCategory?.subCategories ?? [];
  }, [values.categoryId]);

  const onPhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);
  };

  const onCategoryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const categoryId = event.target.value;
    setValues((prev) => ({
      ...prev,
      categoryId,
      subCategory: "",
    }));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!values.categoryId || !values.subCategory || !values.bio.trim()) {
      toast.error("Please complete all required profile fields.");
      return;
    }

    toast.success("Profile details captured successfully.");
  };

  return (
    <AuthPageShell maxWidth="md">
      <div className="space-y-1 text-center">
        <AppLogo />
        <h1 className="text-xl font-semibold text-foreground">Complete Your Profile</h1>
        <p className="text-xs text-muted-foreground">
          Help clients learn about your skills and experience
        </p>
      </div>

      <Card className="border shadow-sm">
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label>Profile Photo</Label>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-muted">
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview} alt="Profile preview" className="h-full w-full object-cover" />
                ) : (
                  <UserRound className="h-8 w-8 text-muted-foreground" />
                )}
              </div>

              <div>
                <Input
                  id="profile-photo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onPhotoChange}
                />
                <Label
                  htmlFor="profile-photo"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-primary hover:bg-primary/5"
                >
                  <Upload className="h-4 w-4" />
                  Upload Photo
                </Label>
              </div>
            </div>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="job-category">Job Category</Label>
              <select
                id="job-category"
                value={values.categoryId}
                onChange={onCategoryChange}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select Category</option>
                {FREELANCER_JOB_CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sub-category">Sub Category</Label>
              <select
                id="sub-category"
                value={values.subCategory}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, subCategory: event.target.value }))
                }
                disabled={!values.categoryId}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">Select Category</option>
                {subCategories.map((subCategory) => (
                  <option key={subCategory} value={subCategory}>
                    {subCategory}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                value={values.bio}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, bio: event.target.value }))
                }
                rows={4}
                placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
              />
            </div>

            <div className="pt-2 text-center">
              <Button type="submit" className="rounded-full px-6">
                Complete Profile
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthPageShell>
  );
}
