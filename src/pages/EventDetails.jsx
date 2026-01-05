import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Clock, Users, Gift, ShoppingCart, Bell, Lock, Unlock, ArrowRight } from 'lucide-react';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [tiers, setTiers] = useState({});
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [lotteryStats, setLotteryStats] = useState(null);
  const [isEligible, setIsEligible] = useState(true);
  const [enteringLottery, setEnteringLottery] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [waitlistTier, setWaitlistTier] = useState(null);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [joiningWaitlist, setJoiningWaitlist] = useState(false);

  // Private Event State
  const [isLocked, setIsLocked] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [verifyingAccess, setVerifyingAccess] = useState(false);
  const [accessError, setAccessError] = useState('');

  useEffect(() => {
    loadEventData();
  }, [id]);

  const loadEventData = async () => {
    try {
      const [eventData, tiersData] = await Promise.all([
        api.getEvent(id),
        api.getEventTiers(id),
      ]);

      setEvent(eventData);
      setEvent(eventData);
      setTiers(tiersData);

      // Check for private event access
      if (eventData.visibility === 'PRIVATE') {
        const unlockedEvents = JSON.parse(localStorage.getItem('unlocked_events') || '{}');
        // If not unlocked, set locked state
        if (!unlockedEvents[id]) {
          setIsLocked(true);
        }
      }

      if (eventData.lottery_enabled) {
        const stats = await api.getLotteryStats(id);
        setLotteryStats(stats);

        // Check if user has already entered
        if (isAuthenticated) {
          try {
            const eligibility = await api.checkLotteryEligibility(id);
            setIsEligible(eligibility.eligible);
          } catch (error) {
            console.error('Failed to check lottery eligibility:', error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load event:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (tierId, quantity = 1) => {
    setCart((prev) => ({
      ...prev,
      [tierId]: (prev[tierId] || 0) + quantity,
    }));
  };

  const removeFromCart = (tierId) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[tierId] > 1) {
        newCart[tierId]--;
      } else {
        delete newCart[tierId];
      }
      return newCart;
    });
  };

  const calculateTotal = () => {
    return Object.entries(cart).reduce((total, [tierId, quantity]) => {
      const tier = findTierById(tierId);
      return total + (tier ? tier.price * quantity : 0);
    }, 0);
  };

  const findTierById = (tierId) => {
    for (const category in tiers) {
      const tier = tiers[category]?.find((t) => t.id === tierId);
      if (tier) return tier;
    }
    return null;
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }

    const items = Object.entries(cart).map(([tierId, quantity]) => {
      const tier = findTierById(tierId);
      return {
        tierId,
        quantity,
        price: Number(tier?.price || 0),
        tierName: tier?.name || 'Unknown',
      };
    });

    navigate('/checkout', {
      state: {
        eventId: id,
        items,
        event,
        allowsLayaway: event?.allows_layaway || false,
      },
    });
  };

  const handleAdopt = (tierId) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }

    navigate('/adopt', {
      state: { eventId: id, tierId, event },
    });
  };

  const handleEnterLottery = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }

    setEnteringLottery(true);
    try {
      await api.enterLottery(id);
      setIsEligible(false);
      const stats = await api.getLotteryStats(id);
      setLotteryStats(stats);
      alert('Successfully entered the lottery!');
    } catch (error) {
      console.error('Failed to enter lottery:', error);
      alert(error.message || 'Failed to enter lottery');
    } finally {
      setEnteringLottery(false);
    }
  };

  const openWaitlistModal = (tier) => {
    setWaitlistTier(tier);
    setShowWaitlistModal(true);
  };

  const verifyAccessCode = async (e) => {
    e.preventDefault();
    setVerifyingAccess(true);
    setAccessError('');

    try {
      const result = await api.verifyEventAccess(id, accessCode);
      if (result.valid) {
        // Store unlock status
        const unlockedEvents = JSON.parse(localStorage.getItem('unlocked_events') || '{}');
        unlockedEvents[id] = true;
        localStorage.setItem('unlocked_events', JSON.stringify(unlockedEvents));
        setIsLocked(false);
      } else {
        setAccessError('Invalid access code. Please try again.');
      }
    } catch (error) {
      console.error('Access verification failed:', error);
      setAccessError('Failed to verify code. Please try again.');
    } finally {
      setVerifyingAccess(false);
    }
  };

  const handleJoinWaitlist = async (e) => {
    e.preventDefault();
    if (!waitlistEmail || !waitlistTier) return;

    setJoiningWaitlist(true);
    try {
      await api.joinWaitlist({
        eventId: event.id,
        tierId: waitlistTier.id,
        email: waitlistEmail,
      });
      alert('You have been added to the waitlist! We will notify you if tickets become available.');
      setShowWaitlistModal(false);
      setWaitlistEmail('');
      setWaitlistTier(null);
    } catch (error) {
      console.error('Failed to join waitlist:', error);
      alert(error.message || 'Failed to join waitlist');
    } finally {
      setJoiningWaitlist(false);
    }
  };

  const isSaleActive = (tier) => {
    const now = new Date();
    if (tier.sales_start && now < new Date(tier.sales_start)) return false;
    if (tier.sales_end && now > new Date(tier.sales_end)) return false;
    return tier.remaining_quantity > 0;
  };

  const getSaleStatus = (tier) => {
    const now = new Date();
    if (tier.sales_start && now < new Date(tier.sales_start)) {
      return { text: 'Coming Soon', color: 'text-blue-600' };
    }
    if (tier.sales_end && now > new Date(tier.sales_end)) {
      return { text: 'Ended', color: 'text-red-600' };
    }
    if (tier.remaining_quantity === 0) {
      return { text: 'Sold Out', color: 'text-red-600' };
    }
    if (tier.remaining_quantity < 10) {
      return { text: `Only ${tier.remaining_quantity} left!`, color: 'text-orange-600' };
    }
    return { text: 'Available', color: 'text-green-600' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p>Event not found</p>
      </div>
    );
  }

  const total = calculateTotal();

  // Locked Screen
  if (isLocked && event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-purple-900 p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-purple-800 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-purple-200" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Private Party</h2>
            <p className="text-purple-200">This event is invite-only.</p>
          </div>

          <div className="p-8">
            <div className="text-center mb-6">
              <h3 className="font-semibold text-gray-900 text-lg">{event.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{new Date(event.start_date).toLocaleDateString()}</p>
            </div>

            <form onSubmit={verifyAccessCode} className="space-y-4">
              <div>
                <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter Access Code
                </label>
                <input
                  type="text"
                  id="accessCode"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-center font-mono text-lg tracking-widest uppercase"
                  placeholder="ENTER CODE"
                  required
                />
              </div>

              {accessError && (
                <p className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
                  {accessError}
                </p>
              )}

              <button
                type="submit"
                disabled={verifyingAccess || !accessCode}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifyingAccess ? (
                  'Verifying...'
                ) : (
                  <>
                    Unlock Event <Unlock className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/events')}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Back to Public Events
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const cartItemCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Event Header */}
      <div className="mb-8">
        {event.banner_image_url && (
          <img
            src={event.banner_image_url}
            alt={event.title}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
        )}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>
        <p className="text-gray-600 text-lg mb-6">{event.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>
              {new Date(event.start_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span>{event.venue}</span>
          </div>
        </div>
      </div>

      {/* Lottery Info */}
      {event.lottery_enabled && lotteryStats && (
        <div className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Gift className="w-8 h-8 text-yellow-600" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">Adopt-a-Ticket Program</h2>
              <p className="text-gray-700">Gift tickets to random entrants through our lottery system</p>
            </div>
            {isAuthenticated && (
              <div>
                {!isEligible ? (
                  <div className="bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold">
                    Already Entered
                  </div>
                ) : (
                  <button
                    onClick={handleEnterLottery}
                    disabled={enteringLottery}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enteringLottery ? 'Entering...' : 'Enter Lottery (Free)'}
                  </button>
                )}
              </div>
            )}
            {!isAuthenticated && (
              <button
                onClick={() => navigate('/login', { state: { from: `/events/${id}` } })}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
              >
                Login to Enter
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{lotteryStats.totalEntries}</p>
              <p className="text-sm text-gray-600">Lottery Entries</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{lotteryStats.availableTickets}</p>
              <p className="text-sm text-gray-600">Tickets in Pool</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{lotteryStats.totalWinners}</p>
              <p className="text-sm text-gray-600">Winners</p>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Tiers */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Tickets</h2>

        {Object.entries(tiers).map(([category, categoryTiers]) => (
          <div key={category} className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 uppercase tracking-wide">
              {category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryTiers.map((tier) => {
                const status = getSaleStatus(tier);
                const active = isSaleActive(tier);
                const inCart = cart[tier.id] || 0;

                return (
                  <div
                    key={tier.id}
                    className={`border-2 rounded-lg p-6 ${active ? 'border-blue-300 bg-white' : 'border-gray-200 bg-gray-50'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-bold text-gray-900">{tier.name}</h4>
                      <span className={`text-sm font-semibold ${status.color}`}>{status.text}</span>
                    </div>

                    <p className="text-3xl font-bold text-blue-600 mb-4">
                      KES {Number(tier.price).toLocaleString()}
                    </p>

                    {tier.tickets_per_unit > 1 && (
                      <p className="text-sm text-gray-600 mb-3">
                        <Users className="inline w-4 h-4 mr-1" />
                        {tier.tickets_per_unit} tickets per unit
                      </p>
                    )}

                    {tier.sales_start && (
                      <p className="text-xs text-gray-500 mb-2">
                        <Clock className="inline w-3 h-3 mr-1" />
                        Sales: {new Date(tier.sales_start).toLocaleDateString()} -{' '}
                        {tier.sales_end ? new Date(tier.sales_end).toLocaleDateString() : 'Ongoing'}
                      </p>
                    )}

                    <div className="flex gap-2 mt-4">
                      {active ? (
                        <>
                          {inCart > 0 ? (
                            <div className="flex items-center gap-2 flex-1">
                              <button
                                onClick={() => removeFromCart(tier.id)}
                                className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300"
                              >
                                -
                              </button>
                              <span className="flex-1 text-center font-semibold">{inCart}</span>
                              <button
                                onClick={() => addToCart(tier.id)}
                                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
                                disabled={inCart >= tier.max_qty_per_order}
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(tier.id)}
                              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                            >
                              Add to Cart
                            </button>
                          )}
                          {event.lottery_enabled && (
                            <button
                              onClick={() => handleAdopt(tier.id)}
                              className="bg-yellow-500 text-white p-2 rounded-lg hover:bg-yellow-600"
                              title="Adopt this ticket"
                            >
                              <Gift className="w-5 h-5" />
                            </button>
                          )}
                        </>
                      ) : (
                        tier.remaining_quantity === 0 ? (
                          <button
                            onClick={() => openWaitlistModal(tier)}
                            className="flex-1 bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-900 flex items-center justify-center gap-2"
                          >
                            <Bell className="w-4 h-4" />
                            Join Waitlist
                          </button>
                        ) : (
                          <button disabled className="flex-1 bg-gray-300 text-gray-600 py-2 px-4 rounded-lg cursor-not-allowed">
                            Not Available
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-semibold text-gray-900">
                  {cartItemCount} item{cartItemCount > 1 ? 's' : ''} in cart
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {total === 0 ? 'FREE' : `KES ${total.toLocaleString()}`}
                </p>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold text-lg"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}

      {/* Waitlist Modal */}
      {
        showWaitlistModal && waitlistTier && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Join Waitlist</h3>
                <button
                  onClick={() => setShowWaitlistModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                Get notified when more tickets for <strong>{waitlistTier.name}</strong> become available.
              </p>

              <form onSubmit={handleJoinWaitlist}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowWaitlistModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={joiningWaitlist}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {joiningWaitlist ? 'Joining...' : 'Notify Me'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </div >
  );
}
