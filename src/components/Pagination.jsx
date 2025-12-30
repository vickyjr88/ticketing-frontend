import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import './Pagination.css';

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    hasNextPage,
    hasPrevPage,
    total,
    limit,
    showInfo = true
}) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    const startItem = (currentPage - 1) * limit + 1;
    const endItem = Math.min(currentPage * limit, total);

    return (
        <div className="pagination-container">
            {showInfo && total > 0 && (
                <div className="pagination-info">
                    Showing {startItem} - {endItem} of {total} items
                </div>
            )}

            <div className="pagination-controls">
                <button
                    className="pagination-btn"
                    onClick={() => onPageChange(1)}
                    disabled={!hasPrevPage}
                    title="First page"
                >
                    <ChevronsLeft className="w-4 h-4" />
                </button>

                <button
                    className="pagination-btn"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={!hasPrevPage}
                    title="Previous page"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="pagination-pages">
                    {getPageNumbers().map(page => (
                        <button
                            key={page}
                            className={`pagination-page ${page === currentPage ? 'active' : ''}`}
                            onClick={() => onPageChange(page)}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                <button
                    className="pagination-btn"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={!hasNextPage}
                    title="Next page"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>

                <button
                    className="pagination-btn"
                    onClick={() => onPageChange(totalPages)}
                    disabled={!hasNextPage}
                    title="Last page"
                >
                    <ChevronsRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
