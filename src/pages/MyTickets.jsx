import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Ticket, Calendar, MapPin, QrCode, Download, Send } from 'lucide-react';
import Pagination from '../components/Pagination';

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [qrCode, setQrCode] = useState('');

  // Transfer state
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferEmail, setTransferEmail] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [transferError, setTransferError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState(null);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    loadTickets(1);
  }, []);

  const loadTickets = async (page = 1) => {
    try {
      setLoading(true);
      setCurrentPage(page);
      const response = await api.getMyTickets(page, ITEMS_PER_PAGE);
      const data = response.data || response;
      setTickets(Array.isArray(data) ? data : []);
      if (response.meta) {
        setPaginationMeta(response.meta);
      }
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    loadTickets(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewQR = async (ticket) => {
    try {
      const response = await api.getTicketQRCode(ticket.id);
      setQrCode(response.qrCode);
      setSelectedTicket(ticket);
    } catch (error) {
      console.error('Failed to load QR code:', error);
    }
  };

  const closeModal = () => {
    setSelectedTicket(null);
    setQrCode('');
    setShowTransferModal(false);
    setTransferEmail('');
    setTransferError(null);
  };

  const initiateTransfer = (ticket) => {
    setSelectedTicket(ticket);
    setShowTransferModal(true);
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!transferEmail) return;

    setTransferring(true);
    setTransferError(null);

    try {
      await api.transferTicket(selectedTicket.id, transferEmail);
      alert(`Ticket successfully transferred to ${transferEmail}`);
      closeModal();
      loadTickets(); // Refresh list to remove transferred ticket
    } catch (err) {
      console.error('Transfer failed:', err);
      setTransferError(err.message || 'Failed to transfer ticket');
    } finally {
      setTransferring(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      ISSUED: 'bg-green-100 text-green-800',
      WON: 'bg-purple-100 text-purple-800',
      REDEEMED: 'bg-gray-100 text-gray-800',
      POOL: 'bg-yellow-100 text-yellow-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Tickets</h1>
        <p className="text-gray-600">View and manage your event tickets</p>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <Ticket className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No tickets yet</h3>
          <p className="text-gray-500 mb-6">Purchase tickets to see them here</p>
          <a
            href="/events"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Browse Events
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{ticket.event.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(ticket.event.start_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{ticket.event.venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4" />
                    <span className="font-semibold">{ticket.tier.name}</span>
                  </div>
                </div>

                {ticket.type === 'ADOPTED' && (
                  <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800 font-medium">
                      {ticket.status === 'POOL' ? '🎁 In Lottery Pool' : '🎉 Lottery Winner!'}
                    </p>
                  </div>
                )}

                {ticket.status === 'REDEEMED' && ticket.checked_in_at && (
                  <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      ✓ Checked in on{' '}
                      {new Date(ticket.checked_in_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}

                {(ticket.status === 'ISSUED' || ticket.status === 'WON') && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewQR(ticket)}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      <QrCode className="w-4 h-4" />
                      View QR
                    </button>
                    <button
                      onClick={() => initiateTransfer(ticket)}
                      className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Transfer
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {paginationMeta && (
        <Pagination
          currentPage={currentPage}
          totalPages={paginationMeta.totalPages}
          onPageChange={handlePageChange}
          hasNextPage={paginationMeta.hasNextPage}
          hasPrevPage={paginationMeta.hasPrevPage}
          total={paginationMeta.total}
          limit={ITEMS_PER_PAGE}
        />
      )}

      {/* Transfer Modal */}
      {showTransferModal && selectedTicket && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Transfer Ticket</h3>
            <p className="text-gray-600 mb-6">
              Enter the email address of the person you want to transfer this ticket to.
              <br />
              <span className="text-red-600 text-sm font-semibold">
                Warning: This action cannot be undone.
              </span>
            </p>

            <form onSubmit={handleTransfer}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={transferEmail}
                  onChange={(e) => setTransferEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="friend@example.com"
                  required
                />
              </div>

              {transferError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {transferError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
                  disabled={transferring}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={transferring}
                >
                  {transferring ? 'Transferring...' : 'Confirm Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {selectedTicket && qrCode && !showTransferModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedTicket.event.title}
              </h3>
              <p className="text-gray-600 mb-4">{selectedTicket.tier.name}</p>

              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4">
                <img src={qrCode} alt="QR Code" className="w-full max-w-xs mx-auto" />
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Show this QR code at the entrance for check-in
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = qrCode;
                    link.download = `ticket-${selectedTicket.id}.png`;
                    link.click();
                  }}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
