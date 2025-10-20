import React from "react";

const CardCoin = ({ title, value, icon }) => {
    return (
        <div className="col-span-1 bg-white rounded-2xl shadow-lg p-4 transition-shadow">
            <div className="mb-2">
                {icon}
                <span className="block text-lg font-semibold text-gray-700 mt-1">
                    {title}
                </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
        </div>
    );
};

export default CardCoin;
