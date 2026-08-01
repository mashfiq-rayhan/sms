import Link from "next/link";
import { CircleDollarSign, Wallet, Receipt } from "lucide-react";
import { requireStaff } from "@/lib/session";
import { listBalances, listPayments } from "@/features/fees/service";
import { listStudentsBasic } from "@/features/enrolment/service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OverdueBadge } from "@/components/status-badges";
import { RecordPaymentDialog } from "@/features/fees/components/record-payment-dialog";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function FeesPage() {
  await requireStaff();
  const [balances, payments, students] = await Promise.all([
    listBalances(),
    listPayments(),
    listStudentsBasic(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={CircleDollarSign}
        title="Fees & Payments"
        description="Track what each student owes and record incoming payments."
        action={<RecordPaymentDialog students={students} />}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="size-4 text-primary" />
            Balances
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead className="text-right">Programme fee</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
                <TableHead>Due</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {balances.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState icon={Wallet} message="No students enrolled yet." />
                  </TableCell>
                </TableRow>
              )}
              {balances.map((b) => (
                <TableRow key={b.student.id}>
                  <TableCell>
                    <Link href={`/students/${b.student.id}`} className="underline-offset-2 hover:underline">
                      {b.student.fullName} ({b.student.studentId})
                    </Link>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(b.feeAmount)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(b.totalPaid)}</TableCell>
                  <TableCell
                    className={
                      b.outstanding > 0
                        ? "text-right font-medium tabular-nums"
                        : "text-right tabular-nums text-muted-foreground"
                    }
                  >
                    {formatCurrency(b.outstanding)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(b.student.feeDueDate)}</TableCell>
                  <TableCell>
                    <OverdueBadge overdue={b.overdue} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="size-4 text-primary" />
            Payment history
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <EmptyState icon={Receipt} message="No payments recorded yet." />
                  </TableCell>
                </TableRow>
              )}
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-muted-foreground">{formatDate(p.paidAt)}</TableCell>
                  <TableCell>{p.student.fullName}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(Number(p.amount))}</TableCell>
                  <TableCell className="text-muted-foreground">{p.referenceNumber}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
