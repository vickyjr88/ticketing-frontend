import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { checkPaystackTransaction } from '../services/api'; // Wait, I just named it verifyPaystack.
import api from '../services/api';
import { Loader, Check, AlertCircle } from 'lucide-react';

export default function PaystackCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const reference = searchParams.get('reference');

    const [status, setStatus] = useState('verifying'); // verifying, success, failed
    const [error, setError] = useState('');

    useEffect(() => {
        if (!reference) {
            setStatus('failed');
            setError('No payment reference found');
            return;
        }

        const verifyPayment = async () => {
            try {
                const response = await api.verifyPaystack(reference);
                if (response.success) {
                    setStatus('success');
                    setTimeout(() => {
                        navigate('/my-tickets');
                    }, 3000);
                } else {
                    setStatus('failed');
                    setError('Payment verification failed');
                }
            } catch (err) {
                console.error('Paystack verification error:', err);
                setStatus('failed');
                setError(err.message || 'Failed to verify payment');
            }
        };

        verifyPayment();
    }, [reference, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
                {status === 'verifying' && (
                    <>
                        <Loader className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
                        <p className="text-gray-600">Please wait while we confirm your transaction...</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                        <p className="text-gray-600 mb-4">Your payment has been verified. Redirecting you to your tickets...</p>
                    </>
                )}

                {status === 'failed' && (
                    <>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-10 h-10 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <button
                            onClick={() => navigate('/events')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Return to Events
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
