// src/config/icons.js
import { AiFillGold, AiOutlineDollarCircle } from "react-icons/ai";
import { FiXOctagon } from "react-icons/fi";
import { FaAddressCard } from "react-icons/fa6";
import { IoMdAirplane } from "react-icons/io";
import { MdMotionPhotosPaused } from "react-icons/md";
import { FaUserClock } from "react-icons/fa";
import { FaUserTimes } from "react-icons/fa";
import { HiUserGroup } from "react-icons/hi";
import { FaUserCog } from "react-icons/fa";
import { FaHouse } from "react-icons/fa6";
import { FaGraduationCap } from "react-icons/fa";
import { FaBusAlt } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";

export const ICONS = {
    Dashboard: FaHouse, //Icon cho item nav Dashboard
    gold: AiFillGold,
    dollar: AiOutlineDollarCircle,
    warning: FiXOctagon,
    Students: FaAddressCard,//Icon cho item nav Students
    plane: IoMdAirplane,
    suspended: MdMotionPhotosPaused,
    underReview: FaUserClock,
    outOfCoins: FaUserTimes,
    Guardians: HiUserGroup, //Icon cho item nav Guardions
    Drivers: FaUserCog, //Icon cho item nav Drivers
    School: FaGraduationCap, //Icon cho item nav School
    Buses: FaBusAlt, //Icon cho item nav Buses
    plus: FaPlus,
    Map: FaBusAlt, //Icon cho item nav Map
};
