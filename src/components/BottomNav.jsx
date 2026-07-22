import { NavLink } from "react-router-dom";


function BottomNav() {


  const links = [

    {
      path: "/home",
      icon: "🏠",
      name: "Home"
    },


    {
      path: "/schedule",
      icon: "📋",
      name: "Historia"
    },


    {
      path: "/calendar",
      icon: "📅",
      name: "Grafik"
    },


    {
      path: "/salary",
      icon: "💰",
      name: "Wypłata"
    },


    {
      path: "/settings",
      icon: "⚙️",
      name: "Ustaw."
    }

  ];





  return (

    <div
      className="
      fixed
      bottom-0
      left-0
      right-0
      bg-white
      shadow-xl
      rounded-t-3xl
      flex
      justify-around
      p-3
      "
    >



      {
        links.map((link)=>(


          <NavLink

            key={link.path}

            to={link.path}


            className={({isActive}) =>

              `
              flex
              flex-col
              items-center
              text-xs

              ${
                isActive
                ?
                "text-sky-600 font-bold"
                :
                "text-gray-500"
              }

              `

            }


          >


            <span className="text-xl">

              {link.icon}

            </span>


            {link.name}


          </NavLink>


        ))
      }




    </div>


  );


}


export default BottomNav;