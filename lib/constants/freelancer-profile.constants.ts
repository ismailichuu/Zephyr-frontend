export const FREELANCER_JOB_CATEGORIES = [
  {
    id: "web-development",
    label: "Web Development",
    subCategories: [
      "Frontend Development",
      "Backend Development",
      "Full-Stack Development",
    ],
  },
  {
    id: "software-engineering",
    label: "Software Engineering (Above Web Dev)",
    subCategories: [
      "Software Engineer",
      "Senior Software Engineer",
      "Staff Engineer",
      "Principal Engineer",
    ],
  },
  {
    id: "system-architecture",
    label: "System & Architecture",
    subCategories: [
      "Software Architect",
      "System Architect",
      "Solution Architect",
    ],
  },
  {
    id: "infrastructure-deployment",
    label: "Infrastructure & Deployment",
    subCategories: [
      "DevOps Engineer",
      "Cloud Engineer",
      "Platform Engineer",
    ],
  },
  {
    id: "reliability-performance",
    label: "Reliability & Performance",
    subCategories: [
      "Site Reliability Engineer (SRE)",
      "Performance Engineer",
    ],
  },
  {
    id: "data-intelligence",
    label: "Data & Intelligence",
    subCategories: [
      "Data Engineer",
      "Machine Learning Engineer",
      "AI Engineer",
    ],
  },
  {
    id: "security",
    label: "Security",
    subCategories: [
      "Cybersecurity Engineer",
      "Application Security Engineer",
      "Cloud Security Engineer",
    ],
  },
  {
    id: "product-business-tech",
    label: "Product & Business Tech",
    subCategories: [
      "Product Engineer",
      "Technical Product Manager",
      "Solutions Engineer",
    ],
  },
  {
    id: "management",
    label: "Management (Optional Path)",
    subCategories: [
      "Engineering Manager",
      "Tech Lead",
    ],
  },
] as const;

export type FreelancerJobCategory = (typeof FREELANCER_JOB_CATEGORIES)[number];
