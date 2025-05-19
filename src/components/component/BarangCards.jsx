// import React, { forwardRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import PropTypes from 'prop-types';
// import Swal from 'sweetalert2';
// import api from '../../api/api';

// const ItemCard = forwardRef(({ item, setItems }, ref) => {
//   const navigate = useNavigate();

//   const handleDeleteClick = async (id) => {
//     try {
//       const result = await Swal.fire({
//         title: `Apakah Anda Mau Menghapus Barang`,
//         icon: 'question',
//         showDenyButton: true,
//         confirmButtonText: 'Yes',
//         denyButtonText: 'No',
//         customClass: {
//           actions: 'my-actions',
//           confirmButton: 'order-2',
//           denyButton: 'order-3',
//         },
//       });

//       if (result.isConfirmed) {
//         await api.delete(`/barang/${id}`);
//         setItems((prevItems) => prevItems.filter((item) => item.id !== id));
//         Swal.fire('Terhapus!', '', 'success');
//       }
//     } catch (error) {
//       console.error('Error deleting item', error);
//       Swal.fire('Error!', 'Terjadi kesalahan saat menghapus barang', 'error');
//     }
//   };

//   const handleUpdateClick = (id) => {
//     navigate(`/update-barang/${id}`);
//   };

//   const handleDetailClick = (id) => {
//     navigate(`/detail-barang/${id}`);
//   };

//   return (
//     <div ref={ref} className="bg-white content rounded-md text-sm drop-shadow-xl mb-3 font-inter overflow-hidden">
//       <div className="content">
//         <div className="upper_section flex mb-3 justify-between border-b p-2 pe-0">
//           <h1 className="font-bold capitalize text-xl text-ellipsis self-end whitespace-nowrap overflow-hidden w-full text-center ms-4">
//             {item.unit_device}
//           </h1>
//           <button onClick={() => handleDetailClick(item.id)} className="w-10">
//             <i className="bx bx-dots-vertical-rounded text-2xl" />
//           </button>
//         </div>
//         <div className="lower-details flex p-2 pt-0 border-b justify-between">
//           <div className="text w-full">
//             <div className="flex justify-between">
//               Asset Kode: <p>{item.asset_kode}</p>
//             </div>
//             <div className="flex justify-between">
//               Kode Unit: <p>{item.category ? item.category.name : item.category_name} {item.asset_kode.slice(5, 8)}</p>
//             </div>
//             <div className="flex justify-between">
//               User: <p className="capitalize font-bold">{item.user ? item.user.name : item.username ? item.username : 'no one'}</p>
//             </div>
//             <div className="flex justify-between">
//               Tanggal Barang Masuk: <p>{item.date_barang_masuk}</p>
//             </div>
//             <div className="flex justify-between">
//               Status: <p className="capitalize">{item.status}</p>
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className="lower_section flex justify-around font-semibold m-2 space-x-2">
//         <button
//           className="update_button text-white bg-cyan-400 flex justify-center h items-center py-3 rounded-md"
//           onClick={() => handleUpdateClick(item.id)}
//         >
//           <p>Update</p>
//         </button>
//         <button
//           onClick={() => handleDeleteClick(item.id)}
//           className="delete_button text-white bg-red-500 flex justify-center items-center py-3 rounded-md"
//         >
//           <p>Delete</p>
//         </button>
//       </div>
//     </div>
//   );
// });

// ItemCard.propTypes = {
//   item: PropTypes.object.isRequired,
//   setItems: PropTypes.func.isRequired,
// };

// export default ItemCard;
