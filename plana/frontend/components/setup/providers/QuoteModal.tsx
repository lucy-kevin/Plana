// components/providers/QuoteModal.tsx
import { PlanService } from '@/frontend/lib/services';

export const QuoteModal = ({ providerId }: { providerId: string }) => {
  const handleConfirm = async () => {
    // Calling the decoupled service layer
    await PlanService.requestProviderQuote(providerId, { note: '...' });
    // Handle UI success state
  };

  return <button onClick={handleConfirm}>Confirm & Send SMS</button>;
};