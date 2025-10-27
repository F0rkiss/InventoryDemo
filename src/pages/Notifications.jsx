import React, { useEffect, useState } from 'react';
import Layout from '../components/component/Layout';
import NotifCards from '../components/component/cards/NotifCards';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const Notifications = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const response = await api.get('notification');
        const data = response.data.data;
        console.log('Notifications data:', data);
        setItems(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const goTo = (item) => {
    if (item.jenis_request === "MR") {
      navigate(`/approval-mr/${item.id}`);
    } else if(item.jenis_request === "LPB") {
      navigate(`/approval-lpb/${item.id}`);
    } else {
      console.log("not set yet")
    }
  };

  return (
    <Layout title="Notifikasi Approval">
      <div className="max-w-4xl mx-auto mt-6 px-4">
        {loading && (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading...</div>
          </div>
        )}
        
        {!loading && items.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500">Tidak ada notifikasi approval.</div>
          </div>
        )}
        
        {!loading && items.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Daftar Approval</h2>
            {items.map((item) => (
              <NotifCards 
                key={item.id} 
                item={item} 
                goToPage={() => goTo(item)} 
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;
