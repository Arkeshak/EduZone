# EduZone Frontend Documentation - Examples

This file shows examples of the comprehensive documentation style applied across the codebase.

## Example 1: Form Field Documentation (from Login.jsx)

```javascript
<div className="space-y-2">
  <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
  {/* 
    EMAIL INPUT FIELD
    Purpose: Collect user's email for authentication
    Validation: Required field, must be valid email format
    Type: Email input (browser validates format)
    Icon: Mail icon on left side of input
    Placeholder: "enter your email...." (instructional)
    States:
    - Focused: Blue/white border, brighter text
    - Error: (handled by parent form validation)
    - Disabled: Not used for email field
    Action: On change, updates formData.email state
    Used for: Primary login identifier (username)
  */}
  <div className="relative group">
    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-white transition-colors" />
    <input
      type="email"
      required
      value={formData.email}
      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30 focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all"
      placeholder="enter your email...."
    />
  </div>
</div>
```

## Example 2: Button Documentation (from ForgotPassword.jsx)

```javascript
{/* 
  SEND RESET LINK BUTTON
  Purpose: Submit email and send password reset link
  Color: Indigo (default/universal color)
  Size: Full width
  States:
  - Normal: Indigo background, clickable, hover brightens color
  - Loading: Shows "Sending Link..." text, disabled
  - Hover: Brighter indigo, slightly raised (translateY)
  Height: 12 units (48px)
  Padding: Large horizontal padding (8 units)
  Font: Large (text-lg), bold weight
  Animations: Smooth transitions, raises on hover
  Action: Click to request password reset
  Result on success: Shows success screen with email confirmation
  Result on failure: Error toast message shown with reason
  Used for: Main action to initiate password reset
*/}
<Button 
  className="w-full h-12 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg rounded-xl transition-all hover:-translate-y-0.5" 
  type="submit" 
  disabled={loading}
>
  {loading ? 'Sending Link...' : 'Send Reset Link'}
</Button>
```

## Example 3: Component Documentation (from Home.jsx)

```javascript
/**
 * HERO SECTION - Main heading and call-to-action
 * 
 * Purpose: Create impactful first impression on landing page
 * Features:
 * - Zone tagline badge at top
 * - Large, gradient-text headline
 * - Supporting subheading with key metrics
 * - Statistics strip showing platform impact
 * 
 * Visual Effect:
 * - Centered layout
 * - Entrance animation (fade in + slide up)
 * - Drop shadow on text for contrast
 * 
 * Hierarchy:
 * 1. Small badge: "Empowering The Hatton Zone"
 * 2. Large headline: "Empowering Education, Connecting Futures"
 * 3. Subheading: Context about 10 schools and donors
 * 4. Stats: Key metrics in glossy strip
 */
<div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
  {/* Badge */}
  <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 text-sm font-semibold tracking-wide shadow-lg">
    <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
    Empowering The Hatton Zone
  </div>

  {/* Headline with gradient text */}
  <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-white tracking-tight leading-tight drop-shadow-2xl">
    Empowering Education, <br />
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-purple-300">
      Connecting Futures
    </span>
  </h1>

  {/* Subheading */}
  <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-light drop-shadow-lg">
    Seamlessly connecting <span className="text-white font-semibold">10 Schools</span>, administrative bodies, and generous donors in one unified glossy ecosystem.
  </p>

  {/* Statistics */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto p-4 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:bg-white/10 transition-colors duration-500">
    <StatItem icon={Users} value="12k+" label="Students" color="text-blue-400" />
    <StatItem icon={School} value="10" label="Schools" color="text-indigo-400" />
    <StatItem icon={Award} value="#1" label="Ranked" color="text-yellow-400" />
    <StatItem icon={Heart} value="500+" label="Donors" color="text-pink-400" />
  </div>
</div>
```

## Example 4: API Interceptor Documentation (from apiClient.js)

```javascript
/**
 * REQUEST INTERCEPTOR: Attach Token + Proactive Refresh
 * 
 * Purpose: 
 * 1. Attach JWT token to every request
 * 2. Proactively refresh token before expiration
 * 3. Handle concurrent refresh scenarios
 * 
 * Process:
 * 1. Get stored JWT token and refresh token
 * 2. Check if JWT token is expiring within 5 minutes
 * 3. If expiring and refresh token available, attempt refresh now
 * 4. Attach token to Authorization header
 * 5. Continue with request
 * 
 * Benefits of proactive refresh:
 * - Prevents 401 errors during user activity
 * - Better user experience (no interruption)
 * - Token always valid when needed
 */
client.interceptors.request.use(
  async (config) => {
    let token = getToken();
    const refreshToken = getRefreshToken();

    /**
     * PROACTIVE TOKEN REFRESH
     * 
     * Check if token is expiring within 5 minutes
     * isTokenExpiring(token, 5) = expires in next 5 minutes?
     * 
     * Conditions:
     * - Token exists
     * - Token expiring soon
     * - Refresh token exists
     * - Not already refreshing (prevents duplicate calls)
     * 
     * If true: Attempt to refresh token now before it expires
     */
    if (token && isTokenExpiring(token, 5)) {
      if (refreshToken && !isRefreshing) {
        try {
          isRefreshing = true;
          const refreshUrl = import.meta.env.VITE_API_URL
            ? `${import.meta.env.VITE_API_URL}/auth/refresh`
            : 'http://localhost:5000/api/auth/refresh';

          const { data } = await axios.post(refreshUrl, { refreshToken });

          if (data.token) {
            setToken(data.token);
            token = data.token;
          }
        } catch (err) {
          console.error('Proactive token refresh failed:', err);
        } finally {
          isRefreshing = false;
        }
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);
```

