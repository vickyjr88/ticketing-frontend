# Ticketing System Frontend

Event ticketing and management system frontend built with React, Vite, and modern web technologies.

## Features

- 🎫 **Event Discovery** - Browse and search for events
- 🎟️ **Ticket Purchase** - Buy tickets with multiple payment options
- 🎰 **Lottery Entry** - Enter "Adopt-a-Ticket" lottery for free tickets
- 💳 **Payment Integration** - Stripe, Paystack, and M-Pesa checkout
- 📱 **QR Code Display** - View and download ticket QR codes
- 🔐 **User Authentication** - Secure login and registration
- 📊 **Order History** - Track purchased tickets and orders
- 👤 **User Dashboard** - Manage profile and tickets
- 🎨 **Admin Panel** - Event and ticket management (for organizers)
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: CSS3 with modern features
- **Icons**: Lucide React
- **HTTP Client**: Fetch API
- **State Management**: React Context + Hooks
- **Authentication**: JWT tokens

## Prerequisites

- Node.js 18+ and npm
- Backend API running (see `../backend_ticketing/`)

## Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

## Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# Payment Configuration (Optional - handled by backend)
# VITE_STRIPE_PUBLIC_KEY=pk_test_...
# VITE_PAYSTACK_PUBLIC_KEY=pk_test_...
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── ImagePicker.jsx # Image upload component
│   └── ...
├── pages/              # Page components
│   ├── admin/         # Admin pages
│   │   ├── AdminEvents.jsx
│   │   ├── AdminEventForm.jsx
│   │   └── ...
│   ├── Events.jsx     # Public event listing
│   ├── EventDetails.jsx
│   ├── Checkout.jsx
│   ├── Login.jsx
│   └── ...
├── services/          # API services
│   └── api.js        # API client
├── context/          # React Context
│   └── AuthContext.jsx
├── App.jsx           # Main app component
├── main.jsx         # Entry point
└── index.css        # Global styles
```

## Key Features

### Public Pages
- **Home** - Landing page with featured events
- **Events** - Browse all available events
- **Event Details** - View event information and ticket tiers
- **Checkout** - Purchase tickets with payment options
- **Login/Register** - User authentication

### User Dashboard
- **My Tickets** - View purchased tickets with QR codes
- **Order History** - Track all orders
- **Profile** - Manage account settings
- **Lottery Entries** - View lottery participation

### Admin Panel (Event Organizers)
- **Event Management** - Create, edit, delete events
- **Ticket Tiers** - Manage ticket types and pricing
- **Image Upload** - Upload event banner images to S3
- **Sales Analytics** - View ticket sales (coming soon)
- **Lottery Management** - Draw lottery winners

## API Integration

The frontend communicates with the backend API:

```javascript
import { api } from './services/api';

// Get events
const events = await api.getEvents();

// Purchase tickets
const order = await api.createOrder(orderData);

// Upload event image
const imageUrl = await api.uploadEventImage(eventId, file);
```

## Authentication

JWT-based authentication with token storage:

```javascript
// Login
const { token, user } = await api.login(email, password);
localStorage.setItem('token', token);

// Protected routes
<PrivateRoute>
  <MyTickets />
</PrivateRoute>
```

## Payment Integration

### Stripe
- Card payments
- Redirect to Stripe Checkout
- Webhook confirmation

### Paystack
- Card and bank payments
- Redirect to Paystack
- Payment verification

### M-Pesa (Coming Soon)
- STK Push
- Mobile money payments

## Image Upload

Event organizers can upload banner images:

```jsx
<ImagePicker
  label="Event Banner"
  currentImage={imageUrl}
  onImageUpload={handleUpload}
  eventId={eventId}
/>
```

Features:
- Drag-and-drop upload
- File validation (type, size)
- Image preview
- Automatic S3 upload
- Progress indication

## Responsive Design

The app is fully responsive:
- **Desktop**: Full-featured layout
- **Tablet**: Optimized for touch
- **Mobile**: Mobile-first design

## Deployment

### Build for Production

```bash
npm run build
```

Output in `dist/` directory.

### Docker

```bash
# Build image
docker build -t ticketing-frontend .

# Run container
docker run -p 80:80 ticketing-frontend
```

### Deploy to Netlify/Vercel

```bash
# Netlify
netlify deploy --prod

# Vercel
vercel --prod
```

### AWS S3 + CloudFront

```bash
# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

## Environment-Specific Builds

```bash
# Development
npm run dev

# Staging
VITE_API_URL=https://api-staging.example.com npm run build

# Production
VITE_API_URL=https://api.example.com npm run build
```

## Performance Optimization

- Code splitting with React.lazy()
- Image optimization
- Lazy loading for images
- Minification and compression
- CDN for static assets

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Security

- XSS protection
- CSRF tokens (handled by backend)
- Secure token storage
- Input validation
- Content Security Policy (CSP)

## Testing

```bash
# Run tests (when implemented)
npm run test

# E2E tests (when implemented)
npm run test:e2e
```

## Styling

Custom CSS with modern features:
- CSS Grid and Flexbox
- CSS Variables
- Responsive design
- Animations and transitions
- Dark mode support (coming soon)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### API Connection Issues
- Check `VITE_API_URL` in `.env`
- Verify backend is running
- Check CORS configuration

### Build Errors
- Clear `node_modules` and reinstall
- Check Node.js version (18+)
- Verify all dependencies are installed

### Payment Issues
- Check payment provider configuration
- Verify API keys
- Check webhook endpoints

## License

This project is proprietary software.

## Support

For issues and questions:
- GitHub Issues: https://github.com/vickyjr88/ticketing-frontend/issues
- Email: support@example.com

## Related Projects

- Backend: `../backend_ticketing/`
- Mobile App: `../mobile_app/`
- Infrastructure: `../infrastructure/`

## Roadmap

- [ ] Dark mode
- [ ] Multi-language support
- [ ] Advanced search and filters
- [ ] Social sharing
- [ ] Event recommendations
- [ ] Push notifications
- [ ] Offline support (PWA)
- [ ] Analytics dashboard
