import { RoleProfilePortal } from "@/components/atomic/organisms";
import { getFreelancerProfile } from "@/lib/api/freelancer/get-freelancer-profile.api";

export default async function FreelancerPage() {
  const res = await getFreelancerProfile();
  return <RoleProfilePortal role="freelancer" user={res.freelancer} />;
}
