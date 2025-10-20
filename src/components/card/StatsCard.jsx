import React from "react";

const StatsCard = ({ title, value, icon, bgColor }) => {
    return (
        <div className="py-3 grid grid-cols-[auto_1fr] gap-3 items-center">
            <div className={`${bgColor} p-3 rounded-lg flex items-center justify-center`}>
                {icon}
            </div>

            <div>
                <div className="text-sm text-gray-500">{title}</div>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
            </div>
        </div>
    );
};
export default StatsCard;