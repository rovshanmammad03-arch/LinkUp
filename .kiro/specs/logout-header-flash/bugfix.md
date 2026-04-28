# Bugfix Requirements Document

## Introduction

After a user logs out, the authenticated Navbar (showing profile avatar, messages, notifications, and settings) briefly flashes on the landing page before disappearing. The correct unauthenticated Navbar (with Login/Register buttons) only renders after a manual page refresh. This creates a confusing and broken visual experience at the moment of logout.

The root cause is a timing mismatch during the logout transition: `logout()` in `AuthContext` calls `setCurrentUser(null)` and then `onNavigate('landing', {}, true)` is called in sequence from the Navbar click handler. However, because `currentRoute` state in `AppContent` is initialized from `localStorage`, and the route update and React state propagation happen across two separate state updates in the same render cycle, the Navbar briefly receives the new route (`landing`) while `currentUser` still holds the previous authenticated value — causing the authenticated header to render on the landing page for one frame before the null state propagates.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a logged-in user clicks the logout button in the settings dropdown THEN the system briefly renders the authenticated Navbar (with profile, messages, notifications icons) on the landing page before switching to the unauthenticated Navbar

1.2 WHEN the logout action triggers `setCurrentUser(null)` and `onNavigate('landing', {}, true)` in the same synchronous call THEN the system renders an intermediate state where `currentRoute` is `'landing'` but `currentUser` is not yet null in the Navbar component

1.3 WHEN the page is on the landing route with a non-null `currentUser` value THEN the system renders the full authenticated header (profile avatar, messages badge, notifications bell, settings cog) instead of the Login/Register buttons

### Expected Behavior (Correct)

2.1 WHEN a logged-in user clicks the logout button THEN the system SHALL render the unauthenticated Navbar (with Login/Register buttons) immediately on the landing page without any visible flash of the authenticated header

2.2 WHEN `logout()` is called and navigation to `'landing'` is triggered THEN the system SHALL ensure `currentUser` is null before the Navbar re-renders with the new route

2.3 WHEN the landing page is rendered after logout THEN the system SHALL display only the unauthenticated Navbar regardless of whether a page refresh has occurred

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a non-authenticated user visits the landing page directly THEN the system SHALL CONTINUE TO render the unauthenticated Navbar with Login/Register buttons

3.2 WHEN a logged-in user navigates between authenticated pages (dashboard, discover, messages, profile) THEN the system SHALL CONTINUE TO render the authenticated Navbar correctly

3.3 WHEN a user logs in successfully THEN the system SHALL CONTINUE TO transition from the unauthenticated Navbar to the authenticated Navbar without visual artifacts

3.4 WHEN the page is refreshed while the user is logged in THEN the system SHALL CONTINUE TO restore the authenticated session and render the authenticated Navbar

3.5 WHEN the page is refreshed after logout THEN the system SHALL CONTINUE TO render the unauthenticated Navbar on the landing page

3.6 WHEN the `onAuthStateChange` listener fires after `supabase.auth.signOut()` completes THEN the system SHALL CONTINUE TO keep `currentUser` as null (no re-authentication side effect)

---

## Bug Condition

### Bug Condition Function

```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type LogoutTransitionState
    X.currentUser  — the React state value of currentUser at render time
    X.currentRoute — the React state value of currentRoute at render time
  OUTPUT: boolean

  // Bug fires when the route has already changed to 'landing'
  // but currentUser has not yet been set to null
  RETURN X.currentRoute = 'landing' AND X.currentUser ≠ null
END FUNCTION
```

### Property: Fix Checking

```pascal
// Property: Fix Checking — No authenticated header on landing after logout
FOR ALL X WHERE isBugCondition(X) DO
  renderedNavbar ← Navbar(currentUser = X.currentUser, currentRoute = X.currentRoute)
  ASSERT renderedNavbar = UnauthenticatedNavbar  // Login/Register buttons visible
  ASSERT renderedNavbar ≠ AuthenticatedNavbar    // No profile/messages/notifications
END FOR
```

### Property: Preservation Checking

```pascal
// Property: Preservation Checking — existing behavior unchanged for non-buggy states
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT Navbar(X) = Navbar'(X)
END FOR
```
