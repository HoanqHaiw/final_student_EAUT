import AboutImage from '../assets/hero.png';

export default function About() {
    const mapUrl = 'https://www.google.com/maps/place/S%C3%B4+322+Mai+Anh+Tu%E1%BA%A5n,+%C4%90%E1%BB%91ng+%C4%90a,+H%C3%A0+N%E1%BB%99i';

    return (
        <div className="container-custom py-16">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
                <div className="space-y-6">
                    <h1 className="text-4xl font-bold tracking-tight">About Us</h1>
                    <p className="text-gray-700 text-lg leading-relaxed">
                        Lonely Stonie là thương hiệu streetwear cá tính, được xây dựng từ niềm đam mê thời trang đường phố và phong cách sống trẻ trung. Chúng tôi kết hợp tinh thần “lonely but stylish” với chất lượng sản phẩm cao cấp, tạo nên những bộ đồ vừa thoải mái vừa nổi bật.
                    </p>
                    <p className="text-gray-700 text-lg leading-relaxed">
                        Từ những thiết kế đầu tiên đến bộ sưu tập hiện tại, mỗi sản phẩm đều được chăm chút tỉ mỉ về form dáng, chất liệu và màu sắc. Chúng tôi muốn khách hàng cảm nhận được câu chuyện của riêng mình khi mặc đồ Lonely Stonie.
                    </p>
                    <div className="space-y-4 rounded-3xl border border-gray-200 bg-black p-8 text-white shadow-sm">
                        <h2 className="text-2xl font-semibold">Thông tin liên hệ</h2>
                        <div className="space-y-2 text-sm leading-relaxed text-gray-200">
                            <p><span className="font-semibold">Địa chỉ:</span> Số 322 Mai Anh Tuấn, Đống Đa, Hà Nội</p>
                            <p><span className="font-semibold">Điện thoại:</span> <a href="tel:+84365001420" className="text-white underline">(+84) 365 001 420</a></p>
                            <p><span className="font-semibold">Email:</span> <a href="mailto:lonelystonie420@gmail.com" className="text-white underline">lonelystonie420@gmail.com</a></p>
                            <p><span className="font-semibold">Giờ mở cửa:</span> 9:00 - 18:00 (Thứ Hai - Thứ Bảy)</p>
                        </div>
                        <a
                            href={mapUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-gray-200"
                        >
                            Xem bản đồ trên Google Maps
                        </a>
                    </div>
                </div>

                <div className="overflow-hidden rounded-[32px] border border-gray-200 shadow-lg">
                    <img
                        src={AboutImage}
                        alt="Lonely Stonie About"
                        className="h-full w-full object-cover"
                    />
                </div>
            </div>

            <div className="mt-14 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
                <h2 className="text-3xl font-semibold mb-4">Câu chuyện của chúng tôi</h2>
                <div className="space-y-4 text-gray-700 text-base leading-relaxed">
                    <p>
                        Lonely Stonie bắt đầu bằng một khát khao tạo ra nơi dành cho những người thích sự khác biệt. Chúng tôi tin rằng quần áo không chỉ là vật dụng, mà còn là cách kể câu chuyện của bạn và khẳng định cá tính riêng.
                    </p>
                    <p>
                        Với mỗi bộ sưu tập, chúng tôi luôn lắng nghe phản hồi từ cộng đồng và cập nhật xu hướng mới nhất, trong khi vẫn giữ nguyên giá trị cốt lõi của thương hiệu: tối giản, đen trắng, và cá tính.
                    </p>
                    <p>
                        Chúng tôi phục vụ cả khách hàng yêu thích streetwear hằng ngày và những ai muốn tìm kiếm một phong cách thời trang mang hơi hướng đặc biệt, dễ phối đồ và cực kỳ ấn tượng.
                    </p>
                </div>
            </div>

            <div className="mt-14 grid gap-8 lg:grid-cols-2">
                <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-slate-950 p-8 text-white shadow-sm">
                    <h3 className="text-2xl font-semibold mb-4">Tầm nhìn của chúng tôi</h3>
                    <p className="text-gray-300 leading-relaxed">
                        Lonely Stonie hướng tới xây dựng cộng đồng thời trang đường phố Việt Nam, nơi mỗi cá nhân có thể tự tin thể hiện phong cách riêng mà vẫn giữ được sự thanh lịch và sang trọng.
                    </p>
                </div>
                <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-slate-950 p-8 text-white shadow-sm">
                    <h3 className="text-2xl font-semibold mb-4">Sứ mệnh của chúng tôi</h3>
                    <p className="text-gray-300 leading-relaxed">
                        Cung cấp sản phẩm chất lượng, dịch vụ tận tâm và trải nghiệm mua sắm thân thiện. Chúng tôi luôn đồng hành cùng khách hàng để tạo ra phong cách riêng, từ thiết kế đến cách phối đồ mỗi ngày.
                    </p>
                </div>
            </div>

            <div className="mt-14 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
                <h2 className="text-3xl font-semibold mb-6">Bản đồ cửa hàng</h2>
                <div className="aspect-[16/9] overflow-hidden rounded-3xl border border-gray-200">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.8439175321763!2d105.82981637499477!3d21.01135278601528!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135abf2644c4349%3A0x368eee3d730f2d2f!2s322%20Mai%20Anh%20Tu%E1%BA%A5n!5e0!3m2!1svi!2s!4v1700000000000"
                        title="Lonely Stonie Google Maps"
                        width="100%"
                        height="100%"
                        className="border-0"
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>
            </div>
        </div>
    );
}
