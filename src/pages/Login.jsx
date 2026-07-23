import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";

function Login() {
  const navigate = useNavigate();

  // Tryb: false = logowanie, true = reset hasła
  const [isResetMode, setIsResetMode] = useState(false);

  // Stany dla pól formularza
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Obsługa logowania
  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert("Zalogowano ✅");
      navigate("/home");
    } catch (err) {
      alert(
        err.response?.data?.message || "Błędny email lub hasło."
      );
    }
  };

  // Obsługa resetu hasła
  const handleResetPassword = async () => {
    if (!email) {
      alert("Podaj swój adres e-mail!");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      alert("Nowe hasło musi mieć co najmniej 6 znaków!");
      return;
    }

    try {
      const res = await api.post("/auth/reset-password", {
        email,
        newPassword,
      });

      alert(res.data.message || "Hasło zostało pomyślnie zmienione! Możesz się zalogować.");
      setIsResetMode(false);
      setPassword("");
      setNewPassword("");
    } catch (err) {
      alert(
        err.response?.data?.message || "Nie udało się zresetować hasła."
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4 transition-colors">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-xl p-6 transition-colors">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">👩‍⚕️</div>

          <h1 className="text-3xl font-bold text-sky-700 dark:text-sky-400">
            NursePay
          </h1>

          <p className="text-gray-500 dark:text-slate-400">
            {isResetMode ? "Resetowanie hasła" : "Zaloguj się"}
          </p>
        </div>

        {!isResetMode ? (
          /* FORMULARZ LOGOWANIA */
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border dark:border-slate-700 dark:bg-slate-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            />

            <input
              type="password"
              placeholder="Hasło"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border dark:border-slate-700 dark:bg-slate-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            />

            <div className="text-right">
              <button
                type="button"
                onClick={() => setIsResetMode(true)}
                className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-medium"
              >
                Nie pamiętasz hasła?
              </button>
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white p-3 rounded-xl font-bold transition-colors"
            >
              Zaloguj się
            </button>

            <p className="text-center mt-5 text-sm dark:text-slate-300">
              Nie masz konta?
              <Link
                to="/register"
                className="text-emerald-600 dark:text-emerald-400 font-bold ml-2 hover:underline"
              >
                Rejestracja
              </Link>
            </p>
          </div>
        ) : (
          /* FORMULARZ RESETU HASŁA */
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Podaj swój e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border dark:border-slate-700 dark:bg-slate-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            />

            <input
              type="password"
              placeholder="Ustaw nowe hasło"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 border dark:border-slate-700 dark:bg-slate-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            />

            <button
              onClick={handleResetPassword}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white p-3 rounded-xl font-bold transition-colors"
            >
              Zapisz nowe hasło
            </button>

            <button
              type="button"
              onClick={() => setIsResetMode(false)}
              className="w-full text-gray-500 dark:text-slate-400 text-sm hover:underline mt-2 text-center block"
            >
              ← Wróć do logowania
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;