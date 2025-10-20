const TitlePage = ({ title, icon, size = "text-3xl", color = "text-gray-700" }) => {
    return (
        <div className="mb-2 flex items-center gap-4">
            {icon}
            <span className={`block font-semibold ${size} ${color}`}>
                {title}
            </span>
        </div>
    );
};

export default TitlePage;
