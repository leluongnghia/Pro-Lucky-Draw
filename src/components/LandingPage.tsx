import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Zap, Shield, Users, ArrowRight, Star, CheckCircle2, Gift, X, LogIn, UserPlus } from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onLoginSuccess: (user: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onLoginSuccess }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body: any = { username, password };
    if (!isLogin) {
      body.email = email;
      body.phone = phone;
    }
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.ok) {
        if (isLogin) {
          onLoginSuccess(data.user);
          onEnterApp();
        } else {
          setIsLogin(true);
          setEmail('');
          setPhone('');
          setError('Đăng ký thành công! Vui lòng đăng nhập.');
        }
      } else {
        setError(data.error || 'Có lỗi xảy ra');
      }
    } catch (err) {
      setError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-yellow-400 selection:text-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center rotate-3">
              <Trophy className="text-black" size={24} />
            </div>
            <span className="font-black text-2xl tracking-tighter italic">LUCKYDRAW.PRO</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Tính năng</a>
            <a href="#pricing" className="hover:text-white transition-colors">Bảng giá</a>
            <a href="tel:09123.86.968" className="hover:text-yellow-400 transition-colors flex items-center gap-2">
              <span>📞</span> 09123.86.968
            </a>
            <a href="mailto:info@azevent.vn" className="hover:text-yellow-400 transition-colors flex items-center gap-2">
              <span>✉️</span> info@azevent.vn
            </a>
          </div>
          <button 
            onClick={() => setShowAuthModal(true)}
            className="bg-white text-black px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest hover:bg-yellow-400 transition-all hover:scale-105 active:scale-95"
          >
            Đăng nhập
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-400/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8">
              <Star className="text-yellow-400 fill-yellow-400" size={14} />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Phần mềm quay số chuyên nghiệp nhất</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-black italic uppercase leading-[0.85] tracking-tighter mb-10">
              NÂNG TẦM <br />
              <span className="text-yellow-400">SỰ KIỆN</span> <br />
              CỦA BẠN
            </h1>
            <p className="text-xl md:text-2xl text-white/40 max-w-2xl mb-12 font-medium leading-relaxed">
              Phần mềm quay số may mắn hoàn toàn <span className="text-white">MIỄN PHÍ</span>. Đăng ký để lưu toàn bộ dữ liệu sự kiện — người tham gia, giải thưởng, kết quả — an toàn, không bao giờ mất.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <button 
                onClick={() => setShowAuthModal(true)}
                className="group bg-yellow-400 text-black px-10 py-6 rounded-2xl font-black text-xl uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-4 shadow-[0_0_40px_rgba(250,204,21,0.3)]"
              >
                Bắt đầu ngay
                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </button>
              <div className="flex items-center gap-4 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-zinc-800 overflow-hidden">
                      <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="font-bold">1,000+ Sự kiện</div>
                  <div className="text-white/40 text-xs uppercase tracking-wider">Đã tin dùng</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-[40px] p-10 overflow-hidden"
            >
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="mb-8">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2">
                  {isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
                </h2>
                <p className="text-white/40 text-sm">
                  {isLogin ? 'Đăng nhập để tiếp tục sự kiện của bạn' : 'Đăng ký để lưu trữ dữ liệu sự kiện'}
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Tên đăng nhập</label>
                  <input 
                    type="text" 
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-yellow-400 transition-colors"
                    placeholder="Nhập tên đăng nhập..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Mật khẩu</label>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-yellow-400 transition-colors"
                    placeholder="Nhập mật khẩu..."
                  />
                </div>

                {/* Email + Phone — chỉ hiện khi đăng ký */}
                {!isLogin && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Email <span className="text-yellow-400">*</span></label>
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-yellow-400 transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Số điện thoại <span className="text-yellow-400">*</span></label>
                      <input 
                        type="tel" 
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-yellow-400 transition-colors"
                        placeholder="0901234567"
                      />
                    </div>
                  </>
                )}

                {error && (
                  <div className={`text-sm font-bold p-4 rounded-2xl ${error.includes('thành công') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {error}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-yellow-400 text-black py-5 rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? 'Đang xử lý...' : (isLogin ? <><LogIn size={20} /> Đăng nhập</> : <><UserPlus size={20} /> Đăng ký</>)}
                </button>
              </form>

              <div className="mt-8 text-center">
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm font-bold text-white/40 hover:text-yellow-400 transition-colors"
                >
                  {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-10 bg-white/5 border border-white/10 rounded-[40px] hover:border-yellow-400/50 transition-all group">
              <div className="w-16 h-16 bg-yellow-400/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Zap className="text-yellow-400" size={32} />
              </div>
              <h3 className="text-2xl font-black uppercase italic mb-4">Tốc độ & Mượt mà</h3>
              <p className="text-white/40 leading-relaxed">Hiệu ứng quay số 60FPS, mượt mà trên mọi thiết bị từ màn hình LED lớn đến máy tính bảng.</p>
            </div>
            <div className="p-10 bg-white/5 border border-white/10 rounded-[40px] hover:border-yellow-400/50 transition-all group">
              <div className="w-16 h-16 bg-blue-400/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Shield className="text-blue-400" size={32} />
              </div>
              <h3 className="text-2xl font-black uppercase italic mb-4">Minh bạch & Tin cậy</h3>
              <p className="text-white/40 leading-relaxed">Thuật toán ngẫu nhiên công bằng, đảm bảo tính khách quan tuyệt đối cho mọi giải thưởng.</p>
            </div>
            <div className="p-10 bg-white/5 border border-white/10 rounded-[40px] hover:border-yellow-400/50 transition-all group">
              <div className="w-16 h-16 bg-green-400/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Users className="text-green-400" size={32} />
              </div>
              <h3 className="text-2xl font-black uppercase italic mb-4">Dữ liệu luôn sẵn sàng</h3>
              <p className="text-white/40 leading-relaxed">Danh sách người tham gia, giải thưởng và kết quả được lưu tự động. Mở trên bất kỳ thiết bị nào, lúc nào cũng có.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Free Section */}
      <section id="pricing" className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-8">
              CHÚNG TÔI <span className="text-yellow-400">MIỄN PHÍ</span> <br />
              MÃI MÃI
            </h2>
            <p className="text-xl text-white/40 mb-16">
              Chỉ cần đăng ký tài khoản để bắt đầu quản lý sự kiện của bạn một cách chuyên nghiệp.
            </p>
            
            <div className="bg-gradient-to-b from-yellow-400 to-yellow-500 p-[1px] rounded-[48px]">
              <div className="bg-black rounded-[47px] p-12 md:p-20">
                <div className="grid md:grid-cols-2 gap-12 text-left">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <CheckCircle2 className="text-yellow-400" />
                      <span className="font-bold text-lg">Không giới hạn số người tham gia</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <CheckCircle2 className="text-yellow-400" />
                      <span className="font-bold text-lg">Không giới hạn số giải thưởng</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <CheckCircle2 className="text-yellow-400" />
                      <span className="font-bold text-lg">Xuất báo cáo kết quả Excel</span>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <CheckCircle2 className="text-yellow-400" />
                      <span className="font-bold text-lg">Tùy chỉnh giao diện LED chuyên nghiệp</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <CheckCircle2 className="text-yellow-400" />
                      <span className="font-bold text-lg">Hệ thống âm thanh sống động</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <CheckCircle2 className="text-yellow-400" />
                      <span className="font-bold text-lg">Hỗ trợ đa nền tảng (Web/Mobile)</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="mt-16 w-full bg-yellow-400 text-black py-8 rounded-3xl font-black text-2xl uppercase tracking-[0.2em] hover:bg-white transition-all shadow-[0_20px_60px_rgba(250,204,21,0.2)]"
                >
                  Đăng ký ngay - Miễn phí
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Giới thiệu công ty AZEvent */}
      <section className="py-24 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 px-4 py-2 rounded-full mb-6">
                <span className="text-yellow-400 text-xs font-bold uppercase tracking-widest">Đơn vị phát triển</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-6 leading-tight">
                ĐƯỢC PHÁT TRIỂN BỞI <span className="text-yellow-400">AZEVENT.VN</span>
              </h2>
              <p className="text-white/50 text-lg leading-relaxed mb-8">
                AZEvent là đơn vị tổ chức sự kiện chuyên nghiệp hàng đầu Việt Nam với hơn <span className="text-white font-bold">10 năm kinh nghiệm</span> trong lĩnh vực tổ chức gala dinner, tất niên, hội nghị và các sự kiện doanh nghiệp quy mô lớn.
              </p>
              <p className="text-white/40 leading-relaxed mb-10">
                LuckyDraw.Pro được xây dựng từ chính nhu cầu thực tế của hàng trăm sự kiện đã tổ chức — giúp phần quay số trở nên <span className="text-white">chuyên nghiệp, minh bạch và ấn tượng</span> hơn trước hàng nghìn khán giả.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://azevent.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-yellow-400 text-black px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white transition-all"
                >
                  🌐 Xem AZEvent.vn
                </a>
                <a
                  href="tel:09123.86.968"
                  className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:border-yellow-400/50 hover:text-yellow-400 transition-all"
                >
                  📞 09123.86.968
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { num: '10+', label: 'Năm kinh nghiệm', sub: 'Tổ chức sự kiện chuyên nghiệp' },
                { num: '500+', label: 'Sự kiện đã tổ chức', sub: 'Gala, tất niên, hội nghị' },
                { num: '50K+', label: 'Khách mời phục vụ', sub: 'Trên toàn quốc' },
                { num: '24/7', label: 'Hỗ trợ kỹ thuật', sub: 'Hotline: 09123.86.968' },
              ].map((item, i) => (
                <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-[32px] hover:border-yellow-400/30 transition-all">
                  <div className="text-3xl font-black text-yellow-400 mb-1">{item.num}</div>
                  <div className="font-bold text-white mb-1">{item.label}</div>
                  <div className="text-white/40 text-xs">{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <Trophy className="text-white" size={18} />
                </div>
                <span className="font-black text-xl tracking-tighter italic">LUCKYDRAW.PRO</span>
              </div>
              <p className="text-white/40 text-sm max-w-xs leading-relaxed">
                Sản phẩm của <a href="https://azevent.vn" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">AZEvent.vn</a> — Đơn vị tổ chức sự kiện chuyên nghiệp hàng đầu Việt Nam.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-black text-sm uppercase tracking-widest text-white/40 mb-5">Liên hệ</h4>
              <div className="space-y-3">
                <a href="tel:09123.86.968" className="flex items-center gap-3 text-white/60 hover:text-yellow-400 transition-colors text-sm font-medium">
                  <span className="text-lg">📞</span>
                  <div>
                    <div className="font-bold text-white">09123.86.968</div>
                    <div className="text-xs text-white/40">Hotline 24/7</div>
                  </div>
                </a>
                <a href="mailto:info@azevent.vn" className="flex items-center gap-3 text-white/60 hover:text-yellow-400 transition-colors text-sm font-medium">
                  <span className="text-lg">✉️</span>
                  <div>
                    <div className="font-bold text-white">info@azevent.vn</div>
                    <div className="text-xs text-white/40">Email hỗ trợ</div>
                  </div>
                </a>
                <div className="flex items-start gap-3 text-white/40 text-sm">
                  <span className="text-lg mt-0.5">📍</span>
                  <div>Sảnh D, T02, Chung cư C37 Bắc Hà, 17 Tố Hữu, Nam Từ Liêm, Hà Nội</div>
                </div>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-black text-sm uppercase tracking-widest text-white/40 mb-5">Liên kết</h4>
              <div className="space-y-3">
                <a href="https://azevent.vn" target="_blank" rel="noopener noreferrer" className="block text-white/60 hover:text-yellow-400 transition-colors text-sm font-medium">🌐 AZEvent.vn</a>
                <a href="https://facebook.com/azevent" target="_blank" rel="noopener noreferrer" className="block text-white/60 hover:text-yellow-400 transition-colors text-sm font-medium">📘 Facebook</a>
                <a href="https://github.com/leluongnghia/Pro-Lucky-Draw" target="_blank" rel="noopener noreferrer" className="block text-white/60 hover:text-yellow-400 transition-colors text-sm font-medium">💻 Github</a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 text-white/20 text-sm font-medium text-center">
            © 2024 LuckyDraw.Pro by <a href="https://azevent.vn" target="_blank" rel="noopener" className="hover:text-yellow-400 transition-colors">AZEvent.vn</a> — Công ty TNHH Truyền thông và Tổ chức Sự kiện Số 1.
          </div>
        </div>
      </footer>
    </div>
  );
};
