import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Ticket, Gift, Plus } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';
import './Events.css';

export default function Events() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [lotteryEntries, setLotteryEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'my-events', 'lottery'

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState(null);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    loadData(1);
  }, [user]);

  const loadData = async (page = 1) => {
    try {
      setLoading(true);
      setCurrentPage(page);

      // Load all published events with pagination
      const response = await api.getEvents(null, page, ITEMS_PER_PAGE);
      const eventsData = response.data || response;
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      if (response.meta) {
        setPaginationMeta(response.meta);
      }

      // If user is logged in, load their events and lottery entries
      if (user) {
        const [userEvents, entries] = await Promise.all([
          api.getMyEvents(),
          api.getMyLotteryEntries()
        ]);
        setMyEvents(userEvents);

        // Handle paginated lottery entries
        const entriesData = entries.data || entries;
        setLotteryEntries(Array.isArray(entriesData) ? entriesData : []);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    loadData(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMinPrice = (tiers) => {
    if (!tiers || !Array.isArray(tiers) || tiers.length === 0) return null;
    const prices = tiers.map(t => t.price).filter(price => typeof price === 'number');
    if (prices.length === 0) return null;
    return Math.min(...prices);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const isUserEntered = (eventId) => {
    return lotteryEntries.some(entry => entry.event_id === eventId);
  };

  const renderEventCard = (event, showLotteryBadge = false) => {
    const minPrice = getMinPrice(event.ticket_tiers);
    const hasEntered = isUserEntered(event.id);

    return (
      <div
        key={event.id}
        className="event-card"
        onClick={() => navigate(`/events/${event.id}`)}
      >
        {event.banner_image_url && (
          <div className="event-image">
            <img src={event.banner_image_url} alt={event.title} />
            {event.lottery_enabled && (
              <div className="lottery-badge">
                <Gift className="w-4 h-4" />
                <span>Lottery</span>
              </div>
            )}
            {showLotteryBadge && hasEntered && (
              <div className="entered-badge">
                <Gift className="w-4 h-4" />
                <span>Entered</span>
              </div>
            )}
          </div>
        )}

        <div className="event-content">
          <h3>{event.title}</h3>

          <div className="event-meta">
            <div className="meta-item">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(event.start_date)}</span>
            </div>

            {event.venue && (
              <div className="meta-item">
                <MapPin className="w-4 h-4" />
                <span>{event.venue}</span>
              </div>
            )}
          </div>

          {event.description && (
            <p className="event-description">{event.description}</p>
          )}

          <div className="event-footer">
            {minPrice && (
              <div className="price">
                <Ticket className="w-4 h-4" />
                <span>From {formatCurrency(minPrice)}</span>
              </div>
            )}

            <button className="btn-view">View Details</button>
          </div>
        </div>
      </div>
    );
  };

  const renderLotteryEventCard = (entry) => {
    const event = entry.event;
    if (!event) return null;

    return (
      <div
        key={entry.id}
        className="event-card lottery-entry-card"
        onClick={() => navigate(`/events/${event.id}`)}
      >
        {event.banner_image_url && (
          <div className="event-image">
            <img src={event.banner_image_url} alt={event.title} />
            <div className={`status-badge ${entry.is_winner ? 'winner' : 'pending'}`}>
              <Gift className="w-4 h-4" />
              <span>{entry.is_winner ? 'Winner!' : 'Entered'}</span>
            </div>
          </div>
        )}

        <div className="event-content">
          <h3>{event.title}</h3>

          <div className="event-meta">
            <div className="meta-item">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(event.start_date)}</span>
            </div>

            {event.venue && (
              <div className="meta-item">
                <MapPin className="w-4 h-4" />
                <span>{event.venue}</span>
              </div>
            )}
          </div>

          <div className="lottery-info">
            <p className="entry-date">
              Entered: {formatDate(entry.created_at)}
            </p>
            {entry.is_winner && entry.won_at && (
              <p className="won-date">
                Won: {formatDate(entry.won_at)}
              </p>
            )}
          </div>

          <button className="btn-view">
            {entry.is_winner ? 'View Ticket' : 'View Event'}
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="events-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="events-page">
      <div className="events-header">
        <div>
          <h1>Events</h1>
          <p>Discover and book tickets for amazing events</p>
        </div>

        {user && (
          <button
            className="btn-create"
            onClick={() => navigate('/admin/events/new')}
          >
            <Plus className="w-5 h-5" />
            Create Event
          </button>
        )}
      </div>

      {user && (
        <div className="events-tabs">
          <button
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Events ({events.length})
          </button>
          <button
            className={`tab ${activeTab === 'my-events' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-events')}
          >
            My Events ({myEvents.length})
          </button>
          <button
            className={`tab ${activeTab === 'lottery' ? 'active' : ''}`}
            onClick={() => setActiveTab('lottery')}
          >
            <Gift className="w-4 h-4" />
            Lottery Entries ({lotteryEntries.length})
          </button>
        </div>
      )}

      <div className="events-grid">
        {activeTab === 'all' && events.length === 0 && (
          <div className="empty-state">
            <Calendar className="w-16 h-16" />
            <h3>No events available</h3>
            <p>Check back later for upcoming events</p>
          </div>
        )}

        {activeTab === 'all' && events.map(event => renderEventCard(event, true))}

        {activeTab === 'my-events' && myEvents.length === 0 && (
          <div className="empty-state">
            <Ticket className="w-16 h-16" />
            <h3>No events created yet</h3>
            <p>Create your first event to get started</p>
            <button
              className="btn-primary"
              onClick={() => navigate('/admin/events/new')}
            >
              <Plus className="w-5 h-5" />
              Create Event
            </button>
          </div>
        )}

        {activeTab === 'my-events' && myEvents.map(event => renderEventCard(event))}

        {activeTab === 'lottery' && lotteryEntries.length === 0 && (
          <div className="empty-state">
            <Gift className="w-16 h-16" />
            <h3>No lottery entries yet</h3>
            <p>Enter a lottery to win free tickets</p>
          </div>
        )}

        {activeTab === 'lottery' && lotteryEntries.map(entry => renderLotteryEventCard(entry))}
      </div>

      {/* Pagination for all events tab */}
      {activeTab === 'all' && paginationMeta && (
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
    </div>
  );
}
