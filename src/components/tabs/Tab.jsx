const Tab = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div className="flex gap-4 mb-6">
            {Object.entries(tabs).map(([key, tab]) => {
                const IconComponent = tab.icon;

                return (
                    <button
                        key={key}
                        onClick={() => onTabChange(key)}
                        className={`mt-7 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                            ${activeTab === key
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                    >
                        {IconComponent && <IconComponent size={20} />}
                        <span>{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default Tab;
