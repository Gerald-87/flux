import { useContext } from 'react';
// This file is kept for simplicity, but its logic has been moved to AuthContext.
// We will re-export the context hook from here.

// To use the auth context, import from this file:
// import { useAuth } from '../hooks/useAuth';

// The actual implementation is in `../contexts/AuthContext.tsx`
// This is a common pattern to avoid circular dependencies and keep hook usage clean.
export { useAuth } from '../contexts/AuthContext';
