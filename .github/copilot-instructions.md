# Webinar Registration System - AI Coding Instructions

## Project Overview
This is a **high-converting webinar registration and confirmation page system** for The Cash Flow Academy's "Income Stacking" webinar. The project focuses on mobile-first design, conversion optimization, and seamless API integrations.

**Domain**: `training.thecashflowacademy.com/income-stacking-fb`

## Architecture Guidance

### Core Components
- **Registration Page**: Mobile-first, conversion-optimized landing page
- **Confirmation Page**: Thank you page with WebinarFuel widget
- **API Routes**: WebinarFuel and Infusionsoft integration endpoints
- **Date Logic**: Dynamic session date parsing and session ID mapping
- **Error Handling**: Robust retry logic and failure recovery

### Tech Stack
- **Framework**: Next.js (App Router) for optimal performance and Vercel deployment
- **Styling**: Tailwind CSS for rapid mobile-first development
- **APIs**: RESTful endpoints for WebinarFuel and Infusionsoft integrations
- **Storage**: Session storage for duplicate prevention
- **Deployment**: Vercel with domain `training.thecashflowacademy.com`

### Key Integration Points

#### WebinarFuel API
- **Base URL**: `https://api.webinarfuel.com`
- **Authentication**: Bearer token (`Dp2kG9Vucpyq5t5RVPqvDxfU`)
- **Endpoint**: `POST /api/registrants` for registrations
- **Session IDs**: Tuesday: `66235`, Saturday: `66238`
- **Widget IDs**: Registration: `hgtM93jQogXFn9gdLT1dSjUA`, Hidden Date: `KvKUagFa1nobkfcZGaSK3KiP`, Confirmation: `xCo1kQcuJZKwRwTTXcySfXJc`

#### Infusionsoft Integration
- **Account**: `yv932.infusionsoft.com`
- **Form XID**: `2d6fbc78abf8d18ab3268c6cfa02e974`
- **Required Fields**: First Name, Last Name, Email, Phone
- **Form Action**: `https://yv932.infusionsoft.com/app/form/process/2d6fbc78abf8d18ab3268c6cfa02e974`

### Conversion Optimization Patterns

#### Mobile-First Design
- Touch-friendly form inputs (min 44px height)
- Single-column layout with prominent CTA
- Fast loading (target <2s initial load)
- Progressive enhancement for desktop

#### Form Optimization
- Minimal required fields (Email + First Name priority)
- Inline validation with clear error messaging
- One-click submission with loading states
- Social proof positioned near form

#### Error Handling Strategy
1. **Dual Submission**: Submit to both WebinarFuel and Infusionsoft
2. **Retry Logic**: Exponential backoff (1s, 3s, 9s delays)
3. **Partial Success**: Log failures, show success to user if at least one succeeds
4. **Duplicate Prevention**: Session storage + email-based deduplication

## Development Workflow

### Project Structure
```
/pages
  /api
    /register.js         # Main registration endpoint
    /webinar-fuel.js     # WebinarFuel API proxy
    /infusionsoft.js     # Infusionsoft submission handler
  /index.js              # Registration page
  /confirmation.js       # Thank you page with widget
/components
  /RegistrationForm.js   # Main form component
  /WebinarWidget.js      # WebinarFuel widget wrapper
/lib
  /api-clients.js        # API integration utilities
  /date-parser.js        # Widget date parsing logic
  /session-mapper.js     # Date to session ID mapping
/styles
  /globals.css           # Tailwind + custom styles
```

### Critical Implementation Details

#### Date Parsing Logic
- Parse date from hidden WebinarFuel widget DOM after load
- Map Tuesday → Session ID `66235`, Saturday → Session ID `66238`
- Handle timezone conversion and edge cases

#### Duplicate Prevention
```javascript
// Session storage key pattern
const SUBMISSION_KEY = `submitted_${email.toLowerCase()}`;
```

#### API Payload Examples
**WebinarFuel Registration:**
```json
{
  "webinar_id": 75116,
  "registrant": {
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890"
  },
  "session": {
    "webinar_session_id": 66235,
    "scheduled_at": "2025-09-23T19:00:00Z"
  }
}
```

### Development Priorities
1. **Core Registration Flow**: Form → API integrations → Confirmation
2. **Mobile Optimization**: Touch interactions, loading states, form UX
3. **Error Resilience**: Retry logic, partial failure handling
4. **Performance**: Fast loading, minimal JavaScript, optimized images
5. **Conversion Testing**: A/B test hooks, analytics integration

When implementing features, always prioritize conversion rate optimization and mobile user experience. Consider the psychology of urgency, social proof, and trust signals throughout the user journey.