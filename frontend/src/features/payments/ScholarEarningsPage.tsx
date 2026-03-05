import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  WalletCards,
  BookOpen,
  Calendar,
  ExternalLink,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/stores/authStore';
import {
  useScholarEarnings,
  useScholarEarningsDetails,
  useStripeConnect,
  useStripeConnectOnboard,
} from './usePayments';

const PERIOD_LABELS: Record<string, string> = {
  month: 'This Month',
  quarter: 'This Quarter',
  year: 'This Year',
};

function StatCard({
  title,
  value,
  icon,
  sub,
  highlight,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  sub?: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? 'border-primary/50 bg-primary/5' : undefined}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`text-sm font-medium ${highlight ? 'text-primary' : ''}`}>
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${highlight ? 'text-primary' : ''}`}>{value}</div>
        {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}

export function ScholarEarningsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [txPage, setTxPage] = useState(1);

  const { data: earnings, isLoading: earningsLoading } = useScholarEarnings(period);
  const { data: txData, isLoading: txLoading } = useScholarEarningsDetails(txPage);
  const { data: stripeStatus, isLoading: stripeLoading } = useStripeConnect();
  const { mutate: onboard, isPending: onboarding } = useStripeConnectOnboard();

  // Scholar-only guard (show message for non-scholars)
  if (user && user.role !== 'scholar' && user.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-semibold">Scholar Access Required</h2>
        <p className="text-muted-foreground">
          The Earnings Dashboard is only available to verified scholars.
        </p>
        <Button onClick={() => navigate('/scholar/apply')}>Apply to Become a Scholar</Button>
      </div>
    );
  }

  const breakdown = earnings?.breakdown ?? [];
  const maxRevenue = breakdown.length ? Math.max(...breakdown.map((c) => c.revenue)) : 1;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Earnings Dashboard</h1>
          <p className="text-muted-foreground">Monitor your teaching revenue and payouts.</p>
        </div>
        <Select
          value={period}
          onValueChange={(v) => {
            setPeriod(v as typeof period);
            setTxPage(1);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      {earningsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-3">
                <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                <div className="h-7 w-16 rounded bg-muted animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={`$${(earnings?.totalRevenue ?? 0).toFixed(2)}`}
            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            sub={
              <span className="flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                {PERIOD_LABELS[period]}
              </span>
            }
          />
          <StatCard
            title="Net Earnings"
            value={`$${(earnings?.netEarnings ?? 0).toFixed(2)}`}
            icon={<WalletCards className="h-4 w-4 text-emerald-500" />}
            sub={<span className="text-emerald-600/80 dark:text-emerald-400/80">After 30% platform fee</span>}
          />
          <StatCard
            title="Platform Fee"
            value={`$${(earnings?.platformFee ?? 0).toFixed(2)}`}
            icon={<ArrowDownRight className="h-4 w-4 text-rose-500" />}
            sub="Supports DeenVerse operations"
          />
          <StatCard
            title="Pending Payout"
            value={`$${(earnings?.netEarnings ?? 0).toFixed(2)}`}
            icon={<Calendar className="h-4 w-4 text-primary" />}
            sub="Scheduled via Stripe Express"
            highlight
          />
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-7 border-t pt-8">
        {/* Left: Course breakdown + Stripe card */}
        <div className="md:col-span-4 space-y-6">
          {/* Course Revenue Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Course Revenue Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {earningsLoading ? (
                <div className="space-y-5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 w-40 rounded bg-muted animate-pulse" />
                      <div className="h-2 w-full rounded-full bg-muted animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : breakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No course revenue for this period.
                </p>
              ) : (
                <div className="space-y-6">
                  {breakdown.map((course) => (
                    <div key={course.courseId} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 font-medium">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          {course.title}
                        </div>
                        <span className="font-bold">${course.revenue.toFixed(2)}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(course.revenue / maxRevenue) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{course.studentCount} students</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stripe Connect Status Card */}
          {stripeLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="h-12 w-full rounded bg-muted animate-pulse" />
              </CardContent>
            </Card>
          ) : (
            <Card
              className={
                stripeStatus?.connected
                  ? 'border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/10'
                  : 'border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/10'
              }
            >
              <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-full ${
                      stripeStatus?.connected
                        ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {stripeStatus?.connected ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <WalletCards className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      Stripe Connect
                      {stripeStatus?.connected && (
                        <Badge className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100">
                          Connected
                        </Badge>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {stripeStatus?.payoutsEnabled
                        ? 'Payouts are enabled and scheduled.'
                        : stripeStatus?.connected
                        ? 'Account setup incomplete — payouts not yet enabled.'
                        : 'Connect your bank account to receive earnings.'}
                    </p>
                  </div>
                </div>
                {stripeStatus?.connected ? (
                  <Button variant="outline" className="shrink-0 gap-2 w-full sm:w-auto" asChild>
                    <a href="/api/v1/scholars/stripe/dashboard" target="_blank" rel="noreferrer">
                      Stripe Dashboard <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                ) : (
                  <Button
                    className="shrink-0 w-full sm:w-auto gap-2"
                    onClick={() => onboard()}
                    disabled={onboarding}
                  >
                    {onboarding && <Loader2 className="h-4 w-4 animate-spin" />}
                    Connect Stripe
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Transaction History */}
        <div className="md:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {txLoading ? (
                <div className="space-y-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="space-y-1.5">
                        <div className="h-3 w-32 rounded bg-muted animate-pulse" />
                        <div className="h-2.5 w-20 rounded bg-muted animate-pulse" />
                      </div>
                      <div className="h-3 w-12 rounded bg-muted animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : !txData?.transactions.length ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No transactions yet.
                </p>
              ) : (
                <>
                  <div className="space-y-5">
                    {txData.transactions.map((tx) => (
                      <div key={tx._id} className="flex items-start justify-between">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium">
                            {tx.type === 'course_sale'
                              ? `Sale: ${tx.courseTitle ?? 'Course'}`
                              : 'Payout to Bank'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {tx.type === 'course_sale' && (
                            <Badge variant="outline" className="w-fit text-[10px] px-1.5 py-0 mt-0.5">
                              {tx.status}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                          <span
                            className={`text-sm font-bold ${
                              tx.type === 'payout'
                                ? 'text-rose-500'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {tx.type === 'payout' ? '-' : '+'}$
                            {Math.abs(tx.type === 'course_sale' && tx.netAmount != null ? tx.netAmount : tx.amount).toFixed(2)}
                          </span>
                          {tx.type === 'course_sale' && tx.netAmount != null && (
                            <span className="text-xs text-muted-foreground">
                              Gross: ${tx.amount.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {txData.pagination && txData.pagination.pages > 1 && (
                    <div className="flex justify-between items-center mt-6 pt-4 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={txPage <= 1}
                        onClick={() => setTxPage((p) => p - 1)}
                      >
                        Previous
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        Page {txPage} of {txData.pagination.pages}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={txPage >= txData.pagination.pages}
                        onClick={() => setTxPage((p) => p + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
