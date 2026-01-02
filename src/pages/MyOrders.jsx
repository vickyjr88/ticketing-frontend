import { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
    ShoppingBag,
    Calendar,
    ChevronRight,
    CreditCard,
    AlertCircle,
    Check,
    Smartphone,
    Loader,
    X
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Payment Modal State
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [paymentProvider, setPaymentProvider] = useState('MPESA');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [processingPayment, setProcessingPayment] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, failed, timeout
    const [paymentError, setPaymentError] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await api.getMyOrders();
            setOrders(data);
        } catch (err) {
            setError('Failed to load orders');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePayNow = (order) => {
        setSelectedOrder(order);
        setPaymentProvider('MPESA');
        setPaymentStatus('idle');
        setPaymentError('');
        setPhoneNumber('');
    };

    const handleCloseModal = () => {
        setSelectedOrder(null);
        setPaymentStatus('idle');
    };

    const handlePayment = async () => {
        setProcessingPayment(true);
        setPaymentError('');

        try {
            // Initiate payment
            if (paymentProvider === 'MPESA') {
                if (!phoneNumber || phoneNumber.length < 10) {
                    setPaymentError('Please enter a valid phone number');
                    setProcessingPayment(false);
                    return;
                }

                const paymentData = { phoneNumber };
                await api.initiatePayment(selectedOrder.id, paymentData);
                setPaymentStatus('processing');
                checkPaymentStatus(selectedOrder.id);
            } else if (paymentProvider === 'STRIPE') {
                const paymentData = {
                    successUrl: `${window.location.origin}/payment-success?orderId=${selectedOrder.id}`,
                    cancelUrl: `${window.location.origin}/my-orders`,
                };
                const stripeData = await api.initiatePayment(selectedOrder.id, paymentData);
                window.location.href = stripeData.url;
            } else if (paymentProvider === 'PAYSTACK') {
                const paymentData = {
                    successUrl: `${window.location.origin}/paystack/callback`,
                    cancelUrl: `${window.location.origin}/my-orders`,
                };
                const paystackData = await api.initiatePayment(selectedOrder.id, paymentData);
                if (paystackData.data?.authorization_url) {
                    window.location.href = paystackData.data.authorization_url;
                } else {
                    throw new Error('Failed to get Paystack authorization URL');
                }
            }
        } catch (err) {
            setPaymentError(err.message || 'Payment initiation failed');
            setPaymentStatus('failed');
        } finally {
            setProcessingPayment(false);
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
                    fetchOrders(); // Refresh list
                    setTimeout(() => {
                        handleCloseModal();
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

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <ShoppingBag className="w-8 h-8" />
                My Orders
            </h1>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                    <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
                    <Link
                        to="/events"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Browse Events
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Event
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{order.id.slice(0, 8)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {order.event?.title || 'Unknown Event'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            KES {Number(order.total_amount).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.payment_status === 'PAID' ? 'bg-green-100 text-green-800' :
                                                    order.payment_status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'}`}>
                                                {order.payment_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {order.payment_status === 'PAID' ? (
                                                <Link to="/my-tickets" className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                                                    View Tickets <ChevronRight className="w-4 h-4" />
                                                </Link>
                                            ) : (
                                                <button
                                                    onClick={() => handlePayNow(order)}
                                                    className="text-blue-600 hover:text-blue-900 font-medium"
                                                >
                                                    Pay Now
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-xl font-bold mb-4">Complete Payment</h2>

                        <div className="mb-6">
                            <p className="text-gray-600">Order #{selectedOrder.id.slice(0, 8)}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                KES {Number(selectedOrder.total_amount).toLocaleString()}
                            </p>
                        </div>

                        {paymentStatus === 'success' ? (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="w-10 h-10 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h3>
                                <p className="text-gray-600">Redirecting...</p>
                            </div>
                        ) : paymentStatus === 'processing' ? (
                            <div className="text-center py-6">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h3>
                                <p className="text-gray-600">Please check your phone if using M-Pesa</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4 mb-6">
                                    {/* Payment Methods */}
                                    <div className="grid grid-cols-1 gap-3">
                                        <div
                                            onClick={() => setPaymentProvider('MPESA')}
                                            className={`p-4 border rounded-lg cursor-pointer flex items-center justify-between ${paymentProvider === 'MPESA' ? 'border-blue-600 bg-blue-50' : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Smartphone className="w-5 h-5 text-green-600" />
                                                <span className="font-medium">M-Pesa</span>
                                            </div>
                                            {paymentProvider === 'MPESA' && <Check className="w-5 h-5 text-blue-600" />}
                                        </div>

                                        <div
                                            onClick={() => setPaymentProvider('STRIPE')}
                                            className={`p-4 border rounded-lg cursor-pointer flex items-center justify-between ${paymentProvider === 'STRIPE' ? 'border-blue-600 bg-blue-50' : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <CreditCard className="w-5 h-5 text-blue-600" />
                                                <span className="font-medium">Card (Stripe)</span>
                                            </div>
                                            {paymentProvider === 'STRIPE' && <Check className="w-5 h-5 text-blue-600" />}
                                        </div>

                                        <div
                                            onClick={() => setPaymentProvider('PAYSTACK')}
                                            className={`p-4 border rounded-lg cursor-pointer flex items-center justify-between ${paymentProvider === 'PAYSTACK' ? 'border-blue-600 bg-blue-50' : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <CreditCard className="w-5 h-5 text-green-600" />
                                                <span className="font-medium">Paystack</span>
                                            </div>
                                            {paymentProvider === 'PAYSTACK' && <Check className="w-5 h-5 text-blue-600" />}
                                        </div>
                                    </div>

                                    {/* M-Pesa Input */}
                                    {paymentProvider === 'MPESA' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                M-Pesa Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                placeholder="0712345678"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                                            />
                                        </div>
                                    )}

                                    {paymentError && (
                                        <div className="text-red-600 text-sm flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {paymentError}
                                        </div>
                                    )}

                                    {paymentStatus === 'timeout' && (
                                        <div className="text-red-600 text-sm flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            Payment timed out. Please try again.
                                        </div>
                                    )}

                                    {paymentStatus === 'failed' && !paymentError && (
                                        <div className="text-red-600 text-sm flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            Payment failed. Please try again.
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handlePayment}
                                    disabled={processingPayment}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {processingPayment ? (
                                        <>
                                            <Loader className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        'Pay Now'
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
