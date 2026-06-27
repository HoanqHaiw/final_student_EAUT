import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';

const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Convert ISO date string (from MongoDB) to local datetime-local format
const toLocalDatetimeString = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d)) return '';
  // Format: YYYY-MM-DDTHH:mm adjusted to local timezone
  const offset = d.getTimezoneOffset() * 60000;
  const localDate = new Date(d - offset);
  return localDate.toISOString().slice(0, 16);
};

const defaultEventList = [
  {
    _id: 'default-1',
    title: 'Summer Street Festival',
    subtitle: 'Live launch, music collab & VIP access',
    description: 'Tham gia sự kiện cuối tuần với bộ sưu tập giới hạn, DJ set và ưu đãi thành viên. Chỉ có tại Lonely Stonie.',
    details: [
      'Thời gian: 20-23/06',
      'Địa điểm: Online + cửa hàng flagship',
      'Ưu đãi: Miễn phí ship toàn quốc, giảm 15% cho thành viên VIP'
    ],
    ctaLabel: 'Khám phá bộ sưu tập',
    ctaLink: '/products?category=top',
    startDate: '2026-06-20T10:00',
    endDate: '2026-06-23T22:00',
    isActive: true,
    isDefaultPlaceholder: true
  },
  {
    _id: 'default-2',
    title: 'Flash Release',
    subtitle: 'Đón nhận drops mới mỗi tuần',
    description: 'Những thiết kế hot nhất của streetwear được thả mỗi tuần. Số lượng có hạn, nhanh tay chốt đơn để không bỏ lỡ.',
    details: [
      'Mỗi thứ 6 hàng tuần',
      'Giới hạn 50 đơn đầu tiên nhận quà',
      'Khuyến mãi thêm cho khách hàng mới'
    ],
    ctaLabel: 'Xem sản phẩm mới',
    ctaLink: '/products?sort=newest',
    startDate: '2026-05-01T00:00',
    endDate: '2026-12-31T23:59',
    isActive: true,
    isDefaultPlaceholder: true
  },
  {
    _id: 'default-3',
    title: 'Streetwear Upgrade',
    subtitle: 'Ưu đãi lớn cho trang phục mùa hè',
    description: 'Giảm giá bộ đôi và combo trọn gói cho outfit năng động. Cập nhật phong cách mới, nổi bật giữa đám đông.',
    details: [
      'Giảm đến 25%',
      'Combo mua 2 tặng 1 cho phụ kiện',
      'Áp dụng đến hết tháng'
    ],
    ctaLabel: 'Mua ngay',
    ctaLink: '/products?category=accessories',
    startDate: '2026-05-01T00:00',
    endDate: '2026-05-31T23:59',
    isActive: true,
    isDefaultPlaceholder: true
  }
];

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    details: '',
    ctaLabel: 'Khám phá bộ sưu tập',
    ctaLink: '/products',
    startDate: '',
    endDate: '',
    isActive: true
  });

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getEvents();
      const serverEvents = res.data.events || [];
      if (serverEvents.length === 0) {
        // Fallback to displaying defaults if DB is completely empty
        setEvents(defaultEventList);
      } else {
        setEvents(serverEvents);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không thể tải sự kiện');
      // Graceful fallback to default list on error
      setEvents(defaultEventList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title || '',
        subtitle: event.subtitle || '',
        description: event.description || '',
        details: Array.isArray(event.details) ? event.details.join('\n') : event.details || '',
        ctaLabel: event.ctaLabel || 'Khám phá bộ sưu tập',
        ctaLink: event.ctaLink || '/products',
        startDate: toLocalDatetimeString(event.startDate),
        endDate: toLocalDatetimeString(event.endDate),
        isActive: event.isActive !== false
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        details: '',
        ctaLabel: 'Khám phá bộ sưu tập',
        ctaLink: '/products',
        startDate: '',
        endDate: '',
        isActive: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.startDate) {
      setError('Vui lòng chọn thời gian bắt đầu.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        title: formData.title,
        subtitle: formData.subtitle,
        description: formData.description,
        details: formData.details.split('\n').map((line) => line.trim()).filter(Boolean),
        ctaLabel: formData.ctaLabel,
        ctaLink: formData.ctaLink,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        isActive: formData.isActive
      };

      // If it's a default placeholder event, we create it inside the database
      if (editingEvent && !editingEvent.isDefaultPlaceholder) {
        await adminService.updateEvent(editingEvent._id, payload);
      } else {
        await adminService.createEvent(payload);
      }
      await fetchEvents();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Lưu thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, isDefault, e) => {
    e.stopPropagation();
    if (isDefault) {
      // Just filter out from local view since it's a placeholder
      setEvents((prev) => prev.filter((ev) => ev._id !== id));
      return;
    }
    if (!window.confirm('Bạn có chắc muốn xoá sự kiện này?')) return;
    setLoading(true);
    setError('');
    try {
      await adminService.deleteEvent(id);
      await fetchEvents();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Xoá thất bại');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (event, e) => {
    e.stopPropagation();
    if (event.isDefaultPlaceholder) {
      // For default events not yet in DB, just toggle locally in state
      setEvents((prev) =>
        prev.map((ev) => (ev._id === event._id ? { ...ev, isActive: !ev.isActive } : ev))
      );
      return;
    }
    setLoading(true);
    setError('');
    try {
      await adminService.updateEvent(event._id, {
        ...event,
        isActive: !event.isActive
      });
      await fetchEvents();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Thay đổi trạng thái thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quản lý sự kiện</h1>
          <p className="text-sm text-gray-500">Mẹo: Click vào dòng sự kiện mặc định bên dưới để lưu bản sao vào Database</p>
        </div>
        <button
          type="button"
          onClick={() => openModal()}
          className="inline-flex items-center rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition"
        >
          Thêm sự kiện mới
        </button>
      </div>

      {loading && <p className="text-gray-600">Đang xử lý...</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="overflow-x-auto mt-4">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-sm text-gray-600 uppercase">
              <th className="px-4 py-3 border border-gray-200">Tiêu đề / Badge</th>
              <th className="px-4 py-3 border border-gray-200">Thời gian</th>
              <th className="px-4 py-3 border border-gray-200">Mô tả & Chi tiết</th>
              <th className="px-4 py-3 border border-gray-200">Nút hành động</th>
              <th className="px-4 py-3 border border-gray-200 text-center">Trạng thái</th>
              <th className="px-4 py-3 border border-gray-200 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr
                key={ev._id}
                onClick={() => openModal(ev)}
                className="border-t border-gray-200 hover:bg-gray-50 cursor-pointer transition"
                title={ev.isDefaultPlaceholder ? "Sự kiện mặc định - Click để chỉnh sửa và lưu vào DB" : "Click để chỉnh sửa sự kiện này"}
              >
                <td className="px-4 py-3 text-sm text-gray-800">
                  <div className="font-semibold text-base text-black flex items-center gap-2">
                    {ev.title}
                    {ev.isDefaultPlaceholder && (
                      <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-amber-100 text-amber-800">
                        Mặc định
                      </span>
                    )}
                  </div>
                  {ev.subtitle && (
                    <span className="inline-block mt-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-800">
                      {ev.subtitle}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-850 whitespace-nowrap">
                  <div>Bắt đầu: {ev.startDate ? formatDate(ev.startDate) : '-'}</div>
                  <div>Kết thúc: {ev.endDate ? formatDate(ev.endDate) : 'Không giới hạn'}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 max-w-md">
                  <p className="line-clamp-2 mb-1" title={ev.description}>
                    {ev.description}
                  </p>
                  {ev.details && ev.details.length > 0 && (
                    <div className="text-xs text-gray-400 font-medium">
                      • {ev.details.slice(0, 2).join(' | ')}
                      {ev.details.length > 2 && '...'}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-850">
                  <div className="font-semibold">{ev.ctaLabel}</div>
                  <div className="text-xs text-gray-400 font-mono">{ev.ctaLink}</div>
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  <button
                    type="button"
                    onClick={(e) => toggleStatus(ev, e)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                      ev.isActive
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                  >
                    {ev.isActive ? 'Đang hoạt động' : 'Tạm ẩn'}
                  </button>
                </td>
                <td className="px-4 py-3 text-sm text-center space-x-3 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(ev);
                    }}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    {ev.isDefaultPlaceholder ? 'Lưu vào DB' : 'Sửa'}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(ev._id, ev.isDefaultPlaceholder, e)}
                    className="text-red-600 hover:underline font-semibold"
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingEvent
                  ? editingEvent.isDefaultPlaceholder
                    ? 'Chuyển sự kiện mặc định thành sự kiện trong DB'
                    : 'Cập nhật sự kiện'
                  : 'Thêm sự kiện mới'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            {error && <p className="text-red-600 mb-4 font-medium">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tiêu đề sự kiện</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Ví dụ: Summer Street Festival"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-black transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phụ đề / Badge</label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleChange}
                    placeholder="Ví dụ: Giảm giá combo 25%"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-black transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Thời gian bắt đầu</label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-black transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Thời gian kết thúc</label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-black transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô tả ngắn</label>
                <textarea
                  name="description"
                  rows={2}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Mô tả tóm tắt nội dung chính sự kiện..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-black transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Chi tiết ưu đãi / nội dung nổi bật (Mỗi dòng một dòng chi tiết)
                </label>
                <textarea
                  name="details"
                  rows={4}
                  value={formData.details}
                  onChange={handleChange}
                  placeholder="Thời gian: 20-23/06&#10;Địa điểm: Online & Flagship Store&#10;Ưu đãi: Freeship toàn quốc"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-black transition font-sans"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nhãn nút (CTA Label)</label>
                  <input
                    type="text"
                    name="ctaLabel"
                    value={formData.ctaLabel}
                    onChange={handleChange}
                    placeholder="Ví dụ: Khám phá ngay"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-black transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Đường dẫn nút (CTA Link)</label>
                  <input
                    type="text"
                    name="ctaLink"
                    value={formData.ctaLink}
                    onChange={handleChange}
                    placeholder="Ví dụ: /products?category=streetwear"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-black transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-8">
                <div className="flex items-center">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm font-semibold text-gray-900">
                    Kích hoạt hiển thị lên trang chủ
                  </label>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-black px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition disabled:opacity-50"
                  >
                    {editingEvent
                      ? editingEvent.isDefaultPlaceholder
                        ? 'Lưu vào Database'
                        : 'Lưu thay đổi'
                      : 'Tạo sự kiện'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