## Example 5: Modal Component Documentation (from ChangePassword.jsx)

```javascript
{/* 
  CHANGE PASSWORD TOGGLE BUTTON
  Purpose: Open the change password form/modal
  When closed: Shows button to open the form
  Icon: Lock icon + text "Change Password"
  Color: Outlined (secondary button style)
  Size: Full width on mobile, auto on desktop (sm:w-auto)
  Action: Click to open change password card
  Used for: Security management in user profile
*/}
<Button 
  variant="outline" 
  onClick={() => setIsOpen(true)} 
  className="w-full sm:w-auto"
>
  <Lock className="w-4 h-4 mr-2" /> Change Password
</Button>

{/* ... Form opens below button ... */}

<Card className="mt-6 border-blue-100 shadow-sm">
  <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-lg font-medium">Change Password</CardTitle>
    {/* 
      CLOSE BUTTON (Form Header)
      Purpose: Close the change password form
      Icon: X icon
      Action: Click to close form and reset state
      Location: Top right of card
      Used for: Dismissing the form without saving
    */}
    <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
      <X className="w-4 h-4" />
    </Button>
  </CardHeader>
</Card>
```

## Example 6: Sub-Component Documentation (from Home.jsx)

```javascript
const PortalCard = ({ role, title, desc, icon: Icon, color }) => {
  {/* 
    PORTAL CARD STYLING CONFIGURATION
    Purpose: Define gradient and hover styles for each portal type
    Colors:
    - Blue: For Teacher Portal (learning/education)
    - Purple: For Principal Portal (authority/administration)
    - Pink: For Donor Hub (compassion/contribution)
    Each has: Gradient background, border color, hover shadow, text color
  */}
  const gradients = {
    blue: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] text-blue-300 group-hover:text-blue-200",
    purple: "from-purple-500/20 to-fuchsia-500/20 border-purple-500/30 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] text-purple-300 group-hover:text-purple-200",
    pink: "from-pink-500/20 to-rose-500/20 border-pink-500/30 hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] text-pink-300 group-hover:text-pink-200",
  };

  return (
    <Link to={`/login?role=${role}`} className="group block">
      {/* 
        PORTAL CARD CONTAINER
        Purpose: Interactive card linking to portal login with specific role
        Features:
        - Full height card with padding
        - Gradient background (colored by role)
        - Backdrop blur for glassmorphism effect
        - Border with role-specific color
        - Hover effects: lift up (-translate-y-2), shadow glow
        - Smooth transitions
        Used for: Main entry point to different portal types
      */}
      <div className={`h-full p-8 rounded-[2rem] bg-gradient-to-br ${gradients[color]} backdrop-blur-xl border relative overflow-hidden transition-all duration-500 hover:-translate-y-2`}>
        {/* Content inside card */}
      </div>
    </Link>
  );
};
```

## Documentation Pattern Guidelines

Every comment follows this pattern:

```javascript
{/* 
  ELEMENT NAME (ALL CAPS)
  
  Purpose: What does this element do?
  
  Visual Details:
  - Color/styling
  - Size/dimensions
  - Icons/imagery
  - Animations/effects
  
  Functionality:
  - What happens when used
  - States and changes
  - Validation rules
  
  Context:
  - Where is this used
  - Related elements
  - Data flow
  
  User Interaction:
  - Click/tap behavior
  - Input handling
  - Result/outcome
*/}
```

## Color Scheme Reference (from theme.css)

```css
/* Teacher Portal - Blue */
--teacher-primary: #0ea5e9;
--teacher-secondary: #06b6d4;

/* Principal Portal - Purple */
--principal-primary: #a855f7;
--principal-secondary: #7c3aed;

/* Donor Hub - Pink */
--donor-primary: #ec4899;
--donor-secondary: #f43f5e;

/* ZEO Admin - Orange */
--zeo-primary: #f97316;
--zeo-secondary: #fb923c;

/* Default/General - Indigo */
--default-primary: #4f46e5;
--default-secondary: #6366f1;
```

## Key Documentation Principles Applied

1. **Clarity Over Brevity** - Explains intent and behavior completely
2. **Context Matters** - Shows how element fits in larger system
3. **User-Centric** - Explains from user interaction perspective
4. **Technical Accuracy** - Precise about states and behavior
5. **Practical Examples** - References real code in comments
6. **Consistent Format** - Same structure across all files
7. **Maintainability** - Easy for future developers to understand

---

*These examples demonstrate the comprehensive documentation style applied to the EduZone frontend codebase.*
