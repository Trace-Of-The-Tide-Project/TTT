import { ClaimInviteContent } from "@/components/waqamh/ClaimInviteContent";

export const dynamic = "force-dynamic";

export default async function WaqamhClaimPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <ClaimInviteContent token={token ?? null} />;
}
