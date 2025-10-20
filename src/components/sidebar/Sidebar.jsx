import React from "react";
import "./Sidebar.css";
import logo from "../../assets/react.svg"
import ItemSidebar from "../item_sidebar/ItemSidebar";

const Sidebar = () => {
    return (
        <div className="flex">
            <div className="w-64 h-screen bg-blue-600 text-white flex flex-col p-4">
                <div className="flex justify-center mb-6">
                    <img src={logo} alt="Logo" className="w-16 h-16" />
                </div>

                <nav className="flex flex-col space-y-2">
                    <ItemSidebar href="/Map" title="Map" size="text-lg" />
                </nav>
            </div>
        </div>

    );
}



export default Sidebar;

// import React, { useState } from "react";
// import "./Sidebar.css";
// import logo from "../../assets/react.svg";
// import ItemSidebar from "../item_sidebar/ItemSidebar";

// const Sidebar = () => {
//     const [isCollapsed, setIsCollapsed] = useState(false);

//     return (
//         <div className={`
//             ${isCollapsed ? 'w-16' : 'w-64'}
//             h-screen bg-blue-600 text-white flex flex-col p-4
//             transition-all duration-300
//         `}>
//             {/* Logo */}
// <div className="flex justify-center mb-6">
//     <img
//         src={logo}
//         alt="Logo"
//         className={`${isCollapsed ? 'w-8 h-8' : 'w-16 h-16'} transition-all`}
//     />
// </div>

// {/* Toggle Button */ }
// <button
//     onClick={() => setIsCollapsed(!isCollapsed)}
//     className="mb-4 p-2 bg-blue-700 rounded hover:bg-blue-800 text-xl"
// >
//     {isCollapsed ? '→' : '←'}
// </button>

// {/* Navigation - Expanded */ }
// {
//     !isCollapsed && (
//         <nav className="flex flex-col space-y-2">
//             <ItemSidebar href="dashboard" title="Dashboard" size="text-lg" />
//             <ItemSidebar href="student" title="Students" size="text-lg" />
//             <ItemSidebar href="guardians" title="Guardians" size="text-lg" />
//             <ItemSidebar href="drivers" title="Drivers" size="text-lg" />
//             <ItemSidebar href="school" title="School" size="text-lg" />
//         </nav>
//     )
// }

// {/* Navigation - Collapsed (chỉ icon) */ }
// {
//     isCollapsed && (
//         <nav className="flex flex-col space-y-2 items-center">
//             <div className="text-2xl cursor-pointer hover:bg-blue-700 p-2 rounded" title="Dashboard">📊</div>
//             <div className="text-2xl cursor-pointer hover:bg-blue-700 p-2 rounded" title="Students">👨‍🎓</div>
//             <div className="text-2xl cursor-pointer hover:bg-blue-700 p-2 rounded" title="Guardians">👨‍👩‍👧</div>
//             <div className="text-2xl cursor-pointer hover:bg-blue-700 p-2 rounded" title="Drivers">🚗</div>
//             <div className="text-2xl cursor-pointer hover:bg-blue-700 p-2 rounded" title="School">🏫</div>
//         </nav>
//     )
// }
//         </div >
//     );
// }

// export default Sidebar;
