import axios from "axios";
import apiClient from "../axios/client.instance.axios";

type SkillItem = string | { name?: string; skillName?: string; label?: string };

function normalizeSkillsFromResponse(payload: unknown): string[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const response = payload as {
    skills?: SkillItem[];
    skill?: SkillItem[];
    data?: {
      skills?: SkillItem[];
      skill?: SkillItem[];
    };
  };

  const rawSkills =
    response.skills ??
    response.skill ??
    response.data?.skills ??
    response.data?.skill ??
    [];

  if (!Array.isArray(rawSkills)) {
    return [];
  }

  return rawSkills
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      const name = item.name ?? item.skillName ?? item.label ?? "";
      return name.trim();
    })
    .filter((name) => name.length > 0);
}

export async function fetchSkillsByCategory(subCategory: string): Promise<string[]> {
  try {
    const res = await apiClient.get(`/freelancer/skills?category=${subCategory}`);
    return normalizeSkillsFromResponse(res.data);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message ?? "Failed to fetch skills");
    }

    throw new Error("Failed to fetch skills");
  }
}
