import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCreateCheckout } from './usePayments';

export function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const courseSlug = searchParams.get('courseSlug');

  const { mutate: createCheckout, isPending, isError } = useCreateCheckout();

  useEffect(() => {
    if (!courseSlug) {
      navigate('/', { replace: true });
    }
  }, [courseSlug, navigate]);

  const handleConfirm = () => {
    if (!courseSlug) return;
    createCheckout({ courseSlug });
  };

  if (!courseSlug) return null;

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-12 animate-fade-in space-y-8">
      {/* Header */}
      <div className="text-center">
        <Badge variant="secondary" className="mb-3">Secure Checkout</Badge>
        <h1 className="text-3xl font-extrabold tracking-tight">Complete your purchase</h1>
        <p className="text-muted-foreground mt-2">
          You will be redirected to Stripe&apos;s secure payment page.
        </p>
      </div>

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
