const Button = ({ title, icon, onClick, disabled }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled} // ⚡ Thêm disabled attribute
            className={`flex rounded-xl items-center gap-2 px-4 py-2 text-white transition-colors ${disabled
                ? 'bg-gray-400 cursor-not-allowed opacity-60'
                : 'bg-orange-500 hover:bg-blue-600 cursor-pointer'
                }`}
        >
            {title}
            {icon}
        </button>
    );
};

export default Button;