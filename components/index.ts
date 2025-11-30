// =============================================================================
// Component Exports
// =============================================================================
// This file provides a single entry point for all shared components.
// Components are organized into logical groups for better maintainability.
// =============================================================================

// -----------------------------------------------------------------------------
// Event Components
// -----------------------------------------------------------------------------
// Components related to displaying event information
export { EventCard } from "./EventCard";
export { EventStatusBadge } from "./EventStatusBadge";
export { EventTimeline } from "./EventTimeline";
export { OrganizerCard } from "./OrganizerCard";
export { RegistrationCard } from "./RegistrationCard";

// -----------------------------------------------------------------------------
// Layout Components
// -----------------------------------------------------------------------------
// Components for page structure and navigation
export { Navbar } from "./Navbar";
export { Footer } from "./Footer";
export { LanguageSwitcher } from "./LanguageSwitcher";

// -----------------------------------------------------------------------------
// Form Components (UI Primitives)
// -----------------------------------------------------------------------------
// Reusable form input components
export {
  FormSection,
  InputField,
  TextareaField,
  SelectField,
  DateTimeField,
  CheckboxField,
} from "./FormControls";

// -----------------------------------------------------------------------------
// Error Handling
// -----------------------------------------------------------------------------
// Components for error handling and recovery
export { ErrorBoundary, withErrorBoundary } from "./ErrorBoundary";

// -----------------------------------------------------------------------------
// Performance Monitoring
// -----------------------------------------------------------------------------
// Components for tracking web vitals and performance
export { WebVitals, sendToAnalytics } from "./WebVitals";

// -----------------------------------------------------------------------------
// Providers
// -----------------------------------------------------------------------------
// Client-side providers wrapper
export { ClientProviders } from "./ClientProviders";
