import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Calendar, MapPin, ArrowRight, Loader } from 'lucide-react';

export default function LandingPage() {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadFeatured();
    }, []);

    const loadFeatured = async () => {
        try {
            const featured = await api.getFeaturedEvent();
            if (featured && featured.id) {
                setEvent(featured);
            } else {
                // If no featured event, redirect to events list
                navigate('/events');
            }
        } catch (err) {
            console.error('Failed to load featured event', err);
            // On error also fallback to events
            navigate('/events');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
            <Loader className="animate-spin w-10 h-10 text-blue-500" />
        </div>
    );

    // If redirect happens fast, this might flash. 
    if (!event) return null;

    return (
        <div className="landing-page min-h-screen bg-gray-900">
            {/* Hero Section */}
            <div className="relative h-screen min-h-[600px] flex items-center justify-center text-white overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 z-0">
                    {event.banner_image_url ? (
                        <div className="absolute inset-0 bg-black/60 z-10"></div>
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-black z-10"></div>
                    )}
                    {event.banner_image_url && (
                        <img
                            src={event.banner_image_url}
                            alt={event.title}
                            className="w-full h-full object-cover transform scale-105 filter blur-sm opacity-50"
                        />
                    )}
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-black/40 z-10" />
                </div>

                {/* Content */}
                <div className="relative z-20 text-center px-4 max-w-6xl mx-auto">
                    <div className="mb-8 inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-xl">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        <span className="text-sm font-medium uppercase tracking-widest text-white/90">Featured Event</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tighter text-white drop-shadow-2xl leading-tight">
                        {event.title}
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto font-light leading-relaxed line-clamp-3 drop-shadow-lg">
                        {event.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-6 mb-16 text-lg font-medium">
                        <div className="flex items-center bg-black/40 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 shadow-lg">
                            <Calendar className="w-6 h-6 mr-3 text-blue-400" />
                            {new Date(event.start_date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="flex items-center bg-black/40 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 shadow-lg">
                            <MapPin className="w-6 h-6 mr-3 text-red-400" />
                            {event.venue || 'Venue TBD'}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link
                            to={`/events/${event.id}`}
                            className="group relative inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white transition-all duration-200 bg-blue-600 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 hover:bg-blue-700 hover:scale-105 shadow-blue-500/30 shadow-lg"
                        >
                            Get Tickets
                            <ArrowRight className="ml-3 w-6 h-6 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <Link
                            to="/events"
                            className="inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white transition-all duration-200 bg-white/5 border border-white/20 rounded-full hover:bg-white/10 hover:border-white/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 backdrop-blur-sm"
                        >
                            Browse All Events
                        </Link>
                    </div>
                </div>
                {/* Footer  */}
                <div className="absolute bottom-4 w-full text-center z-20 text-gray-400 text-sm">
                    Powered by <a href="https://vitaldigitalmedia.net/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors font-medium">Vital Digital Media</a>
                </div>
            </div>
        </div>
    );
}
