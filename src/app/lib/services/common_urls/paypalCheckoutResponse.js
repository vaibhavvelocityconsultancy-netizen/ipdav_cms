export function buildSubscriptionCheckoutResponse(subscription) {
  const approvalUrl = subscription?.links?.find(
    (link) => link.rel === "approve",
  )?.href;

  return {
    subscriptionId: subscription?.id ?? null,
    approvalUrl: approvalUrl ?? null,
  };
}
