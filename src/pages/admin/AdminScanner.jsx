import { useState, useEffect, useRef } from 'react';
import {
    Scan,
    Camera,
    CheckCircle,
    XCircle,
    AlertCircle,
    Ticket,
    User,
    Calendar,
    Clock,
    RefreshCw,
    QrCode
} from 'lucide-react';
import { api } from '../../services/api';

export default function AdminScanner() {
    const [scanResult, setScanResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [manualCode, setManualCode] = useState('');
    const [recentScans, setRecentScans] = useState([]);
    const [stats, setStats] = useState({
        checkedIn: 0,
        total: 0,
        pending: 0
    });
    const inputRef = useRef(null);

    useEffect(() => {
        // Focus on input for barcode scanner
        inputRef.current?.focus();
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await api.getScannerStats();
            setStats(data || { checkedIn: 0, total: 0, pending: 0 });
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
    };

    const handleScan = async (code) => {
        if (!code || loading) return;

        try {
            setLoading(true);
            setError(null);
            setScanResult(null);

            const result = await api.checkInTicket(code);

            setScanResult({
                success: true,
                ticket: result.ticket,
                message: result.message || 'Ticket checked in successfully!'
            });

            // Add to recent scans
            setRecentScans(prev => [{
                code,
                success: true,
                ticket: result.ticket,
                time: new Date()
            }, ...prev.slice(0, 9)]);

            // Update stats
            loadStats();

        } catch (err) {
            console.error('Scan failed:', err);
            setScanResult({
                success: false,
                message: err.message || 'Invalid or already used ticket'
            });

            setRecentScans(prev => [{
                code,
                success: false,
                error: err.message,
                time: new Date()
            }, ...prev.slice(0, 9)]);
        } finally {
            setLoading(false);
            setManualCode('');
            inputRef.current?.focus();
        }
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (manualCode.trim()) {
            handleScan(manualCode.trim());
        }
    };

    const handleKeyPress = (e) => {
        // Barcode scanners typically send Enter after the code
        if (e.key === 'Enter' && manualCode.trim()) {
            handleScan(manualCode.trim());
        }
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-KE', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="admin-page scanner-page">
            <div className="admin-page-header">
                <div className="page-title">
                    <Scan className="w-8 h-8" />
                    <div>
                        <h1>Ticket Scanner</h1>
                        <p>Scan and validate tickets at the event</p>
                    </div>
                </div>
                <button className="btn-secondary" onClick={loadStats}>
                    <RefreshCw className="w-4 h-4" />
                    Refresh Stats
                </button>
            </div>

            {/* Stats */}
            <div className="scanner-stats">
                <div className="scanner-stat">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <div>
                        <span className="stat-value">{stats.checkedIn}</span>
                        <span className="stat-label">Checked In</span>
                    </div>
                </div>
                <div className="scanner-stat">
                    <Clock className="w-6 h-6 text-yellow-500" />
                    <div>
                        <span className="stat-value">{stats.pending}</span>
                        <span className="stat-label">Pending</span>
                    </div>
                </div>
                <div className="scanner-stat">
                    <Ticket className="w-6 h-6 text-blue-500" />
                    <div>
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-label">Total Tickets</span>
                    </div>
                </div>
                <div className="scanner-stat progress">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${stats.total > 0 ? (stats.checkedIn / stats.total) * 100 : 0}%` }}
                        ></div>
                    </div>
                    <span className="progress-label">
                        {stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0}% attendance
                    </span>
                </div>
            </div>

            <div className="scanner-layout">
                {/* Scanner Input */}
                <div className="scanner-input-section">
                    <div className="scanner-card">
                        <div className="scanner-icon">
                            <QrCode className="w-16 h-16" />
                        </div>
                        <h2>Scan Ticket QR Code</h2>
                        <p>Point your scanner at the ticket QR code or enter the code manually</p>

                        <form onSubmit={handleManualSubmit} className="manual-input-form">
                            <div className="input-group">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={manualCode}
                                    onChange={(e) => setManualCode(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Enter ticket code or scan..."
                                    className="scanner-input"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={loading || !manualCode.trim()}
                                >
                                    {loading ? (
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Scan className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Scan Result */}
                    {scanResult && (
                        <div className={`scan-result ${scanResult.success ? 'success' : 'error'}`}>
                            <div className="result-icon">
                                {scanResult.success ? (
                                    <CheckCircle className="w-16 h-16" />
                                ) : (
                                    <XCircle className="w-16 h-16" />
                                )}
                            </div>
                            <h3>{scanResult.success ? 'Valid Ticket!' : 'Invalid Ticket'}</h3>
                            <p>{scanResult.message}</p>

                            {scanResult.success && scanResult.ticket && (
                                <div className="ticket-info">
                                    <div className="info-row">
                                        <User className="w-4 h-4" />
                                        <span>
                                            {scanResult.ticket.holder?.first_name} {scanResult.ticket.holder?.last_name}
                                        </span>
                                    </div>
                                    <div className="info-row">
                                        <Calendar className="w-4 h-4" />
                                        <span>{scanResult.ticket.event?.title}</span>
                                    </div>
                                    <div className="info-row">
                                        <Ticket className="w-4 h-4" />
                                        <span>{scanResult.ticket.tier?.name}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Recent Scans */}
                <div className="recent-scans-section">
                    <div className="admin-card">
                        <div className="card-header">
                            <h2>
                                <Clock className="w-5 h-5" />
                                Recent Scans
                            </h2>
                        </div>
                        <div className="scans-list">
                            {recentScans.length === 0 ? (
                                <div className="empty-state">
                                    <Scan className="w-10 h-10" />
                                    <p>No scans yet</p>
                                </div>
                            ) : (
                                recentScans.map((scan, index) => (
                                    <div
                                        key={`${scan.code}-${scan.time}`}
                                        className={`scan-item ${scan.success ? 'success' : 'error'}`}
                                    >
                                        <div className="scan-status">
                                            {scan.success ? (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-500" />
                                            )}
                                        </div>
                                        <div className="scan-info">
                                            {scan.success && scan.ticket ? (
                                                <>
                                                    <span className="scan-name">
                                                        {scan.ticket.holder?.first_name} {scan.ticket.holder?.last_name}
                                                    </span>
                                                    <span className="scan-tier">{scan.ticket.tier?.name}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="scan-code">{scan.code?.slice(0, 16)}...</span>
                                                    <span className="scan-error">{scan.error}</span>
                                                </>
                                            )}
                                        </div>
                                        <span className="scan-time">{formatTime(scan.time)}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
