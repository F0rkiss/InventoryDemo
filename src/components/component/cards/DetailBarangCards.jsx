import { Page, Block } from 'framework7-react';
import Loader from '../Loader';
import useAuth from '../../../hooks/useAuth';


const DetailBarangCards = ({item}) => {

  const {role} = useAuth();

  return (
    <Block>
          <>
            <div className="bg-white font-inter py-5 mt-3 rounded-md w-full shadow-sm">
              <div className="mx-6">
                <p className="text-2xl font-bold mb-2">
                  {item.category?.name} {item.asset_kode?.slice(5, 8)}
                </p>
                <p className="text-lg">
                  <strong>Kode Aset:</strong> {item.asset_kode}
                </p>
                <p className="text-lg">
                  <strong>Kategori:</strong> <span className="capitalize">{item.category?.name}</span>
                </p>
                { role != 'user' &&
                <p className="text-lg">
                  <strong>Pengguna:</strong> <span className="capitalize">{ item.user ? (item.user.name) : ('Tidak Ada')}</span>
                </p>
                }
                <p className="text-lg">
                  <strong>Unit Device:</strong> <span className="capitalize">{item.unit_device}</span>
                </p>
                <p className="text-lg">
                  <strong>Status:</strong> <span className="capitalize">{item.status}</span>
                </p>
                <p className="text-lg">
                  <strong>Brand:</strong> <span className="capitalize">{item.brand}</span>
                </p>
                <p className="text-lg">
                  <strong>Tanggal Barang Masuk:</strong> <span className="capitalize">{item.date_barang_masuk}</span>
                </p>
                <p className="text-lg">
                  <strong>Spek Origin:</strong> <span className="capitalize">{item.spek_origin}</span>
                </p>
                <p className="text-lg">
                  <strong>Spek Akhir:</strong> <span className="capitalize">{item.spek_akhir || 'Tidak Ada'}</span>
                </p>
                <p className="text-lg">
                  <strong>Type Monitor:</strong> <span className="capitalize">{item.type_monitor || 'Tidak Ada'}</span>
                </p>
                <p className="text-lg">
                  <strong>Note:</strong> <span className="capitalize">{item.note || 'Tidak Ada'}</span>
                </p>
              </div>
            </div>
            </>
      </Block>
    )
}

export default DetailBarangCards