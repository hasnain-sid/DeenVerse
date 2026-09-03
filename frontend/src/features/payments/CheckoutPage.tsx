import { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Lock, ShieldCheck, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCreateCheckout, useConfirmCoursePurchase } from './usePayments';

export function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // `course` is the legacy param name. Still read so that Checkout sessions created
  // before the rename resolve on return instead of bouncing the buyer to the home page.
  const courseSlug = searchParams.get('courseSlug') ?? searchParams.get('course');
  const paymentSessionId = searchParams.get('session_id');
  const returnedFromStripe = searchParams.get('success') === 'true';
  const wasCanceled = searchParams.get('canceled') === 'true';

  const { mutate: createCheckout, isPending, isError } = useCreateCheckout();
  const {
    mutate: confirmPurchase,
    isPending: isConfirming,
    isSuccess: isConfirmed,
    isError: confirmFailed,
  } = useConfirmCoursePurchase();

  useEffect(() => {
    // Nothing to render and nothing to confirm — this is not a checkout URL.
    if (!courseSlug && !returnedFromStripe && !wasCanceled) {
      navigate('/', { replace: true });
    }
  }, [courseSlug, returnedFromStripe, wasCanceled, navigate]);

  // Confirm the completed session exactly once. React 18 StrictMode double-invokes
  // effects in dev, and this one posts an enrollment — so it is guarded by a ref.
  const confirmStarted = useRef(false);
  useEffect(() => {
    if (!returnedFromStripe || !courseSlug || !paymentSessionId) return;
    if (confirmStarted.current) return;
    confirmStarted.current = true;
    confirmPurchase({ slug: courseSlug, paymentSessionId });
  }, [returnedFromStripe, courseSlug, paymentSessionId, confirmPurchase]);

  const handleConfirm = () => {
    if (!courseSlug) return;
    createCheckout({ courseSlug });
  };

  if (!courseSlug && !returnedFromStripe && !wasCanceled) return null;

  const header = (title: string, subtitle: string, badge: string) => (
    <div className="text-center">
      <Badge variant="secondary" className="mb-3">{badge}</Badge>
      <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
      <p className="text-muted-foreground mt-2">{subtitle}</p>
    </div>
  );

  // ── Returning from Stripe after a completed payment ────────────────
  // The pay button is deliberately absent from this branch: re-rendering it after a
  // successful charge is how a buyer ends up paying for the same course twice.
  if (returnedFromStripe) {
    // Without a session id the browser cannot confirm, but the Stripe webhook creates
    // the enrollment server-side regardless — so this is a wait, not a failure.
    const enrollmentPending = !paymentSessionId || confirmFailed;

    return (
      <div className="max-w-3xl mx-auto p-6 md:p-12 animate-fade-in space-y-8">
        {header(
          'Payment received',
          isConfirmed
            ? 'Your enrollment is confirmed. You have full access to the course.'
            : enrollmentPending
              ? 'Your payment went through. Access is being activated — this usually takes a few seconds.'
              : 'Confirming your enrollment…',
          'Thank you',
        )}

        <Card className="border-2 border-emerald-500/30 shadow-xl p-8 flex flex-col items-center gap-6 text-center">
          {isConfirming ? (
            <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          ) : (
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          )}

          {enrollmentPending && !isConfirming && (
            <p className="text-sm text-muted-foreground max-w-md">
              If the course still shows as unpurchased in a minute, open it from{' '}
              <button
                type="button"
                className="underline hover:text-foreground"
                onClick={() => navigate('/payments/history')}
              >
                your payment history
              </button>{' '}
              or contact support — your payment is recorded either way.
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {courseSlug && (
              <Button
                className="h-12 rounded-xl px-8 group"
                disabled={isConfirming}
                onClick={() => navigate(`/courses/${courseSlug}/learn`)}
              >
                Start learning
                <ArrowRight className="ml-2 h-5 w-5 opacity-50 group-hover:opacity-100 transition-opacity" />
              </Button>
            )}
            <Button variant="outline" className="h-12 rounded-xl px-8" onClick={() => navigate('/courses')}>
              Browse courses
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ── Returning from Stripe after cancelling ─────────────────────────
  if (wasCanceled) {
    return (
      <div className="max-w-3xl mx-auto p-6 md:p-12 animate-fade-in space-y-8">
        {header('Payment cancelled', 'You have not been charged.', 'Checkout')}

        <Card className="border-2 shadow-xl p-8 flex flex-col items-center gap-6 text-center">
          <XCircle className="h-12 w-12 text-muted-foreground" />
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {courseSlug && (
              <Button className="h-12 rounded-xl px-8" onClick={() => navigate(`/courses/${courseSlug}`)}>
                Back to course
              </Button>
            )}
            <Button variant="outline" className="h-12 rounded-xl px-8" onClick={() => navigate('/courses')}>
              Browse courses
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ── Pre-payment ────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto p-6 md:p-12 animate-fade-in space-y-8">
      {header(
        'Complete your purchase',
        "You will be redirected to Stripe's secure payment page.",
        'Secure Checkout',
      )}

      <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
        <div className="bg-card border-b p-8">
          <div className="flex md:items-center justify-between flex-col md:flex-row gap-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-3">
                Course Purchase
                <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
                  Secure
                </Badge>
              </h2>
              <p className="text-muted-foreground mt-2 text-sm font-mono break-all">
                {courseSlug}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 bg-secondary/10 flex flex-col md:flex-row gap-8 items-center justify-between">
          <ul className="space-y-3 text-sm flex-1">
            <li className="flex gap-2 items-center">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
              Lifetime course access
            </li>
            <li className="flex gap-2 items-center">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
              Downloadable materials
            </li>
            <li className="flex gap-2 items-center">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
              Certificate upon completion
            </li>
          </ul>

          <div className="w-full md:w-1/2 space-y-3">
            {isError && (
              <p className="text-sm text-destructive text-center">
                Something went wrong. Please try again.
              </p>
            )}
            <Button
              className="w-full h-14 rounded-xl text-base group"
              onClick={handleConfirm}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin mr-2" />
                  Redirecting to Stripe...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 border border-white/40 rounded bg-white/10 p-1 h-6 w-6" />
                  Pay securely
                  <ArrowRight className="ml-auto h-5 w-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
              <Lock className="h-3 w-3" /> Encrypted by Stripe Checkout
            </p>
          </div>
        </div>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        By proceeding you agree to our{' '}
        <a href="/terms" className="underline hover:text-foreground">Terms of Service</a> and{' '}
        <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>.
      </p>
    </div>
  );
}
