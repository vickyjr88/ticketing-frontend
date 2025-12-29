import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { CreditCard, Smartphone, Check, AlertCircle, Tag, X, Loader } from 'lucide-react';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const { eventId, items, event } = location.state || {};

  const [paymentProvider, setPaymentProvider] = useState('MPESA');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, failed

  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoApplied, setPromoApplied] = useState(null); // { code, discount_amount, discount_type, discount_value }

  useEffect(() => {
    if (!eventId || !items) {
      navigate('/events');
    }
  }, [eventId, items, navigate]);

  const calculateSubtotal = () => {
    return items.reduce((total, item) => {
      return total + (item.price || 0) * item.quantity;
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    if (promoApplied?.discount_amount) {
      return subtotal - promoApplied.discount_amount;
    }
    return subtotal;
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

    setPromoLoading(true);
    setPromoError('');

    try {
      const subtotal = calculateSubtotal();
      const result = await api.validatePromoCode(promoCode.trim(), eventId, subtotal);

      if (result.valid) {
        setPromoApplied({
          code: result.code,
          discount_amount: result.discount_amount,
          discount_type: result.discount_type,
          discount_value: result.discount_value,
          description: result.description,
        });
        setPromoError('');
      } else {
        setPromoError(result.error || 'Invalid promo code');
        setPromoApplied(null);
      }
    } catch (err) {
      setPromoError(err.message || 'Failed to validate promo code');
      setPromoApplied(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoApplied(null);
    setPromoCode('');
    setPromoError('');
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      // Create order with optional promo code
      const orderData = await api.checkout({
        eventId,
        items: items.map(({ tierId, quantity }) => ({ tierId, quantity })),
        paymentProvider,
        promoCode: promoApplied?.code || undefined,
      });

      setOrder(orderData.order);

      // Initiate payment
      if (paymentProvider === 'MPESA') {
        if (!phoneNumber || phoneNumber.length < 10) {
          setError('Please enter a valid phone number');
          setLoading(false);
          return;
        }

        const paymentData = { phoneNumber };
        await api.initiatePayment(orderData.order.id, paymentData);
        setPaymentStatus('processing');
        checkPaymentStatus(orderData.order.id);
      } else if (paymentProvider === 'STRIPE') {
        const paymentData = {
          successUrl: `${window.location.origin}/payment-success?orderId=${orderData.order.id}`,
          cancelUrl: `${window.location.origin}/payment-cancel`,
        };
        const stripeData = await api.initiatePayment(orderData.order.id, paymentData);
        // Redirect to Stripe
        window.location.href = stripeData.url;
      } else if (paymentProvider === 'PAYSTACK') {
        const paymentData = {
          successUrl: `${window.location.origin}/paystack/callback`,
          cancelUrl: `${window.location.origin}/payment-cancel`,
        };
        const paystackData = await api.initiatePayment(orderData.order.id, paymentData);
        // Redirect to Paystack
        if (paystackData.data?.authorization_url) {
          window.location.href = paystackData.data.authorization_url;
        } else {
          throw new Error('Failed to get Paystack authorization URL');
        }
      }
    } catch (err) {
      setError(err.message || 'Checkout failed');
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (orderId) => {
    // Poll payment status
    const maxAttempts = 30; // 30 seconds
    let attempts = 0;

    const interval = setInterval(async () => {
      try {
        const status = await api.getPaymentStatus(orderId);
        if (status.paid) {
          setPaymentStatus('success');
          clearInterval(interval);
          setTimeout(() => {
            navigate('/my-tickets');
          }, 2000);
        }

        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setPaymentStatus('timeout');
        }
      } catch (err) {
        console.error('Failed to check payment status:', err);
      }
    }, 1000);
  };

  if (!eventId || !items) {
    return null;
  }

  const total = calculateTotal();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-bold text-lg mb-4">{event?.title}</h3>

            <div className="space-y-3 mb-4">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.tierName} x {item.quantity}
                  </span>
                  <span className="font-semibold">KES {((item.price || 0) * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Promo Code Section */}
            <div className="border-t pt-4 mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline-block mr-1" />
                Promo Code
              </label>

              {promoApplied ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                  <div>
                    <span className="font-semibold text-green-800">{promoApplied.code}</span>
                    <span className="text-sm text-green-600 ml-2">
                      -{promoApplied.discount_type === 'PERCENTAGE'
                        ? `${promoApplied.discount_value}%`
                        : `KES ${promoApplied.discount_value}`}
                    </span>
                  </div>
                  <button
                    onClick={handleRemovePromo}
                    className="text-red-500 hover:text-red-700"
                    title="Remove promo"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={handleApplyPromo}
                    disabled={promoLoading}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {promoLoading ? <Loader className="w-5 h-5 animate-spin" /> : 'Apply'}
                  </button>
                </div>
              )}

              {promoError && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {promoError}
                </p>
              )}
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>KES {calculateSubtotal().toLocaleString()}</span>
              </div>

              {promoApplied && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({promoApplied.code})</span>
                  <span>-KES {promoApplied.discount_amount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-blue-600">KES {total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>

          {paymentStatus === 'idle' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-4 mb-6">
                {/* M-Pesa */}
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${paymentProvider === 'MPESA'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                  onClick={() => setPaymentProvider('MPESA')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-semibold">M-Pesa</p>
                        <p className="text-sm text-gray-600">Pay via Lipa Na M-Pesa</p>
                      </div>
                    </div>
                    {paymentProvider === 'MPESA' && (
                      <Check className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                </div>

                {/* Stripe */}
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${paymentProvider === 'STRIPE'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                  onClick={() => setPaymentProvider('STRIPE')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="font-semibold">Card Payment (Stripe)</p>
                        <p className="text-sm text-gray-600">Pay with Credit/Debit Card</p>
                      </div>
                    </div>
                    {paymentProvider === 'STRIPE' && (
                      <Check className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                </div>

                {/* Paystack */}
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${paymentProvider === 'PAYSTACK'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                  onClick={() => setPaymentProvider('PAYSTACK')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-semibold">Paystack</p>
                        <p className="text-sm text-gray-600">Mobile Money & Cards</p>
                      </div>
                    </div>
                    {paymentProvider === 'PAYSTACK' && (
                      <Check className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                </div>
              </div>

              {/* M-Pesa Phone Number */}
              {paymentProvider === 'MPESA' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    M-Pesa Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="0712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You will receive an STK push to complete the payment
                  </p>
                </div>
              )}

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-semibold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : `Pay KES ${total.toLocaleString()}`}
              </button>
            </div>
          )}

          {/* Payment Processing */}
          {paymentStatus === 'processing' && (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h3>
              <p className="text-gray-600 mb-4">Check your phone for the M-Pesa prompt</p>
              <p className="text-sm text-gray-500">This may take a few moments...</p>
            </div>
          )}

          {/* Payment Success */}
          {paymentStatus === 'success' && (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h3>
              <p className="text-gray-600 mb-4">Your tickets have been confirmed</p>
              <p className="text-sm text-gray-500">Redirecting to your tickets...</p>
            </div>
          )}

          {/* Payment Failed */}
          {(paymentStatus === 'failed' || paymentStatus === 'timeout') && (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Failed</h3>
              <p className="text-gray-600 mb-4">
                {paymentStatus === 'timeout'
                  ? 'Payment confirmation timed out. Please check your phone and try again.'
                  : 'There was an issue processing your payment'}
              </p>
              <button
                onClick={() => {
                  setPaymentStatus('idle');
                  setError('');
                }}
                className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
