import type { Control, UseFormRegister } from 'react-hook-form';
import type { z } from 'zod';
import { createCourseSchema } from '@deenverse/shared';

interface PricingFormProps {
  pricingType?: z.infer<typeof createCourseSchema>['pricing']['type'];
  register: UseFormRegister<z.infer<typeof createCourseSchema>>;
  control?: Control<z.infer<typeof createCourseSchema>>;
}

export function PricingForm({ pricingType, register }: PricingFormProps) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-2">Pricing Type</label>
        <div className="flex gap-3 flex-wrap">
          {(['free', 'paid', 'subscription'] as const).map((value) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                {...register('pricing.type')}
                value={value}
                className="accent-primary"
              />
              <span className="text-sm capitalize">{value}</span>
            </label>
          ))}
        </div>
      </div>

      {pricingType === 'paid' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">
              Price <span className="text-destructive">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('pricing.amount', { valueAsNumber: true })}
              placeholder="29.99"
              className="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Currency</label>
            <select
              {...register('pricing.currency')}
              className="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="usd">USD ($)</option>
              <option value="eur">EUR (€)</option>
              <option value="gbp">GBP (£)</option>
              <option value="sar">SAR</option>
            </select>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Max Students (0 = unlimited)</label>
        <input
          type="number"
          min="0"
          {...register('maxStudents', { valueAsNumber: true })}
          placeholder="0"
          className="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-1 focus:ring-primary outline-none"
        />
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          {...register('certificateOnCompletion')}
          className="rounded h-4 w-4 accent-primary"
        />
        <span className="text-sm font-medium">Issue certificate on completion</span>
      </label>
    </div>
  );
}
