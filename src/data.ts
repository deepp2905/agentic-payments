export type Status = 'paid' | 'declined' | 'expired' | 'declinedByYou';

export type Transaction = {
  id: string;
  merchant: string;
  agent: string;
  amount: string;
  status: Status;
  detail?: string;
  flag?: string;
};

export const request = {
  agent: 'Scout',
  agentRole: 'SHOPPING AGENT',
  amount: '$280.37',
  merchant: 'Norline Audio',
  product: 'Halden ANC 2 headphones, Graphite',
  checks: [
    { label: 'Noise-cancelling', value: 'ANC, 30h' },
    { label: 'Under $300', value: '$240.32 with tax' },
    { label: 'Delivery', value: 'Thu, Nov 5' },
  ],
};

export const notificationContent = {
  title: `Scout wants to pay ${request.amount}`,
  body: 'Halden ANC 2 headphones from Northline Audio. Tap to review.',
  data: { screen: 'request' },
};

export const today: Transaction[] = [
  { id: 'harbor', merchant: 'Harbor Hotel', agent: 'Tern', amount: '$284.00', status: 'paid', detail: '9:12 AM' },
  { id: 'metro', merchant: 'Metro Power', agent: 'Ledger', amount: '$96.41', status: 'paid', detail: 'monthly bill' },
  { id: 'fieldstone', merchant: 'Fieldstone Coffee', agent: 'Scout', amount: '$18.50', status: 'declined' },
];

export const yesterday: Transaction[] = [
  { id: 'ridewell', merchant: 'Ridewell', agent: 'Scout', amount: '$23.10', status: 'expired' },
  { id: 'pantry', merchant: 'Pantry Market', agent: 'Scout', amount: '$18.47', status: 'paid', flag: 'refund requested' },
];
