import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTheme, setTheme as saveTheme } from "../utils/theme";


function Profile() {

  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [theme, setThemeState] = useState("light");


  useEffect(() => {

    const savedUser =
      JSON.parse(
        localStorage.getItem("user")
      ) || null;

    setUser(savedUser);

    setThemeState(getTheme());

  }, []);


  const toggleTheme = () => {

    const newTheme =
      theme === "dark" ? "light" : "dark";

    saveTheme(newTheme);

    setThemeState(newTheme);

  };


  const handleLogout = () => {

    const confirmed = window.confirm(
      "Czy na pewno chcesz się wylogować?"
    );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");

  };


  const initials =
    user
      ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
      : "?";


  return (

    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4 pb-24 transition-colors">


      <h1 className="text-2xl font-bold text-sky-700 dark:text-sky-400 mb-5">

        👤 Profil

      </h1>



      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow p-6 mb-5 flex items-center gap-4 transition-colors">

        <div className="w-16 h-16 rounded-full bg-sky-600 text-white flex items-center justify-center text-2xl font-bold shrink-0">

          {initials}

        </div>

        <div>

          <h2 className="text-lg font-bold text-slate-800 dark:text-white">

            {user
              ? `${user.firstName} ${user.lastName}`
              : "Nie zalogowano"}

          </h2>

          <p className="text-slate-500 dark:text-slate-400 text-sm">

            {user?.email || "-"}

          </p>

        </div>

      </div>



      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow p-5 mb-5 transition-colors">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="font-bold text-slate-800 dark:text-white">

              {theme === "dark" ? "🌙 Tryb ciemny" : "☀️ Tryb jasny"}

            </h2>

            <p className="text-slate-500 dark:text-slate-400 text-sm">

              Przełącz wygląd aplikacji

            </p>

          </div>


          <button

            type="button"

            onClick={toggleTheme}

            aria-label="Przełącz tryb ciemny"

            className={`

              w-16 h-9 rounded-full flex items-center px-1 transition-colors shrink-0

              ${theme === "dark" ? "bg-sky-600 justify-end" : "bg-slate-300 justify-start"}

            `}

          >

            <span className="w-7 h-7 rounded-full bg-white shadow flex items-center justify-center text-sm">

              {theme === "dark" ? "🌙" : "☀️"}

            </span>

          </button>

        </div>

      </div>



      <button

        type="button"

        onClick={handleLogout}

        className="w-full bg-red-500 text-white p-4 rounded-2xl font-bold shadow hover:bg-red-600 transition-colors"

      >

        🚪 Wyloguj się

      </button>


    </div>

  );

}


export default Profile;
