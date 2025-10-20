const Pagination = ({
    currentPage = 1,
    totalPages = 1,
    rowsPerPage = 10,
    totalItems = 0,
    onRowsPerPageChange,
    onPrevious,
    onNext
}) => {
    const startItem = (currentPage - 1) * rowsPerPage + 1;
    const endItem = Math.min(currentPage * rowsPerPage, totalItems);

    return (
        <div className="px-6 py-4 flex items-center justify-between border-t">
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Rows per page:</span>
                <select
                    className="border rounded px-2 py-1"
                    value={rowsPerPage}
                    onChange={(e) => onRowsPerPageChange?.(Number(e.target.value))}
                >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                </select>
            </div>

            <div className="flex items-center gap-4">
                {/* Hiển thị range */}
                <span className="text-sm text-gray-700">
                    {startItem}-{endItem} of {totalItems}
                </span>

                {/* Navigation buttons */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onPrevious}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        ←
                    </button>
                    <span className="text-sm text-gray-700">
                        {currentPage} / {totalPages}
                    </span>
                    <button
                        onClick={onNext}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Pagination;