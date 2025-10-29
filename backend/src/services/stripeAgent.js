// Stub para stripeAgent.js
export async function mcp_stripe_agent_retrieve_balance() {
  return { available: [{ amount: 0 }] };
}
export async function mcp_stripe_agent_list_subscriptions(params) {
  return { data: [] };
}
export async function mcp_stripe_agent_list_customers(params) {
  return { data: [], total_count: 0 };
}
export async function mcp_stripe_agent_create_refund(params) {
  return { id: 'stub_refund', ...params };
}
