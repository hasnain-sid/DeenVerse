import React, { useState } from 'react';
import { Check, Minus, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { useCreateSubscription, useCancelSubscription } from './usePayments';

// ── Plan data ────────────────────────────────────────

const plans = [
  { id: 'free' as const, name: 'Free', price: '$0', interval: 'forever', highlight: false },
  { id: 'student' as const, name: 'Student', price: '$9.99', interval: '/mo', highlight: true },
  { id: 'premium' as const, name: 'Premium', price: '$19.99', interval: '/mo', highlight: false },
];

const featureGroups = [
  {
    category: 'Core Features',
    items: [
      { name: 'Community Access', free: true, student: true, premium: true },
      { name: 'Hadith Browsing', free: true, student: true, premium: true },
      { name: 'Daily Reminders', free: true, student: true, premium: true },
      { name: 'Basic Q&A', free: true, student: true, premium: true },
    ],
  },
  {
    category: 'Learning & Courses',
    items: [
      { name: 'Self-paced Courses', free: false, student: true, premium: true },
      { name: 'Downloadable Resources', free: false, student: true, premium: true },
      { name: 'Certificates of Completion', free: false, student: true, premium: true },
      { name: 'Early Access to Courses', free: false, student: false, premium: true },
      { name: 'Advanced Study Materials', free: false, student: false, premium: true },
    ],
  },
  {
    category: 'Scholar Access',
    items: [
      { name: 'Live Sessions/Month', free: '0', student: '2', premium: 'Unlimited' },
      { name: 'Priority Q&A', free: false, student: true, premium: true },
      { name: '1-on-1 Scholar Sessions', free: false, student: false, premium: true },
      { name: 'Exclusive Community Group', free: false, student: false, premium: true },
    ],
  },
];

// ── Helper ───────────────────────────────────────────

function renderCheck(value: boolean | string) {
  if (typeof value === 'string') return <span className="font-semibold">{value}</span>;
  if (value) return <Check className="h-5 w-5 text-emerald-500 mx-auto" />;
  return <Minus className="h-5 w-5 text-muted-foreground/30 mx-auto" />;
}

// ── Component ────────────────────────────────────────

export function SubscriptionPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { mutate: subscribe, isPending: isSubscribing } = useCreateSubscription();
  const { mutate: cancelSubscription, isPending: isCancelling } = useCancelSubscription();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Derive current plan from user data (backend stores subscription info on user)
  const currentPlan = user?.subscription?.plan ?? 'free';

  const handleSelectPlan = (planId: 'student' | 'premium') => {
    subscribe({ planId });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 animate-fade-in pb-32 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <Badge variant="secondary" className="mb-4">Billing Portal</Badge>
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Choose Your Journey</h1>
        <p className="text-xl text-muted-foreground">
          Compare plans side by side and find the perfect fit for your learning goals.
        </p>
      </div>

      {/* Current plan banner */}
      {currentPlan !== 'free' && (
        <div className="max-w-2xl mx-auto bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-medium">
                You are on the <span className="text-primary capitalize">{currentPlan}</span> plan.
              </p>
              {user?.subscription?.currentPeriodEnd && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Renews on {new Date(user.subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/payments/history')}>
                Billing history
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setShowCancelConfirm(true)}
              >
                Cancel plan
              </Button>
            </div>
          </div>

          {/* Inline cancel confirmation */}
          {showCancelConfirm && (
            <div className="border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Cancel your subscription?</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    You will retain access until the end of your current billing period, then revert to the Free plan.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isCancelling}
                  onClick={() => {
                    cancelSubscription();
                    setShowCancelConfirm(false);
                  }}
                >
                  {isCancelling ? 'Cancelling...' : 'Yes, cancel'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowCancelConfirm(false)}>
                  Keep subscription
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feature comparison table */}
      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b bg-secondary/30">
                <th className="p-6 w-1/3 align-bottom lg:pl-10">
                  <div className="text-xl font-bold">Compare Features</div>
                  <div className="text-sm text-muted-foreground font-normal mt-1">
                    Select the tier that's right for you.
                  </div>
                </th>
                {plans.map((plan) => (
                  <th
                    key={plan.id}
                    className={`p-6 w-2/9 text-center align-top border-l border-border/50 relative ${
                      plan.highlight ? 'bg-primary/5' : ''
                    }`}
                  >
                    {plan.highlight && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                    )}
                    <div className="text-2xl font-bold mb-1">{plan.name}</div>
                    <div className="mb-6">
                      <span className="text-3xl font-extrabold">{plan.price}</span>
                      <span className="text-muted-foreground font-normal">{plan.interval}</span>
                    </div>
                    {plan.id === 'free' ? (
                      <Button
                        variant="outline"
                        className="w-full rounded-full"
                        disabled
                      >
                        {currentPlan === 'free' ? 'Current Plan' : 'Free tier'}
                      </Button>
                    ) : (
                      <Button
                        variant={plan.highlight ? 'default' : 'outline'}
                        className="w-full rounded-full"
                        disabled={currentPlan === plan.id || isSubscribing}
                        onClick={() => handleSelectPlan(plan.id)}
                      >
                        {currentPlan === plan.id
                          ? 'Current Plan'
                          : isSubscribing
                          ? 'Redirecting...'
                          : `Select ${plan.name}`}
                      </Button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {featureGroups.map((group, gIdx) => (
                <React.Fragment key={gIdx}>
                  <tr className="bg-secondary/10">
                    <td
                      colSpan={4}
                      className="p-4 font-bold text-sm uppercase tracking-wider text-muted-foreground lg:pl-10"
                    >
                      {group.category}
                    </td>
                  </tr>
                  {group.items.map((item, iIdx) => (
                    <tr key={iIdx} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium text-foreground lg:pl-10">{item.name}</td>
                      <td className="p-4 text-center border-l">{renderCheck(item.free)}</td>
                      <td className="p-4 text-center border-l bg-primary/5">{renderCheck(item.student)}</td>
                      <td className="p-4 text-center border-l">{renderCheck(item.premium)}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
              {/* Footer row */}
              <tr className="border-t-2 border-border/80">
                <td className="p-6" />
                {plans.map((plan) => (
                  <td
                    key={plan.id}
                    className={`p-6 text-center border-l ${plan.highlight ? 'bg-primary/5' : ''}`}
                  >
                    {plan.id === 'free' ? (
                      <Button variant="outline" className="w-full rounded-full" disabled>
                        {currentPlan === 'free' ? 'Current Plan' : 'Free tier'}
                      </Button>
                    ) : (
                      <Button
                        variant={plan.highlight ? 'default' : 'outline'}
                        className="w-full rounded-full"
                        disabled={currentPlan === plan.id || isSubscribing}
                        onClick={() => handleSelectPlan(plan.id)}
                      >
                        {currentPlan === plan.id ? 'Current Plan' : 'Select'}
                      </Button>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
