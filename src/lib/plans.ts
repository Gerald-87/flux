import { Button } from '../components/ui/Button';
export const plans = [
  {
    id: 'trial',
    name: 'Free Trial',
    price: 0,
    duration: '/ 7 days',
    description: 'Explore all Premium features, no strings attached.',
    features: [
      { text: 'Up to 100 Products', included: true },
      { text: 'Up to 2 Cashiers', included: true },
      { text: 'Advanced Analytics', included: true },
      { text: 'Customer Loyalty', included: true },
      { text: 'Email Support', included: true },
      { text: 'No credit card required', included: true },
    ],
    isPopular: false,
    buttonText: 'Start Free Trial',
    variant: 'secondary' as const
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 29,
    duration: '/ month',
    description: 'Perfect for small businesses and new startups.',
    features: [
      { text: 'Up to 500 Products', included: true },
      { text: '1 Cashier Account', included: true },
      { text: 'Basic Sales Reporting', included: true },
      { text: 'Email Support', included: true },
      { text: 'Customer Loyalty', included: false },
      { text: 'Advanced Analytics', included: false },
    ],
    isPopular: false,
    buttonText: 'Choose Basic',
    variant: 'secondary' as const
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 59,
    duration: '/ month',
    description: 'Ideal for growing businesses that need more power.',
    features: [
      { text: 'Up to 2,000 Products', included: true },
      { text: 'Up to 5 Cashier Accounts', included: true },
      { text: 'Advanced Sales Reporting', included: true },
      { text: 'Customer Loyalty Program', included: true },
      { text: 'Inventory Management', included: true },
      { text: 'Priority Email Support', included:true },
    ],
    isPopular: true,
    buttonText: 'Choose Standard',
    variant: 'primary' as const
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 99,
    duration: '/ month',
    description: 'The complete solution for established businesses.',
    features: [
      { text: 'Unlimited Products', included: true },
      { text: 'Up to 10 Cashier Accounts', included: true },
      { text: 'Full Analytics Suite', included: true },
      { text: 'Multi-Location Support', included: true },
      { text: 'API Access', included: true },
      { text: '24/7 Phone & Priority Support', included: true },
    ],
    isPopular: false,
    buttonText: 'Choose Premium',
    variant: 'secondary' as const
  },
];
