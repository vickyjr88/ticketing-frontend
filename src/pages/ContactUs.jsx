import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Mail,
    Phone,
    MapPin,
    Send,
    Clock,
    MessageSquare,
    CheckCircle,
    AlertCircle,
    Loader2,
    ChevronDown
} from 'lucide-react';
import api from '../services/api';

const SUBJECTS = [
    { value: 'GENERAL', label: 'General Inquiry' },
    { value: 'SUPPORT', label: 'Technical Support' },
    { value: 'TICKETING', label: 'Ticketing Issues' },
    { value: 'EVENTS', label: 'Event Information' },
    { value: 'PARTNERSHIP', label: 'Partnership Opportunities' },
    { value: 'REFUND', label: 'Refund Request' },
    { value: 'OTHER', label: 'Other' },
];

function ContactUs() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: 'GENERAL',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await api.submitContactForm(formData);
            setSubmitted(true);
            setFormData({ name: '', email: '', phone: '', subject: 'GENERAL', message: '' });
        } catch (err) {
            setError(err.message || 'Failed to send message. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="contact-success-page">
                <div className="success-card">
                    <div className="success-icon">
                        <CheckCircle size={64} />
                    </div>
                    <h1>Message Sent!</h1>
                    <p>Thank you for contacting us. We've received your message and will get back to you within 24-48 hours.</p>
                    <p className="email-note">A confirmation email has been sent to your inbox.</p>
                    <div className="success-actions">
                        <button onClick={() => setSubmitted(false)} className="btn-secondary">
                            Send Another Message
                        </button>
                        <Link to="/" className="btn-primary">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="contact-page">
            {/* Hero Section */}
            <section className="contact-hero">
                <div className="hero-content">
                    <h1>Get in Touch</h1>
                    <p>Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
                </div>
                <div className="hero-pattern"></div>
            </section>

            <div className="contact-container">
                {/* Contact Info Cards */}
                <div className="contact-info-grid">
                    <div className="info-card">
                        <div className="info-icon email-icon">
                            <Mail size={24} />
                        </div>
                        <h3>Email Us</h3>
                        <p>shengmtaa@gmail.com</p>
                        <span className="info-detail">We reply within 24 hours</span>
                    </div>

                    <div className="info-card">
                        <div className="info-icon phone-icon">
                            <Phone size={24} />
                        </div>
                        <h3>Call Us</h3>
                        <p>+254 747 206 415</p>
                        <span className="info-detail">Mon-Fri, 9am-6pm EAT</span>
                    </div>

                    <div className="info-card">
                        <div className="info-icon location-icon">
                            <MapPin size={24} />
                        </div>
                        <h3>Visit Us</h3>
                        <p>Nairobi, Kenya</p>
                        <span className="info-detail">By appointment only</span>
                    </div>

                    <div className="info-card">
                        <div className="info-icon hours-icon">
                            <Clock size={24} />
                        </div>
                        <h3>Support Hours</h3>
                        <p>Monday - Friday</p>
                        <span className="info-detail">9:00 AM - 6:00 PM EAT</span>
                    </div>
                </div>

                {/* Contact Form Section */}
                <div className="contact-form-section">
                    <div className="form-header">
                        <MessageSquare size={32} />
                        <h2>Send Us a Message</h2>
                        <p>Fill out the form below and we'll get back to you shortly.</p>
                    </div>

                    {error && (
                        <div className="form-error">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="contact-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">Full Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email Address *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="phone">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+254 700 000 000"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="subject">Subject *</label>
                                <div className="select-wrapper">
                                    <select
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                    >
                                        {SUBJECTS.map(s => (
                                            <option key={s.value} value={s.value}>{s.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={20} className="select-icon" />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="message">Message *</label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Tell us how we can help..."
                                rows={6}
                                minLength={10}
                                required
                            />
                            <span className="char-count">{formData.message.length} / 2000</span>
                        </div>

                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={20} className="spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    Send Message
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* FAQ Teaser */}
                <div className="faq-teaser">
                    <h3>Looking for quick answers?</h3>
                    <p>Check out our frequently asked questions for instant help with common inquiries.</p>
                    <Link to="/about" className="btn-outline">
                        Learn More About Us
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ContactUs;
