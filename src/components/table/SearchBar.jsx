const SearchBar = ({ value, onChange, placeholder = "Search" }) => (
    <div className="p-4 border-b">
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
    </div>
);

export default SearchBar;