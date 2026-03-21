# Login.jsx — Code Explanation

This file is the **Login page** component for the app. It renders a login form and manages its state.

---

## 1. Imports

```jsx
import { useState } from 'react'
import './Login.css'
```

| Import | Purpose |
|---|---|
| `useState` | React hook — lets the component remember values (like what the user types) |
| `Login.css` | Styles specific to this page |

---

## 2. State Variables

```jsx
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [isLoading, setIsLoading] = useState(false)
```

These three variables store the form's **live data**:

- **`email`** — tracks what the user types in the email field
- **`password`** — tracks what the user types in the password field
- **`isLoading`** — `true` while the form is being "submitted" (shows a spinner), `false` otherwise

`useState('')` means the initial value is an empty string. `useState(false)` means initially not loading.

---

## 3. Form Submit Handler

```jsx
const handleSubmit = (e) => {
  e.preventDefault()       // stops the page from refreshing on submit
  setIsLoading(true)       // show the spinner
  setTimeout(() => setIsLoading(false), 1500)  // hide it after 1.5 seconds
}
```

- `e.preventDefault()` — prevents the default browser behaviour (page reload) when a form is submitted.
- The `setTimeout` simulates a network request. In a real app, you'd replace it with an API call (e.g. `fetch('/api/login')`).

---

## 4. Demo Account Filler — Deep Dive

```jsx
const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
}
```

> **Note:** `fillDemo` is still defined in the component but the demo cards that called it have been **removed from the JSX**. The function is currently unused — it can be deleted, or kept here if you plan to re-add demo cards later.

### What are the parameters?

`fillDemo` takes **two arguments**:

| Parameter | Type | Example value |
|---|---|---|
| `demoEmail` | string | `'admin@univ.fr'` |
| `demoPassword` | string | `'admin'` |

These are just local names inside the function — they hold whatever values are passed in when the function is called.

---

### What do `setEmail` and `setPassword` do here?

Remember the state variables declared at the top:

```jsx
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
```

- `email` is the **current value** stored in React's memory.
- `setEmail` is the **updater function** — calling it replaces the stored value and tells React to re-render.

So when `fillDemo('admin@univ.fr', 'admin')` is called:

```
setEmail('admin@univ.fr')   →  email    is now 'admin@univ.fr'
setPassword('admin')         →  password is now 'admin'
```

React immediately re-renders the component, and the inputs display the new values.

---

### Why use a function instead of setting state directly?

You could set the state directly inside an `onClick` without a separate function:

```jsx
// Without fillDemo:
onClick={() => { setEmail('admin@univ.fr'); setPassword('admin') }}
```

But `fillDemo` is cleaner — it groups the two updates together under a readable name, and avoids repeating the same logic for every caller.

---

## 5. The JSX (what gets rendered)

The `return (...)` block is **JSX** — it looks like HTML but is actually JavaScript.

### Overall layout
```jsx
<div className="page-wrapper">   ← full-page background
  <div className="login-card">   ← the white centred card
```

### Icon + Title
```jsx
<div className="icon-circle"> ... </div>   ← blue circle with SVG icon
<h1 className="title">Gestion Matériel Universitaire</h1>
<p className="subtitle">Connectez-vous à votre compte</p>
```

### The Form
```jsx
<form onSubmit={handleSubmit} className="login-form">
```
`onSubmit={handleSubmit}` — calls `handleSubmit` when the user presses the submit button.

#### Email input
```jsx
<input
  id="email"
  type="email"
  value={email}                          // controlled by state
  onChange={(e) => setEmail(e.target.value)}  // updates state on every keystroke
  ...
/>
```
This is a **controlled input** — React owns the value, not the browser.

#### Password input — same pattern as email, with `type="password"`.

#### Submit button
```jsx
<button className={`submit-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
  {isLoading ? <span className="spinner"></span> : 'Se connecter'}
</button>
```
- Adds the CSS class `loading` when `isLoading` is true (dims the button).
- `disabled={isLoading}` prevents double-clicks.
- Shows a spinning animation while loading, otherwise shows the text "Se connecter".

> **Demo cards have been removed.** The `<hr className="divider" />` and `.demo-section` block are no longer in the JSX. The form now ends directly after the submit button.

---

## 6. Export

```jsx
export default Login
```

Makes the `Login` component available to other files — specifically imported by `App.jsx` and assigned to the `/` route.

---

## Data Flow Summary

```
User types in input
  → onChange fires
    → setEmail / setPassword updates state
      → React re-renders the input with the new value

User clicks Submit
  → handleSubmit fires
    → setIsLoading(true) → spinner appears
      → after 1.5s → setIsLoading(false) → button returns to normal
```
