import { Link } from 'react-router-dom';
import {
    Users,
    Shield,
    Zap,
    Heart,
    Award,
    Globe,
    Ticket,
    Smartphone,
    CheckCircle,
    ArrowRight,
    Star
} from 'lucide-react';

function AboutUs() {
    return (
        <div className="about-page">
            {/* Hero Section */}
            <section className="about-hero">
                <div className="hero-content">
                    <div className="hero-badge">
                        <Star size={16} />
                        <span>Trusted by thousands</span>
                    </div>
                    <h1>About Pipita Tickets</h1>
                    <p>Your premier destination for event ticketing in Kenya. We make memorable experiences accessible to everyone.</p>
                </div>
                <div className="hero-visual">
                    <div className="floating-tickets">
                        <Ticket size={40} className="ticket-1" />
                        <Ticket size={60} className="ticket-2" />
                        <Ticket size={35} className="ticket-3" />
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="mission-section">
                <div className="section-container">
                    <div className="mission-content">
                        <h2>Our Mission</h2>
                        <p className="mission-statement">
                            To connect people with unforgettable experiences by providing a seamless, secure, and accessible ticketing platform for events across Kenya and beyond.
                        </p>
                    </div>
                    <div className="values-grid">
                        <div className="value-card">
                            <div className="value-icon">
                                <Shield size={28} />
                            </div>
                            <h3>Trust & Security</h3>
                            <p>Your transactions and data are protected with bank-grade security measures.</p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">
                                <Zap size={28} />
                            </div>
                            <h3>Fast & Simple</h3>
                            <p>Buy tickets in seconds with our streamlined checkout process.</p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">
                                <Heart size={28} />
                            </div>
                            <h3>Customer First</h3>
                            <p>Dedicated support team ready to help you every step of the way.</p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">
                                <Globe size={28} />
                            </div>
                            <h3>Local & Global</h3>
                            <p>Supporting local events while connecting to the global entertainment scene.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="section-container">
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-number">50K+</span>
                            <span className="stat-label">Tickets Sold</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">200+</span>
                            <span className="stat-label">Events Hosted</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">10K+</span>
                            <span className="stat-label">Happy Customers</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">99.9%</span>
                            <span className="stat-label">Uptime</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="section-container">
                    <div className="section-header">
                        <h2>Why Choose Pipita?</h2>
                        <p>We've built the best ticketing experience for you</p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <Smartphone size={32} />
                            </div>
                            <h3>Mobile First</h3>
                            <p>Access your tickets anytime, anywhere. Our mobile-optimized platform ensures you never miss an event.</p>
                            <ul className="feature-list">
                                <li><CheckCircle size={16} /> Digital tickets on your phone</li>
                                <li><CheckCircle size={16} /> Instant QR code scanning</li>
                                <li><CheckCircle size={16} /> Offline ticket access</li>
                            </ul>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <Shield size={32} />
                            </div>
                            <h3>Secure Payments</h3>
                            <p>Multiple payment options with industry-leading security to protect your transactions.</p>
                            <ul className="feature-list">
                                <li><CheckCircle size={16} /> M-Pesa integration</li>
                                <li><CheckCircle size={16} /> Card payments</li>
                                <li><CheckCircle size={16} /> Bank transfers</li>
                            </ul>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <Users size={32} />
                            </div>
                            <h3>Event Organizers</h3>
                            <p>Powerful tools for event creators to manage their events effortlessly.</p>
                            <ul className="feature-list">
                                <li><CheckCircle size={16} /> Real-time analytics</li>
                                <li><CheckCircle size={16} /> Custom branding</li>
                                <li><CheckCircle size={16} /> Gate management</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="team-section">
                <div className="section-container">
                    <div className="section-header">
                        <h2>Meet Our Team</h2>
                        <p>Passionate people dedicated to creating amazing experiences</p>
                    </div>
                    <div className="team-grid">
                        <div className="team-card">
                            <div className="team-avatar">
                                <Users size={40} />
                            </div>
                            <h3>The Founders</h3>
                            <p className="team-role">Leadership</p>
                            <p>Visionaries who started Pipita with a mission to transform event experiences in Africa.</p>
                        </div>
                        <div className="team-card">
                            <div className="team-avatar">
                                <Zap size={40} />
                            </div>
                            <h3>Tech Team</h3>
                            <p className="team-role">Engineering</p>
                            <p>Building robust, scalable solutions that power thousands of events.</p>
                        </div>
                        <div className="team-card">
                            <div className="team-avatar">
                                <Heart size={40} />
                            </div>
                            <h3>Support Team</h3>
                            <p className="team-role">Customer Success</p>
                            <p>Always ready to help you with any questions or issues you might have.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Awards Section */}
            <section className="awards-section">
                <div className="section-container">
                    <div className="awards-content">
                        <div className="awards-icon">
                            <Award size={48} />
                        </div>
                        <h2>Trusted by Top Event Organizers</h2>
                        <p>From music festivals to corporate events, Pipita is the choice of leading event organizers across Kenya.</p>
                        <div className="trust-badges">
                            <span className="trust-badge">SSL Secured</span>
                            <span className="trust-badge">PCI Compliant</span>
                            <span className="trust-badge">24/7 Support</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="section-container">
                    <div className="cta-content">
                        <h2>Ready to Experience Amazing Events?</h2>
                        <p>Browse upcoming events and secure your tickets today.</p>
                        <div className="cta-buttons">
                            <Link to="/events" className="btn-primary-large">
                                Browse Events
                                <ArrowRight size={20} />
                            </Link>
                            <Link to="/contact" className="btn-outline-large">
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default AboutUs;
