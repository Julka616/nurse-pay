import { useEffect, useState } from "react";
import api from "../utils/api";


function Salary(){


const emptySettings={

basicSalary:0,
hourRate:0,
nightPercent:0,
saturdayPercent:0,
sundayPercent:0,
holidayPercent:0

};



const [shifts,setShifts]=useState([]);

const [settings,setSettings]=useState(emptySettings);

const [salary,setSalary]=useState(0);

const [bonus,setBonus]=useState(0);

const [loading,setLoading]=useState(true);

const [error,setError]=useState("");




const calculate = (savedShifts, savedSettings) => {


let totalBonus=0;


savedShifts.forEach(shift=>{


let base =
shift.hours *
savedSettings.hourRate;


if(shift.holiday){

totalBonus +=
base *
savedSettings.holidayPercent /
100;

}

else if(
shift.type==="night"
){

totalBonus +=
base *
savedSettings.nightPercent /
100;

}

else if(shift.weekend){


const day =
new Date(
shift.date
).getDay();


if(day===6){

totalBonus +=
base *
savedSettings.saturdayPercent /
100;

}

if(day===0){

totalBonus +=
base *
savedSettings.sundayPercent /
100;

}

}


});


const hoursSalary =

savedShifts.reduce(

(sum,shift)=>

sum+

shift.hours *
savedSettings.hourRate,

0

);


setBonus(
totalBonus.toFixed(2)
);


setSalary(

(
Number(savedSettings.basicSalary)
+
hoursSalary
+
totalBonus

).toFixed(2)

);


};



const loadData = async () => {

  try {

    setLoading(true);
    setError("");

    const [shiftsResponse, settingsResponse] =
      await Promise.all([
        api.get("/shifts"),
        api.get("/salary-settings")
      ]);

    const savedShifts = Array.isArray(shiftsResponse.data)
      ? shiftsResponse.data
      : [];

    const savedSettings = settingsResponse.data || emptySettings;

    setShifts(savedShifts);
    setSettings(savedSettings);

    calculate(savedShifts, savedSettings);

  } catch (err) {

    console.error(
      "Błąd pobierania danych wypłaty:",
      err
    );

    setError(
      err.response?.data?.message ||
      "Nie udało się pobrać danych wypłaty."
    );

  } finally {

    setLoading(false);

  }

};



useEffect(()=>{


loadData();


window.addEventListener(
"salaryUpdated",
loadData
);


return()=>{

window.removeEventListener(
"salaryUpdated",
loadData
);

};

},[]);




const hours =

shifts.reduce(

(sum,shift)=>

sum+shift.hours,

0

);




return(


<div className="min-h-screen bg-slate-100 p-4 pb-24">


<h1 className="text-2xl font-bold text-sky-700 mb-5">

💰 Wypłata

</h1>


{error && (

  <div className="bg-red-100 text-red-700 rounded-2xl p-4 mb-5">
    {error}
  </div>

)}


{loading ? (

  <div className="bg-white rounded-3xl shadow p-6">
    Ładowanie...
  </div>

) : (

<>

<div className="bg-white rounded-3xl shadow p-6">


<p>

Przewidywana wypłata

</p>


<h2 className="text-4xl font-bold text-emerald-600">

{salary} zł

</h2>


</div>



<div className="grid grid-cols-2 gap-4 mt-5">


<div className="bg-white rounded-3xl p-5 shadow">

⏰ Godziny

<h2 className="text-3xl font-bold">

{hours}

</h2>

</div>


<div className="bg-white rounded-3xl p-5 shadow">

📋 Dyżury

<h2 className="text-3xl font-bold">

{shifts.length}

</h2>

</div>

</div>



<div className="bg-sky-50 rounded-3xl p-5 mt-5">


<h2 className="font-bold">

💵 Rozliczenie

</h2>


<p>

💰 Podstawa:
{settings.basicSalary} zł

</p>


<p>

⏰ Godziny:
{settings.hourRate} zł/h

</p>


<p>

➕ Dodatki:
{bonus} zł

</p>


</div>

</>

)}


</div>


);


}


export default Salary;