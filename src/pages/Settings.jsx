import { useEffect, useState } from "react";
import api from "../utils/api";


function Settings() {


const [settings,setSettings]=useState({

basicSalary:0,
hourRate:40,
nightPercent:0,
saturdayPercent:0,
sundayPercent:0,
holidayPercent:0

});


const [loading,setLoading]=useState(true);

const [saving,setSaving]=useState(false);

const [error,setError]=useState("");



useEffect(()=>{


const loadSettings = async () => {

  try {

    setLoading(true);
    setError("");

    const response = await api.get("/salary-settings");

    setSettings({

      basicSalary: response.data.basicSalary ?? 0,
      hourRate: response.data.hourRate ?? 0,
      nightPercent: response.data.nightPercent ?? 0,
      saturdayPercent: response.data.saturdayPercent ?? 0,
      sundayPercent: response.data.sundayPercent ?? 0,
      holidayPercent: response.data.holidayPercent ?? 0

    });

  } catch (err) {

    console.error(
      "Błąd pobierania ustawień:",
      err
    );

    setError(
      err.response?.data?.message ||
      "Nie udało się pobrać ustawień wynagrodzenia."
    );

  } finally {

    setLoading(false);

  }

};


loadSettings();


},[]);




const handleChange=(e)=>{


setSettings({

...settings,

[e.target.name]:Number(e.target.value)

});


};




const saveSettings = async () => {


  try {

    setSaving(true);
    setError("");

    await api.put("/salary-settings", settings);

    // odśwież ekran Home
    window.dispatchEvent(
      new Event("salaryUpdated")
    );

    alert("Stawki zapisane ✅");

  } catch (err) {

    console.error(
      "Błąd zapisywania ustawień:",
      err
    );

    setError(
      err.response?.data?.message ||
      "Nie udało się zapisać ustawień wynagrodzenia."
    );

  } finally {

    setSaving(false);

  }

};




return(


<div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4 pb-24 transition-colors">


<h1 className="text-2xl font-bold text-sky-700 dark:text-sky-400 mb-5">

⚙️ Ustawienia wynagrodzenia

</h1>


{error && (

  <div className="bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-2xl p-4 mb-4">
    {error}
  </div>

)}


{loading ? (

  <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-3xl shadow p-5 transition-colors">
    Ładowanie ustawień...
  </div>

) : (

<div className="bg-white dark:bg-slate-800 rounded-3xl shadow p-5 space-y-4 transition-colors">




<div>

<label className="text-slate-700 dark:text-slate-200">

💰 Pensja podstawowa

</label>


<input

type="number"

name="basicSalary"

value={settings.basicSalary}

onChange={handleChange}

className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl p-3"

/>

</div>




<div>

<label className="text-slate-700 dark:text-slate-200">

⏰ Stawka godzinowa

</label>


<input

type="number"

name="hourRate"

value={settings.hourRate}

onChange={handleChange}

className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl p-3"

/>

</div>




<div>

<label className="text-slate-700 dark:text-slate-200">

🌙 Noc %

</label>


<input

type="number"

name="nightPercent"

value={settings.nightPercent}

onChange={handleChange}

className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl p-3"

/>

</div>




<div>

<label className="text-slate-700 dark:text-slate-200">

⭐ Sobota %

</label>


<input

type="number"

name="saturdayPercent"

value={settings.saturdayPercent}

onChange={handleChange}

className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl p-3"

/>

</div>




<div>

<label className="text-slate-700 dark:text-slate-200">

⭐ Niedziela %

</label>


<input

type="number"

name="sundayPercent"

value={settings.sundayPercent}

onChange={handleChange}

className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl p-3"

/>

</div>




<div>

<label className="text-slate-700 dark:text-slate-200">

🎄 Święto %

</label>


<input

type="number"

name="holidayPercent"

value={settings.holidayPercent}

onChange={handleChange}

className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl p-3"

/>

</div>




<button

onClick={saveSettings}

disabled={saving}

className="
w-full
bg-emerald-600
text-white
p-4
rounded-xl
font-bold
disabled:opacity-60
disabled:cursor-not-allowed
"

>

{saving ? "Zapisywanie..." : "💾 Zapisz ustawienia"}

</button>


</div>

)}


</div>


);


}


export default Settings;