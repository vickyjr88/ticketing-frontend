import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Loader, Save, CreditCard, Smartphone, Globe, Check, X, AlertTriangle } from 'lucide-react';

const PROVIDERS = {
    MPESA: { name: 'M-Pesa', icon: Smartphone, description: 'Mobile money payments (Safaricom)' },
    STRIPE: { name: 'Stripe', icon: CreditCard, description: 'International card payments (Visa, Mastercard)' },
    PAYSTACK: { name: 'Paystack', icon: Globe, description: 'African payments gateway' },
};

export default function AdminPaymentSettings() {
    const [configs, setConfigs] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null);

    useEffect(() => {
        loadConfigs();
    }, []);

    const loadConfigs = async () => {
        try {
            const data = await api.getPaymentSettings();
            // Convert array to object keyed by provider
            const configMap = {};
            if (Array.isArray(data)) {
                data.forEach(c => configMap[c.provider] = c);
            }
            setConfigs(configMap);
        } catch (err) {
            console.error('Failed to load payment settings', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (provider, currentState) => {
        // Optimistic update
        const newConfigs = { ...configs };
        const currentConfig = newConfigs[provider] || { provider };
        // If config doesn't exist locally, assume disabled (false) -> toggle to true
        // If config exists, flip is_enabled
        const nextState = !(currentConfig.is_enabled);

        newConfigs[provider] = { ...currentConfig, is_enabled: nextState };
        setConfigs(newConfigs);

        try {
            await api.updatePaymentSettings(provider, { is_enabled: nextState });
            // Re-fetch to ensure sync with server
            const data = await api.getPaymentSettings();
            const configMap = {};
            if (Array.isArray(data)) {
                data.forEach(c => configMap[c.provider] = c);
            }
            setConfigs(configMap);
        } catch (err) {
            alert('Failed to update status');
            loadConfigs(); // Revert
        }
    };

    const handleSaveCredentials = async (provider, credentials, isTestMode) => {
        setSaving(provider);
        try {
            await api.updatePaymentSettings(provider, { credentials, is_test_mode: isTestMode });
            await loadConfigs();
            alert('Settings saved successfully');
        } catch (err) {
            console.error(err);
            alert('Failed to save settings');
        } finally {
            setSaving(null);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <Loader className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
    );

    return (
        <div className="admin-page p-6 max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
                <p className="text-gray-500 mt-1">Configure and manage payment gateways for your events.</p>
            </header>

            <div className="grid gap-6">
                {Object.keys(PROVIDERS).map(provider => (
                    <PaymentCard
                        key={provider}
                        provider={provider}
                        config={configs[provider] || {}}
                        meta={PROVIDERS[provider]}
                        onToggle={() => handleToggle(provider, configs[provider]?.is_enabled)}
                        onSave={handleSaveCredentials}
                        saving={saving === provider}
                    />
                ))}
            </div>
        </div>
    );
}

function PaymentCard({ provider, config, meta, onToggle, onSave, saving }) {
    const [expanded, setExpanded] = useState(false);
    const [formData, setFormData] = useState({});
    const [isTest, setIsTest] = useState(false);
    const Icon = meta.icon;

    useEffect(() => {
        setFormData(config.credentials || {});
        setIsTest(!!config.is_test_mode);
    }, [config]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(provider, formData, isTest);
    };

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const isEnabled = !!config.is_enabled;

    const renderFields = () => {
        switch (provider) {
            case 'MPESA':
                return (
                    <>
                        <Field label="Consumer Key" value={formData.consumerKey} onChange={v => handleChange('consumerKey', v)} />
                        <Field label="Consumer Secret" value={formData.consumerSecret} type="password" onChange={v => handleChange('consumerSecret', v)} />
                        <Field label="Passkey" value={formData.passkey} type="password" onChange={v => handleChange('passkey', v)} />
                        <Field label="Shortcode" value={formData.shortcode} onChange={v => handleChange('shortcode', v)} />
                        <p className="text-xs text-gray-500 mt-2">Callback URL: <code className="bg-gray-100 px-1 py-0.5 rounded">https://api.yourdomain.com/payments/mpesa/callback</code></p>
                    </>
                );
            case 'PAYSTACK':
                return (
                    <>
                        <Field label="Secret Key" value={formData.secretKey} type="password" onChange={v => handleChange('secretKey', v)} />
                        <Field label="Public Key" value={formData.publicKey} onChange={v => handleChange('publicKey', v)} />
                    </>
                );
            case 'STRIPE':
                return (
                    <>
                        <Field label="Secret Key" value={formData.secretKey} type="password" onChange={v => handleChange('secretKey', v)} />
                        <Field label="Publishable Key" value={formData.publishableKey} onChange={v => handleChange('publishableKey', v)} />
                        <Field label="Webhook Secret" value={formData.webhookSecret} type="password" onChange={v => handleChange('webhookSecret', v)} />
                    </>
                );
            default: return null;
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg flex-shrink-0 ${isEnabled ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                        <Icon className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-gray-900">{meta.name}</h3>
                        <p className="text-gray-500 text-sm">{meta.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggle(); }}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${isEnabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
                        role="switch"
                        aria-checked={isEnabled}
                    >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:bg-indigo-50 px-3 py-1.5 rounded transition-colors"
                    >
                        {expanded ? 'Close' : 'Configure'}
                    </button>
                </div>
            </div>

            {expanded && (
                <div className="border-t border-gray-100 bg-gray-50/50 p-6 animate-fade-in-down">
                    <div className="flex items-start gap-3 mb-6 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium">Security Note</p>
                            <p>Credentials are stored securely. Changing these values will immediately affect payment processing.</p>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                            <input
                                type="checkbox"
                                id={`test-${provider}`}
                                checked={isTest}
                                onChange={e => setIsTest(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor={`test-${provider}`} className="text-sm font-medium text-gray-700 select-none cursor-pointer">Enable Sandbox / Test Mode</label>
                        </div>
                        {renderFields()}
                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg px-6 py-2.5 flex items-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {saving ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

function Field({ label, value, onChange, type = "text" }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            <input
                type={type}
                value={value || ''}
                onChange={e => onChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                placeholder={`Enter ${label}`}
            />
        </div>
    );
}
