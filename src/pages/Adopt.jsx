import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { CreditCard, Smartphone, Check, AlertCircle, Gift } from 'lucide-react';

export default function Adopt() {
    const location = useLocation();
    const navigate = useNavigate();

    const { eventId, tierId, event } = location.state || {}; // Passed from EventDetails

    const [paymentProvider, setPaymentProvider] = useState('MPESA');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [order, setOrder] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, failed
    const [tier, setTier] = useState(null);
    const [enabledProviders, setEnabledProviders] = useState([]);
    const [configLoading, setConfigLoading] = useState(true);

    useEffect(() => {
        api.getPublicPaymentConfig()
            .then(configs => {
                const enabled = configs.filter(c => c.is_enabled).map(c => c.provider);
                setEnabledProviders(enabled);
                if (enabled.length > 0 && !enabled.includes(paymentProvider)) {
                    setPaymentProvider(enabled[0]);
                }
                setConfigLoading(false);
            })
            .catch(err => {
                console.error('Failed to load payment config:', err);
                setConfigLoading(false);
            });
    }, []);

    useEffect(() => {
        if (!eventId || !tierId) {
            navigate('/events');
            return;
        }
        loadTier();
    }, [eventId, tierId, navigate]);

    const loadTier = async () => {
        try {
            const tiersData = await api.getEventTiers(eventId);
            // Flatten tiers object to find the specific tier
            let foundTier = null;
            Object.values(tiersData).forEach(categoryTiers => {
                const t = categoryTiers.find(t => t.id === tierId);
                if (t) foundTier = t;
            });
            setTier(foundTier);
        } catch (err) {
            console.error('Failed to load tier:', err);
            navigate('/events');
        }
    };

    const calculateTotal = () => {
        return (tier?.price || 0) * quantity;
    };

    const handleAdopt = async () => {
        setLoading(true);
        setError('');

        try {
            // Create adoption order
            const orderData = await api.adoptTickets({
                eventId,
                tierId,
                quantity,
                paymentProvider,
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
                window.location.href = stripeData.url;
            } else if (paymentProvider === 'PAYSTACK') {
                const paymentData = {
                    successUrl: `${window.location.origin}/paystack/callback`,
                    cancelUrl: `${window.location.origin}/payment-cancel`,
                };
                const paystackData = await api.initiatePayment(orderData.order.id, paymentData);
                if (paystackData.data?.authorization_url) {
                    window.location.href = paystackData.data.authorization_url;
                } else {
                    throw new Error('Failed to get Paystack authorization URL');
                }
            }
        } catch (err) {
            setError(err.message || 'Adoption failed');
            setPaymentStatus('failed');
        } finally {
            setLoading(false);
        }
    };

    const checkPaymentStatus = async (orderId) => {
        const maxAttempts = 30;
        let attempts = 0;

        const interval = setInterval(async () => {
            try {
                const status = await api.getPaymentStatus(orderId);
                if (status.paid) {
                    setPaymentStatus('success');
                    clearInterval(interval);
                    setTimeout(() => {
                        navigate('/my-orders'); // Redirect to Orders, not Tickets (since they are adopted)
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

    if (!eventId || !tierId || !tier) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const total = calculateTotal();

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-8">
                <Gift className="w-8 h-8 text-yellow-500" />
                <h1 className="text-3xl font-bold text-gray-900">Adopt a Ticket</h1>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 text-yellow-800">
                <p className="font-semibold">You are purchasing a ticket to be gifted to the lottery pool.</p>
                <p className="text-sm">This ticket will be randomly assigned to a lucky winner. Thank you for your generosity!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Adoption Summary</h2>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="font-bold text-lg mb-4">{event?.title}</h3>

                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-700">{tier.name}</span>
                            <span className="font-semibold">KES {tier.price.toLocaleString()}</span>
                        </div>

                        <div className="flex items-center justify-between mb-6">
                            <label className="text-gray-700 font-medium">Quantity:</label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="bg-gray-200 w-8 h-8 rounded-full font-bold hover:bg-gray-300"
                                >
                                    -
                                </button>
                                <span className="font-semibold text-lg">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(q => Math.min(10, q + 1))}
                                    className="bg-gray-200 w-8 h-8 rounded-full font-bold hover:bg-gray-300"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total Donation</span>
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
                            {configLoading ? (
                                <div className="flex justify-center p-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : enabledProviders.length === 0 ? (
                                <div className="text-center p-4 text-gray-500">
                                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                                    <p>No payment methods available.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 mb-6">
                                    {/* M-Pesa */}
                                    {enabledProviders.includes('MPESA') && (
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
                                    )}

                                    {/* Paystack */}
                                    {enabledProviders.includes('PAYSTACK') && (
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
                                    )}
                                </div>
                            )}

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
                                </div>
                            )}

                            {error && (
                                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
                                    <AlertCircle className="w-5 h-5" />
                                    <span className="text-sm">{error}</span>
                                </div>
                            )}

                            <button
                                onClick={handleAdopt}
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-semibold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : `Donate KES ${total.toLocaleString()}`}
                            </button>
                        </div>
                    )}

                    {/* Payment Status Views (Same as Checkout) */}
                    {paymentStatus === 'processing' && (
                        <div className="bg-white rounded-lg shadow-md p-6 text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Donation</h3>
                            <p className="text-gray-600 mb-4">Check your phone for the M-Pesa prompt</p>
                        </div>
                    )}

                    {paymentStatus === 'success' && (
                        <div className="bg-white rounded-lg shadow-md p-6 text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-10 h-10 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Thank You!</h3>
                            <p className="text-gray-600 mb-4">Your ticket donation has been received.</p>
                        </div>
                    )}

                    {(paymentStatus === 'failed' || paymentStatus === 'timeout') && (
                        <div className="bg-white rounded-lg shadow-md p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-10 h-10 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Failed</h3>
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
