export interface AppmaxMetrics {
  totalRevenue: number;
  orderCount: number;
  transactionFees: number;
}

/**
 * Calculates Appmax fees based on payment method:
 * - Pix: 0.99% fee
 * - Credit Card: 4.99% + 0.99% fee
 */
const calculateAppmaxFees = (pixRevenue: number, creditCardRevenue: number) => {
  // Pix fee is 0.99%
  const pixFee = pixRevenue * 0.0099;

  // Credit card fee is 4.99% + 0.99%
  const creditCardFee = (creditCardRevenue * 0.0499) + (creditCardRevenue * 0.0099);

  // Total fees
  return pixFee + creditCardFee;
};

export const calculateAppmaxMetrics = (shopifyMetrics: any): AppmaxMetrics => {
  if (!shopifyMetrics) {
    return {
      totalRevenue: 0,
      orderCount: 0,
      transactionFees: 0
    };
  }

  const { paymentMethods, paidOrderCount } = shopifyMetrics;

  // Calculate total fees
  const fees = calculateAppmaxFees(paymentMethods.pix, paymentMethods.creditCard);

  // Calculate total revenue after fees
  // Total Revenue = (Pix Revenue + Credit Card Revenue) - Total Fees
  const totalRevenue = (paymentMethods.pix + paymentMethods.creditCard) - fees;

  return {
    totalRevenue,
    orderCount: paidOrderCount,
    transactionFees: fees
  };
};