import React, { useEffect } from 'react'

const Pagination = ({currentPage, totalPages, goToPage, lastPage}) => {

    const links = [];
    
    const goToPreviousPage = () => {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
    };

    const goToFirstPage = () => {
            goToPage(1);
    };

    if (currentPage >= 3){
        links.push(
            <button
            key='first'
            onClick={(goToFirstPage)}
            className={`p-2 px-4 rounded-full w-1/2 text-center text-xs translate-x-2`}
            >
                1
            </button>
        )
    }

    links.push(
        <button
            key="prev"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className={`px-2 py-1 rounded self-start ${currentPage === 1 ? `hidden` : ``}`}
        >
            <i className='bx bx-chevron-left font-bold text-xl'/>
        </button>
    );


    const pageNumbersToShow = [];
    const FirstPage = Math.min(totalPages)
    const startPage = Math.max(currentPage - 1, 1);
    const endPage = Math.min(startPage + 2, totalPages);

    for (let page = startPage; page <= endPage; page++) {
        pageNumbersToShow.push(page);
    }

    // Add the page numbers to the links
    pageNumbersToShow.forEach((page) => {
        links.push(
            <button
                key={page}
                onClick={() => goToPage(page)}
                className={`py-[6px] px-[14px]  rounded-full ${
                    page === currentPage ? 'bg-cyan-400 text-white' : '' 
                } ${totalPages <= 1 ? 'hidden' : ''}`}
            >
                <p>{page}</p>
            </button>
        );
    });

    if (totalPages > 3 && endPage < totalPages) {
        links.push(
            <span key="ellipsis" className=" rounded mx-1">
                ...
            </span>
        );
        
        links.push(
            <button
                key={totalPages}
                onClick={() => goToPage(totalPages)}
                className={`px-3 py-1 rounded mx-1 ${
                    totalPages === currentPage ? 'bg-white text-black' : ' '
                }`}
            >
                {totalPages}
            </button>
        );
    }

    // Add "Next" button
    links.push(
        <button
            key="next"
            onClick={goToNextPage}
            disabled={currentPage === totalPages && currentPage === endPage}
            className="px-2 py-1 rounded"
        >
            <i className={`bx bx-chevron-right font-bold text-xl ${currentPage === endPage ? 'invisible' : ''}`}/>
        </button>
    );

    return (<div className="flex justify-center items-center space-x-2">{links}</div>);
};

export default Pagination