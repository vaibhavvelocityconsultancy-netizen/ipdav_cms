"use client";

/**
 * ═════════════════════════════════════════════════════════════════════
 * TRIAL EXPIRY POPUP/MODAL
 * ═════════════════════════════════════════════════════════════════════
 *
 * Shows when subscription status = EXPIRED
 * Offers user to:
 * 1. Subscribe Now → /admin/plans
 * 2. Maybe Later → Dismiss
 *
 * Auto-triggered when:
 * - User navigates dashboard with expired subscription
 * - Session loads and detects status change
 */

import { AlertCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface TrialExpiryPopupProps {
  show: boolean;
  onDismiss?: () => void;
}

export function TrialExpiryPopup({ show, onDismiss }: TrialExpiryPopupProps) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  if (!show || dismissed) return null;

  const handleSubscribe = () => {
    router.push("/admin/plans");
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 border border-red-200">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 rounded-full p-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          Your trial has expired
        </h2>

        {/* Description */}
        <p className="text-center text-gray-600 mb-6">
          Subscribe to continue watching premium content and access all course materials.
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleSubscribe}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg transition"
          >
            Subscribe Now
          </button>
          <button
            onClick={handleDismiss}
            className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-lg transition"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
