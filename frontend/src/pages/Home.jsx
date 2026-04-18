import { Link } from 'react-router-dom';
import { GraduationCap, Heart, FileText, Users, School, Building, ArrowRight, Sparkles, BookOpen, MonitorPlay, Award, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroBg from '../assets/education_hero.png';
import zeoDashboardPreview from '../assets/zeo_dashboard_preview.png';

/**
 * Home Component
 * @desc The landing page for the EduZone application.
 *       Features an immersive background, animated statistics, and portal entry points
 *       for Teachers, Principals, ZEO Admins, and Donors.
 *       Fully responsive layout utilizing Tailwind CSS.
 */
const Home = () => {
  return (
    <div className="min-h-screen bg-slate-950 relative font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">

      {/* BACKGROUND SECTION - Fixed Immersive Background with Effects */}
      <div className="fixed inset-0 z-0">
        {/* Hero background image */}
        <img
          src={heroBg}
          alt="Education Background"
          className="w-full h-full object-cover opacity-40 blur-[2px] scale-105"
        />
        {/* Gradient overlay to darken background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-indigo-950/80 to-slate-950/95 z-10"></div>

        {/* Animated Glows - Blue and Purple pulsing circles for visual interest */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      {/* NAVIGATION BAR - Fixed Glossy Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          {/* LOGO SECTION - Left side with EduZone branding */}
          <div className="flex items-center space-x-3">
            {/* Logo icon with gradient background */}
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            {/* Application name */}
            <span className="text-2xl font-bold text-white tracking-wide drop-shadow-md">EduZone</span>
          </div>

          {/* NAVIGATION LINKS - Right side with action buttons */}
          <div className="flex items-center space-x-4">
            {/* 
              LIBRARY LINK
              Purpose: Navigate to public resources library
              Icon: Book open icon
              Text: "Library" (hidden on mobile, shown on desktop)
              Background: Semi-transparent white, darker on hover
              Action: Click to go to /resources page
              Used for: Accessing public educational resources
            */}
            <Link to="/resources" className="text-white/80 hover:text-white transition-colors font-medium text-sm flex items-center bg-white/5 px-3 py-1.5 rounded-full hover:bg-white/10">
              <BookOpen className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Library</span>
            </Link>

            {/* 
              STAFF LOGIN BUTTON
              Purpose: Navigate to staff/user login page
              Icon: Login icon
              Text: "Staff Login" (hidden on mobile, shown on desktop)
              Background: Transparent with white on hover
              Action: Click to go to /login page
              Used for: Teachers, principals, ZEO staff login
            */}
            <Link to="/login">
              <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-blue-200 transition-colors font-semibold px-2 sm:px-4">
                <LogIn className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Staff Login</span>
              </Button>
            </Link>

            {/* 
              BECOME A DONOR BUTTON
              Purpose: Navigate to donor registration page
              Color: Gradient yellow/orange with shadow glow
              Text: "Become a Donor"
              Size: Small on mobile (xs), regular on desktop (base)
              Animation: Scale up slightly on hover
              Action: Click to go to /donor/register
              Shadow: Gold glow effect (rgba(251,191,36,0.4))
              Used for: Primary CTA to onboard donors
            */}
            <Link to="/donor/register">
              <Button className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-slate-900 font-bold border-0 shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-all hover:scale-105 text-xs px-3 sm:text-base sm:px-4">
                Become a Donor
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT - Scrollable content area */}
      <div className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto space-y-24">

          {/* HERO SECTION - Main heading and call-to-action */}
          <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* 
              BADGE - Zone tagline at top
              Purpose: Introduce the initiative/zone
              Background: Semi-transparent with backdrop blur
              Text: "Empowering The Hatton Zone"
              Icon: Sparkles icon in yellow
              Animation: Subtle entrance animation
              Used for: Introducing what initiative this is
            */}
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 text-sm font-semibold tracking-wide shadow-lg">
              <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
              Empowering The Hatton Zone
            </div>

            {/* 
              MAIN HEADING
              Purpose: Display primary headline
              Sizes:
              - Mobile: 4xl
              - Tablet: 6xl
              - Desktop: 8xl
              Style: Black font with white text
              Gradient text: "Connecting Futures" in blue/white/purple gradient
              Used for: Main hook/value proposition
            */}
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-white tracking-tight leading-tight drop-shadow-2xl">
              Empowering Education, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-purple-300">Connecting Futures</span>
            </h1>

            {/* 
              SUBHEADING
              Purpose: Explain main value proposition
              Size: Text-xl (larger)
              Color: Slate-300 with white emphasis on key numbers
              Max width: 2xl
              Used for: Supporting headline with key details (10 Schools, unified ecosystem)
            */}
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-light drop-shadow-lg">
              Seamlessly connecting <span className="text-white font-semibold">10 Schools</span>, administrative bodies, and generous donors in one unified glossy ecosystem.
            </p>

            {/* STATISTICS STRIP - Glass card with key metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto p-4 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:bg-white/10 transition-colors duration-500">
              {/* 
                STATISTICS - Key metrics displayed
                Elements:
                - Students: "12k+" in blue
                - Schools: "10" in indigo
                - Ranking: "#1" in yellow
                - Donors: "500+" in pink
                Each stat has: Icon, value, label
                Used for: Showing platform impact at a glance
              */}
              <StatItem icon={Users} value="12k+" label="Students" color="text-blue-400" />
              <StatItem icon={School} value="10" label="Schools" color="text-indigo-400" />
              <StatItem icon={Award} value="#1" label="Ranked" color="text-yellow-400" />
              <StatItem icon={Heart} value="500+" label="Donors" color="text-pink-400" />
            </div>
          </div>

          {/* PORTAL CARDS GRID - Three main entry points */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* 
              TEACHER PORTAL CARD
              Purpose: Entry point for teachers
              Title: "Teacher Portal"
              Description: "Digital resource management and student welfare tracking"
              Icon: Book/Learning icon (blue)
              Used for: Teachers to access their management tools
            */}
            <PortalCard
              role="teacher"
              title="Teacher Portal"
              desc="Digital resource management and student welfare tracking."
              icon={BookOpen}
              color="blue"
            />

            {/* 
              PRINCIPAL PORTAL CARD
              Purpose: Entry point for school principals
              Title: "Principal Portal"
              Description: "Administrative control, approvals, and school analytics"
              Icon: Building icon (purple)
              Used for: Principals to access school management tools
            */}
            <PortalCard
              role="principal"
              title="Principal Portal"
              desc="Administrative control, approvals, and school analytics."
              icon={Building}
              color="purple"
            />

            {/* 
              DONOR HUB CARD
              Purpose: Entry point for donors
              Title: "Donor Hub"
              Description: "Direct impact donations with transparency and updates"
              Icon: Heart icon (pink)
              Used for: Donors to manage donations and impact
            */}
            <PortalCard
              role="donor"
              title="Donor Hub"
              desc="Direct impact donations with transparency and updates."
              icon={Heart}
              color="pink"
            />
          </div>

          {/* ZEO ADMIN SECTION - Featured premium glass card */}
          <div className="rounded-[3rem] p-1 bg-gradient-to-br from-white/20 via-white/5 to-transparent shadow-2xl">
            <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[2.9rem] p-8 md:p-12 border border-white/10 relative overflow-hidden group">
              {/* Hover glow effect on orange gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="space-y-6 text-left max-w-2xl">
                  {/* 
                    ZEO SECTION HEADING
                    Purpose: Introduce the ZEO admin dashboard
                    Icon: Monitor/play icon in orange box
                    Title: "Administration Dashboard"
                    Description: Explain ZEO functionality
                    Used for: Showcasing admin capabilities
                  */}
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-orange-500/20 rounded-xl backdrop-blur-md border border-orange-500/30 text-orange-400">
                      <MonitorPlay className="w-8 h-8" />
                    </div>
                    <h2 className="text-4xl font-bold text-white">Administration Dashboard</h2>
                  </div>

                  {/* 
                    ZEO DESCRIPTION
                    Purpose: Explain what ZEO dashboard does
                    Features: Real-time insights, school allocations, regional development
                    Color: Slate-400 (lighter text for details)
                    Used for: Describing admin dashboard capabilities
                  */}
                  <p className="text-slate-400 text-lg leading-relaxed">
                    The command center for the Zonal Education Office. Access real-time insights, manage school allocations, and oversee regional development.
                  </p>

                  {/* 
                    ACCESS ZEO PANEL BUTTON
                    Purpose: Navigate to ZEO login
                    Color: Orange (ZEO brand color)
                    Size: Large (h-12 with generous padding)
                    Icon: Arrow right icon
                    Animation: Scale up on hover
                    Shadow: Orange glow effect
                    Action: Click to go to /login?role=zeo
                    Used for: Main CTA for ZEO administrators
                  */}
                  <Link to="/login?role=zeo" className="inline-block">
                    <Button className="h-12 px-8 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-lg font-bold shadow-[0_0_20px_rgba(234,88,12,0.3)] transition-transform hover:scale-105">
                      Access ZEO Panel <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>

                {/* 
                  ZEO DASHBOARD PREVIEW IMAGE
                  Purpose: Visual preview of ZEO dashboard
                  Image: zeoDashboardPreview.png
                  Effects:
                  - Border and padding
                  - Slight rotation (2deg) that resets on hover
                  - Glare/shine effect overlay
                  - Shadow for depth
                  Used for: Showcasing what ZEO dashboard looks like
                */}
                <div className="w-full max-w-sm h-64 rounded-2xl border border-white/10 p-2 relative backdrop-blur-md transform rotate-2 group-hover:rotate-0 transition-transform duration-700 shadow-2xl">
                  <img src={zeoDashboardPreview} alt="ZEO Dashboard" className="w-full h-full object-cover rounded-xl" />
                  {/* Glare/shine effect on top */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent rounded-xl pointer-events-none"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* FOOTER - Glossy footer bar */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
          {/* Logo and branding */}
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <GraduationCap className="w-5 h-5 text-blue-400" />
            <span className="font-semibold text-slate-200">EduZone</span>
          </div>
          {/* Copyright text */}
          <p>© 2026 Hatton Zonal Education Office.</p>
        </div>
      </footer>
    </div>
  );
};

const StatItem = ({ icon: Icon, value, label, color }) => (
  <div className="flex flex-col items-center">
    {/* 
      STAT ITEM COMPONENT
      Purpose: Display a single statistic in the stats strip
      Elements:
      - Icon: Specified icon with color from parent (blue, indigo, yellow, or pink)
      - Value: Large bold number (e.g., "12k+", "10", "#1", "500+")
      - Label: Small uppercase label (e.g., "Students", "Schools", "Ranked", "Donors")
      Used for: Showing key platform metrics in stats grid
    */}
    <Icon className={`w-6 h-6 mb-2 ${color} drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]`} />
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">{label}</div>
  </div>
);

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
        <div className="relative z-10">
          {/* 
            PORTAL CARD ICON CONTAINER
            Purpose: Display large icon for portal type
            Elements:
            - Icon: Specific to role (book for teacher, building for principal, heart for donor)
            - Background: Semi-transparent white box
            - Border: White/transparent border
            - Size: 14x14 units (56px), icon 7x7 (28px)
            Used for: Visual identification of portal type
          */}
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6 border border-white/20">
            <Icon className="w-7 h-7 text-white" />
          </div>

          {/* 
            PORTAL CARD TITLE
            Purpose: Display portal name
            Text: Specific to role (e.g., "Teacher Portal", "Principal Portal", "Donor Hub")
            Size: 2xl, bold, white
            Used for: Identifying what portal this is
          */}
          <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>

          {/* 
            PORTAL CARD DESCRIPTION
            Purpose: Brief explanation of portal functionality
            Text: Role-specific description
            Color: Slate-300 (lighter gray)
            Used for: Explaining what users can do in each portal
          */}
          <p className="text-slate-300 leading-relaxed mb-6">{desc}</p>

          {/* 
            PORTAL CARD CTA TEXT
            Purpose: Call-to-action indicating this is clickable
            Text: "Enter Portal"
            Icon: Right arrow with animation on hover (slides right)
            Color: White/70, becomes white on hover
            Used for: Indicating portal is clickable and user can enter
          */}
          <div className="flex items-center text-sm font-bold text-white/70 group-hover:text-white transition-colors uppercase tracking-wider">
            Enter Portal <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* 
          SHINE EFFECT
          Purpose: Add glossy shine effect on hover
          Effect: Gradient from white/5 to transparent moving top to bottom
          Animation: Fade in on hover (opacity: 0 to 100)
          Used for: Enhancing glassmorphism effect
        */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>
    </Link>
  );
};

export default Home;
