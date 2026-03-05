import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function ScholarStripeSetupPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get('status');

  // Success state
  if (status === 'success') {
    return (
      <div className="max-w-lg mx-auto p-8 flex flex-col items-center text-center space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
          <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Stripe Connected!</h1>
          <p className="text-muted-foreground">
            Your Stripe Express account has been set up. Earnings from your courses will be
            automatically transferred to your bank account.
          </p>
        </div>
        <Card className="w-full text-left border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/10">
          <CardContent className="p-5 space-y-2 text-sm">
            <p className="font-medium">What happens next?</p>
            <ul className="space-y-1.5 text-muted-foreground list-disc list-inside">
              <li>Payouts are processed automatically by Stripe</li>
              <li>You&apos;ll receive transfers per your Stripe payout schedule</li>
              <li>Manage bank details directly in your Stripe Express Dashboard</li>
            </ul>
          </CardContent>
        </Card>
        <Button className="w-full gap-2" onClick={() => navigate('/scholar/earnings')}>
          View Earnings Dashboard <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Refresh / incomplete state (Stripe redirects here if the user leaves onboarding)
  if (status === 'refresh') {
    return (
      <div className="max-w-lg mx-auto p-8 flex flex-col items-center text-center space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-20 w-20 rounded-full bg-amber-100 dark:bg-amber-900/40">
          <RefreshCw className="h-10 w-10 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Setup Incomplete</h1>
          <p className="text-muted-foreground">
            It looks like you didn&apos;t finish setting up your Stripe account. You can complete
            the setup from your Earnings Dashboard.
          </p>
        </div>
        <div className="flex gap-3 w-full">
          <Button className="flex-1" onClick={() => navigate('/scholar/earnings')}>
            Return to Earnings
          </Button>
          <Button variant="outline" className="flex-1" asChild>
            <Link to="/scholar/earnings">Try Again Later</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Error / unknown state
  return (
    <div className="max-w-lg mx-auto p-8 flex flex-col items-center text-center space-y-6 animate-fade-in">
      <div className="flex items-center justify-center h-20 w-20 rounded-full bg-destructive/10">
        <XCircle className="h-10 w-10 text-destructive" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Something Went Wrong</h1>
        <p className="text-muted-foreground">
          We couldn&apos;t complete the Stripe setup. Please try again from your Earnings
          Dashboard.
        </p>
      </div>
      <Button className="w-full" onClick={() => navigate('/scholar/earnings')}>
        Return to Earnings Dashboard
      </Button>
    </div>
  );
}
