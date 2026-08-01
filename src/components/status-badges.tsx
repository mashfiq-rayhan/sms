import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Classification, EnrolmentStatus } from "@/generated/prisma/client";
import {
  CircleCheck,
  CircleX,
  Clock,
  BadgeCheck,
  Check,
  CheckCheck,
  Award,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

const CHIP = {
  emerald: "border-transparent bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  amber: "border-transparent bg-amber-500/10 text-amber-700 dark:text-amber-400",
  rose: "border-transparent bg-rose-500/10 text-rose-700 dark:text-rose-400",
  violet: "border-transparent bg-violet-500/10 text-violet-700 dark:text-violet-400",
  indigo: "border-transparent bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  gradient: "border-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-sm shadow-violet-500/30",
} as const;

const STATUS_CONFIG: Record<EnrolmentStatus, { chip: keyof typeof CHIP; icon: LucideIcon }> = {
  ENROLLED: { chip: "emerald", icon: CircleCheck },
  DEFERRED: { chip: "amber", icon: Clock },
  WITHDRAWN: { chip: "rose", icon: CircleX },
  COMPLETED: { chip: "violet", icon: BadgeCheck },
};

export function EnrolmentStatusBadge({ status }: { status: EnrolmentStatus }) {
  const { chip, icon: Icon } = STATUS_CONFIG[status];
  return (
    <Badge className={CHIP[chip]}>
      <Icon data-icon="inline-start" />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
}

const CLASSIFICATION_CONFIG: Record<Classification, { chip: keyof typeof CHIP; icon: LucideIcon }> = {
  FAIL: { chip: "rose", icon: CircleX },
  PASS: { chip: "indigo", icon: Check },
  MERIT: { chip: "amber", icon: CheckCheck },
  DISTINCTION: { chip: "gradient", icon: Award },
};

export function ClassificationBadge({ classification }: { classification: Classification }) {
  const { chip, icon: Icon } = CLASSIFICATION_CONFIG[classification];
  return (
    <Badge className={cn(CHIP[chip], classification === "DISTINCTION" && "font-semibold")}>
      <Icon data-icon="inline-start" />
      {classification.charAt(0) + classification.slice(1).toLowerCase()}
    </Badge>
  );
}

export function OverdueBadge({ overdue }: { overdue: boolean }) {
  if (!overdue) return null;
  return (
    <Badge className={CHIP.rose}>
      <TriangleAlert data-icon="inline-start" />
      Overdue
    </Badge>
  );
}

export function LateBadge({ late }: { late: boolean }) {
  if (!late) return null;
  return (
    <Badge className={CHIP.amber}>
      <Clock data-icon="inline-start" />
      Late
    </Badge>
  );
}
