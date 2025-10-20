import { Link, useLocation } from "react-router-dom";
import { ICONS } from "../../config/ICONS";
import TitlePage from "../title_pages/TitlePage";

const ItemSidebar = ({ href, title, size }) => {
    const IconComponent = ICONS[title];
    const location = useLocation();

    const isActive = location.pathname === `/${href}`;

    return (
        <div
            className={`group w-full cursor-pointer mb-2 rounded-full transition-colors ${isActive ? "bg-red-600" : "hover:bg-orange-600"
                }`}
        >
            <Link
                to={`/${href}`}
                className={`flex items-center gap-3 px-4 py-2 transition-colors ${isActive ? "text-white font-semibold" : "text-white"
                    }`}
            >
                <TitlePage title={title} icon={<IconComponent />} size={size} />
            </Link>

        </div>
    );
};

export default ItemSidebar;
