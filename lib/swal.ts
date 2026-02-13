import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// สร้างฟังก์ชันเรียกใช้ Alert แบบ Custom Theme
export const confirmSwal = MySwal.mixin({
  customClass: {
    popup: 'bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl', // พื้นหลัง
    title: 'text-white font-bold text-xl',
    htmlContainer: 'text-slate-400',
    confirmButton: 'bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold mx-2 shadow-lg shadow-emerald-900/20 transition-all', // ปุ่มยืนยันเขียว
    cancelButton: 'bg-slate-700 hover:bg-slate-600 text-white px-6 py-2.5 rounded-xl font-bold mx-2 transition-all', // ปุ่มยกเลิกเทา
    actions: 'gap-4'
  },
  buttonsStyling: false, // ปิด Style เดิมของ Browser
  background: '#0f172a', // สีพื้นหลังหลัก
  color: '#fff', // สีตัวหนังสือ
  iconColor: '#10b981', // สีไอคอน (เขียว)
  showCancelButton: true,
  confirmButtonText: 'ยืนยัน',
  cancelButtonText: 'ยกเลิก',
  reverseButtons: true // เอาปุ่มยืนยันไว้ขวา
});

export const alertSwal = MySwal.mixin({
    customClass: {
      popup: 'bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl',
      title: 'text-white font-bold',
      confirmButton: 'bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold'
    },
    buttonsStyling: false,
    background: '#0f172a',
    color: '#fff',
    confirmButtonText: 'ตกลง'
});