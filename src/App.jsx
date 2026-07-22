import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useLocation
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Schedule from "./pages/Schedule";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";


function BottomNavigation() {

  const location = useLocation();

  if (
    location.pathname === "/" ||
    location.pathname === "/register"
  ) {
    return null;
  }

  const navigationItems = [
    {
      path: "/home",
      icon: "🏠",
      label: "Start"
    },
    {
      path: "/schedule",
      icon: "📋",
      label: "Dyżury"
    },
    {
      path: "/calendar",
      icon: "📅",
      label: "Kalendarz"
    },
    {
      path: "/settings",
      icon: "⚙️",
      label: "Ustawienia"
    },
    {
      path: "/profile",
      icon: "👤",
      label: "Profil"
    }
  ];

  return (

    <nav
      className="
        fixed
        bottom-0
        left-0
        right-0
        z-50
        border-t
        border-slate-200
        dark:border-slate-700
        bg-white
        dark:bg-slate-800
        shadow-[0_-4px_15px_rgba(0,0,0,0.08)]
        transition-colors
      "
    >

      <div
        className="
          mx-auto
          flex
          max-w-2xl
          items-center
          justify-around
          px-2
          py-2
        "
      >

        {navigationItems.map((item) => (

          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex
              min-w-[58px]
              flex-col
              items-center
              justify-center
              rounded-2xl
              px-2
              py-2
              text-xs
              font-semibold
              transition

              ${
                isActive
                  ? "bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }
            `}
          >

            <span className="text-xl">
              {item.icon}
            </span>

            <span className="mt-1">
              {item.label}
            </span>

          </NavLink>

        ))}

      </div>

    </nav>

  );

}


function AppContent() {

  return (

    <>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/home"
          element={<Home />}
        />

        <Route
          path="/schedule"
          element={<Schedule />}
        />

        <Route
          path="/calendar"
          element={<Calendar />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

      </Routes>

      <BottomNavigation />

    </>

  );

}


function App() {

  return (

    <BrowserRouter>
      <AppContent />
    </BrowserRouter>

  );

}


export default App;