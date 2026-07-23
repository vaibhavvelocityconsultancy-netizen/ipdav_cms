"use client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/src/ui/badge";

interface ShareRecord {
  shareId: string;
  sharedWith: string;
  createdAt: string;
  viewedAt: string | null;
  zipDownloadedAt: string | null;
  fileCount: number;
  fileTitles: string[];
}

interface UserDetails {
  user: {
    id: number;
    name: string | null;
    email: string;
    role: string;
    createdAt: string;
  };
  plan: {
    title: string;
    status: string;
    billingCycle: string;
    startsAt: string | null;
    currentPeriodEnd: string | null;
    trialEndsAt: string | null;
  } | null;
  shares: ShareRecord[];
}

function statusVariant(status: string) {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "TRIALING":
      return "secondary";
    case "EXPIRED":
    case "CANCELED":
      return "destructive";
    default:
      return "outline";
  }
}

export default function UserDetailsModal({
  userId,
  onClose,
}: {
  userId: number;
  onClose: () => void;
}) {
  const { data, isLoading } = useQuery<UserDetails>({
    queryKey: ["admin-user-details", userId],
    queryFn: async () => {
      const res = await fetch(`/api/subscription-user/${userId}/`);
      const json = await res.json();
      return json.data;
    },
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
      >
        {isLoading || !data ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : (
          <>
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {data.user.name || "—"}
                </h2>
                <p className="text-sm text-slate-500">{data.user.email}</p>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                Close
              </button>
            </div>

            {/* ── Plan Details ── */}
            <section className="mb-6">
              <h3 className="mb-2 text-sm font-medium text-slate-700">Plan Details</h3>
              {data.plan ? (
                <div className="rounded-lg border border-slate-200 p-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-400">Plan</p>
                    <p className="font-medium">{data.plan.title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Status</p>
                    <Badge variant={statusVariant(data.plan.status) as any}>
                      {data.plan.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Billing Cycle</p>
                    <p className="font-medium">{data.plan.billingCycle}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Current Period Ends</p>
                    <p className="font-medium">
                      {data.plan.currentPeriodEnd
                        ? new Date(data.plan.currentPeriodEnd).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  {data.plan.trialEndsAt && (
                    <div>
                      <p className="text-xs text-slate-400">Trial Ends</p>
                      <p className="font-medium">
                        {new Date(data.plan.trialEndsAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No active plan.</p>
              )}
            </section>

            {/* ── Files They Shared ── */}
            <section>
              <h3 className="mb-2 text-sm font-medium text-slate-700">
                Files Shared ({data.shares.length})
              </h3>
              {data.shares.length === 0 ? (
                <p className="text-sm text-slate-500">No files shared yet.</p>
              ) : (
                <div className="space-y-2">
                  {data.shares.map((share) => (
                    <div
                      key={share.shareId}
                      className="rounded-lg border border-slate-200 p-3 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium">
                          {share.fileCount > 1
                            ? `${share.fileTitles[0]} +${share.fileCount - 1} more`
                            : share.fileTitles[0]}
                        </p>
                        <span className="text-xs text-slate-400">
                          {new Date(share.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-slate-400">Shared with:</span>
                        <span className="text-sm font-medium text-slate-800">
                          {share.sharedWith}
                        </span>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Badge variant={share.viewedAt ? "default" : "outline"}>
                          {share.viewedAt ? "Viewed" : "Not viewed"}
                        </Badge>
                        {share.fileCount > 1 && (
                          <Badge variant={share.zipDownloadedAt ? "default" : "outline"}>
                            {share.zipDownloadedAt ? "Zip downloaded" : "Zip not downloaded"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}