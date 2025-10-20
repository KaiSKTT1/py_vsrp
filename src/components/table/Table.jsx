const Table = ({ loading, data, columns, renderCell }) => (
    <div className="overflow-x-auto">
        <table className="w-full">
            {/* Header */}
            <thead className="bg-gray-50 border-b">
                <tr>
                    {columns.map((col) => (
                        <th
                            key={col.key}
                            style={{ width: col.width }}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                            {col.label}
                        </th>
                    ))}
                </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-gray-200">
                {loading ? (
                    <EmptyRow colSpan={columns.length} text="Loading..." />
                ) : data.length === 0 ? (
                    <EmptyRow colSpan={columns.length} text="No data available" />
                ) : (
                    data.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                            {columns.map((col) => (
                                <td
                                    key={col.key}
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                >
                                    {renderCell(item, col.key)}
                                </td>
                            ))}
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    </div>
);

// Helper component
const EmptyRow = ({ colSpan, text }) => (
    <tr>
        <td colSpan={colSpan} className="px-6 py-12 text-center text-gray-500">
            {text}
        </td>
    </tr>
);

export default Table;