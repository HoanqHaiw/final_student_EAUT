import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const defaultEventList = [
    {
        title: 'Summer Street Festival',
        subtitle: 'Live launch, music collab & VIP access',
        description:
            'Tham gia sự kiện cuối tuần với bộ sưu tập giới hạn, DJ set và ưu đãi thành viên. Chỉ có tại Lonely Stonie.',
        details: [
            'Thời gian: 20-23/06',
            'Địa điểm: Online + cửa hàng flagship',
            'Ưu đãi: Miễn phí ship toàn quốc, giảm 15% cho thành viên VIP',
        ],
        ctaLabel: 'Khám phá bộ sưu tập',
        ctaLink: '/products?category=top',
    },
    {
        title: 'Flash Release',
        subtitle: 'Đón nhận drops mới mỗi tuần',
        description:
            'Những thiết kế hot nhất của streetwear được thả mỗi tuần. Số lượng có hạn, nhanh tay chốt đơn để không bỏ lỡ.',
        details: [
            'Mỗi thứ 6 hàng tuần',
            'Giới hạn 50 đơn đầu tiên nhận quà',
            'Khuyến mãi thêm cho khách hàng mới',
        ],
        ctaLabel: 'Xem sản phẩm mới',
        ctaLink: '/products?sort=newest',
    },
    {
        title: 'Streetwear Upgrade',
        subtitle: 'Ưu đãi lớn cho trang phục mùa hè',
        description:
            'Giảm giá bộ đôi và combo trọn gói cho outfit năng động. Cập nhật phong cách mới, nổi bật giữa đám đông.',
        details: [
            'Giảm đến 25%',
            'Combo mua 2 tặng 1 cho phụ kiện',
            'Áp dụng đến hết tháng',
        ],
        ctaLabel: 'Mua ngay',
        ctaLink: '/products?category=accessories',
    },
];

export default function Events() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const res = await api.get('/events');
                if (res.data && res.data.length > 0) {
                    setEvents(res.data);
                } else {
                    setEvents(defaultEventList);
                }
            } catch (err) {
                console.error('Không thể tải danh sách sự kiện:', err);
                setEvents(defaultEventList);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    return (
        <div className="bg-white text-slate-900">
            <section className="relative overflow-hidden bg-black text-white py-28">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_25%)]" />
                <div className="container-custom relative text-center">
                    <p className="text-sm uppercase tracking-[0.5em] text-gray-400 mb-6">Sự kiện nổi bật</p>
                    <h1 className="text-5xl md:text-6xl font-heading uppercase tracking-[0.35em]">
                        Streetwear Events
                    </h1>
                    <p className="mx-auto mt-6 max-w-3xl text-base md:text-xl text-gray-300 leading-8">
                        Cập nhật chương trình, flash sale và ưu đãi đặc biệt dành cho cộng đồng Lonely Stonie.
                        Tất cả sự kiện được thiết kế để mang đến trải nghiệm mua sắm streetwear chất lượng và cá tính.
                    </p>
                    <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                        <Link
                            to="/products"
                            className="rounded-full border border-white bg-white px-8 py-3 text-sm uppercase tracking-[0.25em] text-black transition hover:bg-gray-100"
                        >
                            Khám phá sản phẩm
                        </Link>
                        <Link
                            to="/contact"
                            className="rounded-full border border-white px-8 py-3 text-sm uppercase tracking-[0.25em] text-white transition hover:bg-white hover:text-black"
                        >
                            Liên hệ hỗ trợ
                        </Link>
                    </div>
                </div>
            </section>

            <section className="container-custom py-16">
                <div className="mb-12 text-center">
                    <span className="inline-flex rounded-full bg-black px-4 py-1 text-xs uppercase tracking-[0.3em] text-white">
                        Event Highlights
                    </span>
                    <h2 className="mt-6 text-3xl font-heading uppercase tracking-[0.25em] text-black">
                        Những chương trình đáng chú ý
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-500 leading-7">
                        Chọn sự kiện phù hợp với phong cách của bạn và tận hưởng ưu đãi lớn ngay hôm nay.
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-gray-500 font-medium">
                        Đang tải danh sách sự kiện...
                    </div>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-3">
                        {events.map((event, idx) => (
                            <article
                                key={event._id || idx}
                                className="group rounded-3xl border border-slate-200 p-8 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/40 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Sự kiện</p>
                                            <h3 className="mt-4 text-2xl font-semibold text-slate-900 leading-snug">
                                                {event.title}
                                            </h3>
                                        </div>
                                        {event.subtitle && (
                                            <span className="shrink-0 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white text-center">
                                                {event.subtitle}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-6 text-sm leading-7 text-slate-600">
                                        {event.description}
                                    </p>
                                    {event.details && event.details.length > 0 && (
                                        <ul className="mt-6 space-y-3 text-sm text-slate-600">
                                            {event.details.map((detail, dIdx) => (
                                                <li key={dIdx} className="flex items-start gap-3">
                                                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-black" />
                                                    <span>{detail}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div className="mt-8">
                                    <Link
                                        to={event.ctaLink || '/products'}
                                        className="w-full inline-flex items-center justify-center rounded-full border border-black bg-black px-6 py-3 text-sm uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-black"
                                    >
                                        {event.ctaLabel || 'Khám phá ngay'}
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <section className="bg-slate-950 text-white py-24">
                <div className="container-custom grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
                    <div>
                        <p className="text-sm uppercase tracking-[0.4em] text-cyan-300">Đăng ký nhận tin</p>
                        <h2 className="mt-4 text-4xl font-heading uppercase tracking-[0.2em]">
                            Không bỏ lỡ chương trình nào
                        </h2>
                        <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">
                            Đăng ký email để nhận thông báo khi có flash sale, event mới, và ưu đãi đặc biệt từ Lonely Stonie.
                        </p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-sm">
                        <form className="space-y-4">
                            <label className="block text-sm uppercase tracking-[0.3em] text-slate-400">
                                Email của bạn
                            </label>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
                            />
                            <button
                                type="button"
                                className="w-full rounded-2xl bg-cyan-400 px-6 py-3 text-sm uppercase tracking-[0.2em] text-slate-950 transition hover:bg-cyan-300"
                            >
                                Đăng ký ngay
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}
