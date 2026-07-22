import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const handleLogin = async () => {

        try {

            const res = await api.post("/auth/login", {

                email,
                password

            });

            localStorage.setItem(
                "token",
                res.data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(res.data.user)
            );

            alert("Zalogowano ✅");

            navigate("/home");

        } catch (err) {

            alert(

                err.response?.data?.message ||

                "Błędny email lub hasło."

            );

        }

    };

    return (

        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">

            <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-6">

                <div className="text-center mb-6">

                    <div className="text-5xl">
                        👩‍⚕️
                    </div>

                    <h1 className="text-3xl font-bold text-sky-700">
                        NursePay
                    </h1>

                    <p className="text-gray-500">
                        Zaloguj się
                    </p>

                </div>

                <div className="space-y-3">

                    <input

                        type="email"

                        placeholder="Email"

                        value={email}

                        onChange={(e)=>setEmail(e.target.value)}

                        className="w-full p-3 border rounded-xl"

                    />

                    <input

                        type="password"

                        placeholder="Hasło"

                        value={password}

                        onChange={(e)=>setPassword(e.target.value)}

                        className="w-full p-3 border rounded-xl"

                    />

                    <button

                        onClick={handleLogin}

                        className="w-full bg-sky-600 text-white p-3 rounded-xl font-bold"

                    >

                        Zaloguj się

                    </button>

                </div>

                <p className="text-center mt-5 text-sm">

                    Nie masz konta?

                    <Link

                        to="/register"

                        className="text-emerald-600 font-bold ml-2"

                    >

                        Rejestracja

                    </Link>

                </p>

            </div>

        </div>

    );

}

export default Login;