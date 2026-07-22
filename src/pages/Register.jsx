import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";

function Register() {

    const navigate = useNavigate();

    const [form, setForm] = useState({

        firstName: "",
        lastName: "",
        email: "",
        password: "",
        hospital: "",
        department: ""

    });

    const handleChange = (e) => {

        setForm({

            ...form,
            [e.target.name]: e.target.value

        });

    };

    const handleRegister = async () => {

        try {

            await api.post("/auth/register", {

                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                password: form.password

            });

            alert("Konto zostało utworzone ✅");

            navigate("/");

        } catch (err) {

            alert(

                err.response?.data?.message ||

                "Nie udało się utworzyć konta."

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
                        Utwórz konto
                    </h1>

                    <p className="text-gray-500">
                        Dołącz do NursePay
                    </p>

                </div>

                <div className="space-y-3">

                    <input
                        name="firstName"
                        placeholder="Imię"
                        value={form.firstName}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-xl"
                    />

                    <input
                        name="lastName"
                        placeholder="Nazwisko"
                        value={form.lastName}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-xl"
                    />

                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-xl"
                    />

                    <input
                        name="password"
                        type="password"
                        placeholder="Hasło"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-xl"
                    />

                    <input
                        name="hospital"
                        placeholder="Szpital"
                        value={form.hospital}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-xl"
                    />

                    <input
                        name="department"
                        placeholder="Oddział np. SOR"
                        value={form.department}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-xl"
                    />

                    <button
                        onClick={handleRegister}
                        className="w-full bg-emerald-600 text-white p-3 rounded-xl font-bold"
                    >
                        Załóż konto
                    </button>

                </div>

                <p className="text-center mt-5 text-sm">

                    Masz już konto?

                    <Link
                        to="/"
                        className="text-sky-600 font-bold ml-2"
                    >
                        Zaloguj się
                    </Link>

                </p>

            </div>

        </div>

    );

}

export default Register;