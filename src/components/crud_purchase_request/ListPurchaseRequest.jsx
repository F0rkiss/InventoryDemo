import React, { useEffect, useRef, useState } from 'react'
import { Block} from 'framework7-react'
import api from '../../api/api'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../component/SearchBar'
import Loader from '../component/Loader'
import Transition from '../component/Transition'
import ScrollPagination from '../component/ScrollPagination'
import Layout from '../component/Layout'
import FlyingButton from '../component/FlyingButton'
import PurchaseRequestCards from '../component/cards/PurchaseRequestCards.jsx'
import RestoreButton from '../component/RestoreButton'
import DataEmpty from '../component/DataEmpty'
import { encrypting } from '../../helper/EncryptHelper'
import Swal from 'sweetalert2'
import { width } from 'dom7'

  function PurchaseRequestList() {

    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [nextCursor, setNextCursor] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [contentVisible, setContentVisible] = useState(false)
    const [filterToggle, setFilterToggle] = useState(false);

    const typingTimeoutRef = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
      fetchItems();
    }, [searchTerm, filterToggle]);
    

    const fetchItems = async () => {
      try {
        setLoading(true);
        let endpoint = '';
    
        if (searchTerm) {
          endpoint = `purchaseRequest/${searchTerm}`;
        } else if (filterToggle) {
          endpoint = `purchaseRequest-toggle?is_completed=1`;
        } else {
          endpoint = 'purchaseRequest';
        }
    
        const response = await api.get(endpoint);
        const data = response.data.data;
        setItems(data.data);
        setNextCursor(data.next_cursor);
        setLoading(false);
        setTimeout(() => setContentVisible(true), 50);
      } catch (error) {
        setLoading(false);
      }
    };
    

    const fetchMoreItems = async () => {
      if (!nextCursor || loading) return;
      try {
        setLoading(true);
    
        let endpoint = '';
        if (searchTerm) {
          endpoint = `purchaseRequest/${searchTerm}`;
        } else if (filterToggle) {
          endpoint = `purchaseRequest-toggle?is_completed=1`;
        } else {
          endpoint = 'purchaseRequest';
        }
    
        const response = await api.get(endpoint, {
          params: {
            cursor: nextCursor,
          },
        });
    
        const data = response.data.data;
    
        setItems((prevItems) => {
          const existingIds = new Set(prevItems.map(item => item.id));
          const newItems = data.data.filter(item => !existingIds.has(item.id));
          return [...prevItems, ...newItems];
        });
    
        setNextCursor(data.next_cursor);
        setLoading(false);
        setTimeout(() => setContentVisible(true), 50);
      } catch (error) {
        setLoading(false);
      }
    };
    
  

    const handleSearchChange = (query) => {
      setSearchQuery(query);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current); 
      }
      typingTimeoutRef.current = setTimeout(() => {
        setSearchTerm(query); 
      }, 750);
    };
  
    const goToDetail = async(itemid) => {
      const encryptingID = await encrypting(itemid)
      navigate(`/purchase-request/detail-purchase-request/${encryptingID}`);
    }
    
    const goToPR = async (id) => {
      const encryptingID = await encrypting(id)
      navigate(`/purchase-request/update-purchase-request/${encryptingID}`)
    } 

    return (
      <Layout title={'List Purchase Request'}>
          <Block>
              <div className='ms-3 mb-4 flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <p className='lg:text-3xl text-2xl font-semibold capitalize'>Purchase Request</p>
                  <label className="flex items-center gap-2 cursor-pointer">
                  <button
                    onClick={() => setFilterToggle(!filterToggle)} 
                    className={`px-3 py-3 w-fit h-full border text-base font-medium rounded-full flex justify-center items-center gap-2 transition-colors duration-200 ${
                      filterToggle 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200 border-green-300' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <i className="bx bxs-sort-alt"></i>
                    {/* {(width < 768) ? <span>{filterToggle ? 'Selesai' : 'Semua'}</span>:
                    <></>
                    } */}
                  </button>
                    {/* <input 
                      type="checkbox" 
                      checked={filterToggle} 
                      onChange={(e) => setFilterToggle(e.target.checked)} 
                    />
                    <span>Filter Toggle</span> */}
                  </label>
                </div>
                  <SearchBar
                      onChange={handleSearchChange}
                      disable={loading}
                      values={searchQuery}
                  />
                </div>
                  <Transition contentVisible={contentVisible}>
                    <ScrollPagination rootSelector=".page-content" fetchMoreItems={fetchMoreItems} loading={loading} nextCursor={nextCursor}>
                      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {
                            ( items.map((item) => (
                                <PurchaseRequestCards
                                key={item.id}
                                item={item}
                                goToPR={goToPR}
                                goToDetail={goToDetail}
                                isList={true}
                                />
                            )))
                        }
                      </div>
                    </ScrollPagination>
                    {
                      items.length <= 0 && !loading && <DataEmpty/>
                    }
                  </Transition>
                  {loading && <Loader Class="mt-44" />}
          </Block>
      </Layout>
    )
  }

  export default PurchaseRequestList;