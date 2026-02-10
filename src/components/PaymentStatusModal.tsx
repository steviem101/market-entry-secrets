import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PaymentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'success' | 'cancel';
  sessionId?: string;
}

export const PaymentStatusModal = ({ isOpen, onClose, status, sessionId }: PaymentStatusModalProps) => {
  const isSuccess = status === 'success';
  const navigate = useNavigate();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center text-center space-y-4">
            {isSuccess ? (
              <>
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <DialogTitle className="text-2xl">Payment Successful!</DialogTitle>
                <DialogDescription className="text-base">
                  Thank you for your purchase. Your account has been upgraded and you now have access to premium features.
                </DialogDescription>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-orange-500" />
                </div>
                <DialogTitle className="text-2xl">Payment Cancelled</DialogTitle>
                <DialogDescription className="text-base">
                  Your payment was cancelled. No charges were made to your account. You can try again whenever you're ready.
                </DialogDescription>
              </>
            )}
          </div>
        </DialogHeader>

        {isSuccess && sessionId && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
            <p className="text-sm font-medium text-muted-foreground mb-2">Transaction Reference:</p>
            <code className="text-xs bg-background p-2 rounded block break-all">{sessionId}</code>
          </div>
        )}

        <div className="flex flex-col gap-2 mt-6">
          <Button onClick={onClose} className="w-full">
            {isSuccess ? 'Get Started' : 'Close'}
          </Button>
          {!isSuccess && (
            <Button variant="outline" onClick={() => { onClose(); navigate('/pricing'); }} className="w-full">
              View Pricing Plans
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
