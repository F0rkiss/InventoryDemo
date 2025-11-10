import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Block } from 'framework7-react';
import api from '../../api/api';
import Layout from '../component/Layout';
import Back from '../component/Back';
import Loader from '../component/Loader';
import { DecryptID } from '../../helper/EncryptHelper';
import Swal from 'sweetalert2';

function PDFViewerPage() {
    const { id, type } = useParams();
    const navigate = useNavigate();
    const [decryptedId, setDecryptedId] = useState('');
    const [pdfUrl, setPdfUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const iframeRef = useRef(null);

    // Map type to API endpoint
    const getApiEndpoint = (pdfType) => {
        const endpoints = {
            'pr': '/pdf/preview_pr',
            'lpb': '/pdf/preview_lpb',
            'po': '/pdf/preview_po',
            'mr': '/pdf/preview_mr',
        };
        return endpoints[pdfType] || '/pdf/preview_pr';
    };

    useEffect(() => {
        const decId = DecryptID(id);
        setDecryptedId(decId);
        if (!decId) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid ID',
                text: 'ID tidak valid'
            });
            navigate(-1);
        }
    }, [id, navigate]);

    const fetchPDF = async () => {
        if (!decryptedId || !type) return;
        
        try {
            setLoading(true);
            const endpoint = getApiEndpoint(type);
            const response = await api.get(`${endpoint}/${decryptedId}`, {
                responseType: 'blob',
            });

            // Check content type from response headers
            const contentType = response.headers['content-type'] || response.data.type;

            if (contentType === 'application/pdf' || contentType?.includes('pdf')) {
                // Create blob URL from response
                const file = new Blob([response.data], { type: 'application/pdf' });
                const fileURL = URL.createObjectURL(file);
                setPdfUrl(fileURL);
            } else {
                // Handle error response
                const errText = await response.data.text();
                let errJson = {};
                try {
                    errJson = JSON.parse(errText);
                } catch (e) {
                    errJson = { message: 'Format respons tidak valid.' };
                }
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal Memuat PDF',
                    text: errJson.message || 'Format respons tidak valid.'
                }).then(() => {
                    navigate(-1);
                });
            }
        } catch (error) {
            console.error("Error fetching PDF: ", error);
            Swal.fire({
                icon: 'error',
                title: 'Gagal Memuat PDF',
                text: error.message || 'Terjadi kesalahan pada server.'
            }).then(() => {
                navigate(-1);
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (decryptedId && type) {
            fetchPDF();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [decryptedId, type]);

    // Prevent page refresh when PDF is loaded
    useEffect(() => {
        if (pdfUrl) {
            const handleBeforeUnload = (e) => {
                e.preventDefault();
                e.returnValue = 'PDF sedang dibuka. Apakah Anda yakin ingin meninggalkan halaman ini?';
                return e.returnValue;
            };

            window.addEventListener('beforeunload', handleBeforeUnload);
            return () => {
                window.removeEventListener('beforeunload', handleBeforeUnload);
            };
        }
    }, [pdfUrl]);

    // Cleanup blob URL when component unmounts
    useEffect(() => {
        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [pdfUrl]);


    const handleGoBack = () => {
        // Cleanup blob URL before navigating back
        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
        }
        navigate(-1);
    };

    return (
        <Layout title="PDF Viewer">
            <Block>
                <div className="px-2 lg:px-4">
                    <Back goHome={handleGoBack} />
                    <div className="flex items-center justify-between my-4">
                        <p className='lg:text-3xl text-2xl font-semibold capitalize'>PDF Preview</p>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center min-h-[80vh]">
                            <div className="text-center">
                                <Loader />
                                <p className="text-gray-600 mt-4">Loading PDF...</p>
                            </div>
                        </div>
                    ) : pdfUrl ? (
                        <div className="bg-white border rounded-lg shadow-lg overflow-hidden" style={{ height: '85vh' }}>
                            <iframe
                                ref={iframeRef}
                                src={pdfUrl}
                                className="w-full h-full border-0"
                                title="PDF Viewer"
                                type="application/pdf"
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center min-h-[80vh]">
                            <p className="text-gray-600">No PDF available</p>
                        </div>
                    )}
                </div>
            </Block>
        </Layout>
    );
}

export default PDFViewerPage;

