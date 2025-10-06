import React, { useState, forwardRef } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import ImagePreviewModal from '../modal/ImagePreviewModal'

dayjs.extend(relativeTime)

const MutasiCards = forwardRef(({ item, goToPage }, ref) => {
    const [selectedImageUrl, setSelectedImageUrl] = useState('')
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)
    const apiUrl = import.meta.env.VITE_URL

    const handleClosePreview = () => {
        setIsPreviewOpen(false)
        setSelectedImageUrl('')
    }

    const handleImageClick = (e, imageUrl) => {
        e.stopPropagation()
        setSelectedImageUrl(imageUrl)
        setIsPreviewOpen(true)
    }

    return (
        <>
        <div
            className="bg-white mt-3 border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all "
            ref={ref}
            // onClick={() => goToPage(item)}
        >
            {/* Header */}
            <div className="flex items-center p-3 sm:p-4 border-b flex-wrap gap-3">
            <img
                src={`${apiUrl}${item.gambarBarang}`}
                alt={item.namaBarang || 'Gambar Barang'}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover hover:scale-105 transition-transform duration-200"
                onClick={(e) => handleImageClick(e, `${apiUrl}${item.gambarBarang}`)}
            />
            <div className="flex-1 min-w-[150px]">
                <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                {item.namaBarang}
                </h4>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                {item.kodeMR || '-'}
                </p>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-400 whitespace-nowrap">
                {dayjs(item.created_at).format('DD-MM-YYYY, HH:mm')}
            </p>
            </div>

            {/* Info Grid */}
            <div className="px-3 sm:px-4 py-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] sm:text-sm">
            <p><span className="text-gray-500">Stok Awal:</span> {item.stok_awal}</p>
            <p><span className="text-gray-500">Stok Akhir:</span> {item.stok_akhir}</p>
            <p>
                <span className="text-gray-500">Perubahan:</span>{' '}
                <span className={item.stok_change < 0 ? 'text-red-500' : 'text-green-600'}>
                {item.stok_change}
                </span>
            </p>
            <p><span className="text-gray-500">Tanggal:</span> {dayjs(item.tanggal).format('DD MMM YYYY')}</p>
            <p><span className="text-gray-500">Kode Barang:</span> {item.kodeBarang}</p>
            <p><span className="text-gray-500">Kode Gudang:</span> {item.kodeGudang}</p>
            </div>
        </div>

        {/* Image Preview Modal */}
        <ImagePreviewModal
            isOpen={isPreviewOpen}
            imageUrl={selectedImageUrl}
            onClose={handleClosePreview}
            className="z-[9999]" // hanya untuk halaman Mutasi
        />
        </>
    )
})

export default MutasiCards
