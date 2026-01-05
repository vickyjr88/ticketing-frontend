import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    CreditCard,
    Calendar,
    Clock,
    CheckCircle,
    AlertCircle,
    ChevronRight,
    RefreshCw,
    Wallet,
    Ticket,
    X,
    Phone,
    ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

export default function LayawayOrders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [topUpProvider, setTopUpProvider] = useState('PAYSTACK');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [processing, setProcessing] = useState(false);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadOrders();
    }, [filter]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const status = filter === 'all' ? null : filter.toUpperCase();
            const response = await api.getLayawayOrders(1, 50, status);
            const orderData = response?.data || response || [];
            setOrders(Array.isArray(orderData) ? orderData : []);
        } catch (err) {
            console.error('Failed to load layaway orders:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleTopUp = async () => {
        if (!selectedOrder || !topUpAmount) return;

        const amount = parseFloat(topUpAmount);
        const balance = parseFloat(selectedOrder.total_amount) - parseFloat(selectedOrder.amount_paid);

        if (amount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (amount > balance) {
            setError(`Amount exceeds balance due. Maximum: KES ${balance.toLocaleString()}`);
            return;
        }

        try {
            setProcessing(true);
            const result = await api.topUpLayawayOrder(selectedOrder.id, {
                amount,
                paymentProvider: topUpProvider,
                phoneNumber: topUpProvider === 'MPESA' ? phoneNumber : undefined,
                successUrl: `${window.location.origin}/layaway?success=true`,
                cancelUrl: `${window.location.origin}/layaway?cancelled=true`,
            });

            if (result?.paymentData?.data?.authorization_url) {
                // Redirect to Paystack
                window.location.href = result.paymentData.data.authorization_url;
            } else if (topUpProvider === 'MPESA') {
                // M-Pesa STK Push initiated
                setShowTopUpModal(false);
                setError(null);
                alert('Check your phone for the M-Pesa payment prompt');
                loadOrders();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!confirm('Are you sure you want to cancel this order? Any payments made will be refunded.')) {
            return;
        }

        try {
            const result = await api.cancelLayawayOrder(orderId);
            alert(result.message);
            loadOrders();
        } catch (err) {
            setError(err.message);
        }
    };

    const formatCurrency = (amount) => {
        return `KES ${parseFloat(amount || 0).toLocaleString()}`;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-KE', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PAID':
                return <span className="status-badge bg-green-100 text-green-700">Fully Paid</span>;
            case 'PARTIAL':
                return <span className="status-badge bg-yellow-100 text-yellow-700">Partially Paid</span>;
            case 'PENDING':
                return <span className="status-badge bg-gray-100 text-gray-700">Pending</span>;
            case 'FAILED':
                return <span className="status-badge bg-red-100 text-red-700">Cancelled</span>;
            default:
                return <span className="status-badge bg-gray-100 text-gray-700">{status}</span>;
        }
    };

    const getProgressPercent = (order) => {
        const paid = parseFloat(order.amount_paid || 0);
        const total = parseFloat(order.total_amount || 1);
        return Math.min((paid / total) * 100, 100);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Wallet className="w-7 h-7 text-blue-600" />
                        Lipa Pole Pole
                    </h1>
                    <p className="text-gray-600">Manage your layaway orders and make payments</p>
                </div>
                <Link
                    to="/events"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Browse Events
                </Link>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                {['all', 'pending', 'partial', 'paid'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === f
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {f === 'all' ? 'All Orders' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl">
                    <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No Layaway Orders</h3>
                    <p className="text-gray-500 mb-6">
                        Start a layaway order to pay for tickets in installments
                    </p>
                    <Link
                        to="/events"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Browse Events
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const balance = parseFloat(order.total_amount) - parseFloat(order.amount_paid || 0);
                        const progress = getProgressPercent(order);

                        return (
                            <div
                                key={order.id}
                                className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-900">
                                            {order.event?.title || 'Event'}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(order.created_at)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Ticket className="w-4 h-4" />
                                                {order.tickets?.length || 0} tickets
                                            </span>
                                        </div>
                                    </div>
                                    {getStatusBadge(order.payment_status)}
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-600">Progress</span>
                                        <span className="font-medium">{Math.round(progress)}%</span>
                                    </div>
                                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${progress >= 100 ? 'bg-green-500' : 'bg-blue-600'
                                                }`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Payment Summary */}
                                <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Total</p>
                                        <p className="font-semibold text-gray-900">{formatCurrency(order.total_amount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Paid</p>
                                        <p className="font-semibold text-green-600">{formatCurrency(order.amount_paid)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Balance</p>
                                        <p className={`font-semibold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {formatCurrency(balance)}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    {order.payment_status !== 'PAID' && order.payment_status !== 'FAILED' && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setTopUpAmount(balance.toString());
                                                    setShowTopUpModal(true);
                                                }}
                                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <CreditCard className="w-4 h-4" />
                                                Make Payment
                                            </button>
                                            <button
                                                onClick={() => handleCancelOrder(order.id)}
                                                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    )}
                                    {order.payment_status === 'PAID' && (
                                        <Link
                                            to="/my-tickets"
                                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            View Tickets
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Top-Up Modal */}
            {showTopUpModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">Make Payment</h2>
                            <button
                                onClick={() => setShowTopUpModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-700 mb-1">Balance Due</p>
                            <p className="text-2xl font-bold text-blue-900">
                                {formatCurrency(
                                    parseFloat(selectedOrder.total_amount) -
                                    parseFloat(selectedOrder.amount_paid || 0)
                                )}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Payment Amount (KES)
                                </label>
                                <input
                                    type="number"
                                    value={topUpAmount}
                                    onChange={(e) => setTopUpAmount(e.target.value)}
                                    min="100"
                                    max={parseFloat(selectedOrder.total_amount) - parseFloat(selectedOrder.amount_paid || 0)}
                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter amount"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Method
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setTopUpProvider('PAYSTACK')}
                                        className={`p-4 border-2 rounded-lg text-center transition-colors ${topUpProvider === 'PAYSTACK'
                                                ? 'border-blue-600 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <CreditCard className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                                        <span className="text-sm font-medium">Card</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTopUpProvider('MPESA')}
                                        className={`p-4 border-2 rounded-lg text-center transition-colors ${topUpProvider === 'MPESA'
                                                ? 'border-green-600 bg-green-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <Phone className="w-6 h-6 mx-auto mb-1 text-green-600" />
                                        <span className="text-sm font-medium">M-Pesa</span>
                                    </button>
                                </div>
                            </div>

                            {topUpProvider === 'MPESA' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        M-Pesa Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="e.g., 0712345678"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowTopUpModal(false)}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleTopUp}
                                disabled={processing || !topUpAmount}
                                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Pay {formatCurrency(topUpAmount)}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
