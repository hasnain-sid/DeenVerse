import { useState } from 'react';
import { Calendar, FileText, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePaymentHistory } from './usePayments';

// ── Helpers ──────────────────────────────────────────

function formatAmount(cents: number, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'completed':
      return 'default';
    case 'refunded':
      return 'secondary';
    case 'failed':
      return 'destructive';
    default:
      return 'outline';
  }
}

// ── Component ────────────────────────────────────────

export function PaymentHistoryPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = usePaymentHistory(page);

  const payments = data?.payments ?? [];
  const pagination = data?.pagination;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payment History</h1>
        <p className="text-muted-foreground text-sm mt-1">
          All your past transactions and receipts.
        </p>
      </div>

      {/* Payment method hint */}
      <Card className="bg-card/50 backdrop-blur border-dashed border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-5 w-5 text-primary" /> Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-3 bg-background p-3 rounded-lg border">
            <div className="bg-blue-600 rounded text-white px-2 py-0.5 text-xs font-bold italic">VISA</div>
            <span className="font-mono text-sm">Manage via Stripe portal</span>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="/subscription">Manage plan</a>
          </Button>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Past payments and downloadable receipts.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          )}

          {isError && (
            <p className="text-center text-sm text-muted-foreground py-8">
              Failed to load payment history. Please try again.
            </p>
          )}

          {!isLoading && !isError && payments.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              No transactions yet.
            </p>
          )}

          {!isLoading && payments.length > 0 && (
            <div className="space-y-3">
              {payments.map((tx) => (
                <div
                  key={tx._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center border shrink-0">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm capitalize">
                        {tx.type === 'course-purchase'
                          ? tx.course?.title ?? 'Course Purchase'
                          : tx.type === 'subscription'
                          ? `${tx.subscription?.plan ?? ''} Plan`.trim()
                          : 'Refund'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        • {tx._id}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    <div className="text-right">
                      <div className="font-bold text-sm">{formatAmount(tx.amount, tx.currency)}</div>
                      <Badge variant={statusVariant(tx.status)} className="text-xs mt-0.5 capitalize">
                        {tx.status}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" title="Download receipt">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t mt-6">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.pages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={pagination.page >= pagination.pages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
