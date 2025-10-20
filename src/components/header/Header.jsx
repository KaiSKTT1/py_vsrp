import React from "react";
import { FaRegBell } from "react-icons/fa";
import { TbMoonStars } from "react-icons/tb";
import avatarDefault from "../../assets/image/avatar-default.png";

const Header = (props) => {
    return (
        <div className="flex justify-end items-center p-4">
            <TbMoonStars size={32} className="text-gray-700 mr-4" />
            <div className="relative">
                <FaRegBell size={32} className="text-gray-700" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    123
                </span>
            </div>
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300 ml-4">
                <img
                    src={props.avatar || avatarDefault}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                />
            </div>
        </div>
    );
};

export default Header;