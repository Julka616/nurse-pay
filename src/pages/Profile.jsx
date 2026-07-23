import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTheme, setTheme as saveTheme } from "../utils/theme";
import api from "../utils/api";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [theme, setThemeState] = useState("light");

  // Stany dla formularza zmiany hasła
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser =
      JSON.parse(localStorage.getItem("user")) || null;

    setUser(savedUser);
    setThemeState(getTheme());
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    saveTheme(newTheme);
    setThemeState(newTheme);
  };

  const handleLogout = () => {
    const confirmed = window.confirm("Czy na pewno chcesz się wylogować?");
    if (!confirmed) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage("");
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Nowe hasła nie są identyczne.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Nowe hasło musi mieć co najmniej 6 znaków.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/change-password", {
        currentPassword,
        newPassword
      });

      setPasswordMessage(res.data.message || "Hasło zostało zmienione.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(
        err.response?.data?.message || "Nie udało się zmienić hasła."
      );
    } finally {
      setLoading(false);
    }
  };

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "?";

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4 pb-24 transition-colors">
      <h1 className="text-2xl font-bold text-sky-700 dark:text-sky-400 mb-5">
        👤 Profil
      </h1>

      {/* DANE UŻYTKOWNIKA */}
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

      {/* SEKCJA ZMIANY HASŁA */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow p-5 mb-5 transition-colors">
        <h2 className="font-bold text-slate-800 dark:text-white mb-4">
          🔒 Zmień hasło
        </h2>

        {passwordMessage && (
          <div className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-2xl p-3 mb-4 text-sm">
            {passwordMessage}
          </div>
        )}

        {passwordError && (
          <div className="bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-2xl p-3 mb-4 text-sm">
            {passwordError}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Aktualne hasło
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl p-3 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Nowe hasło
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl p-3 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Powtórz nowe hasło
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl p-3 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-2xl transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? "Zapisywanie..." : "Zapisz nowe hasło"}
          </button>
        </form>
      </div>

      {/* MOTYW */}
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

      {/* WYLOGOWANIE */}
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