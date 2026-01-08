import { useEffect, useState } from "react";
import {
	Heart,
	BookOpen,
	Users,
	TrendingUp,
	Building2,
	Sparkles,
	CheckCircle,
	Phone,
	FileText,
	ArrowRight,
	X,
	Maximize2,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { supabase } from "../lib/supabaseClient";

interface Agenda {
	id: number;
	title: string;
	content: string;
	slug: string;
	image_url: string;
	created_at: string;
}

interface DocumentationItem {
	id: number;
	title: string;
	description?: string;
	is_active: boolean;
	type: "image" | "video";
	url: string;
	created_at: string;
}

interface SiteSettings {
	phone: string;
	email: string;
	address: string;
	bank_name: string;
	bank_number: string;
	bank_holder: string;
	vision: string;
	mission: string;
	logo_url: string;
	pamphlet_url: string;
	instagram_url: string;
	facebook_url: string;
	youtube_url: string;
}

interface DonationStats {
	totalUang: number | null;
	totalOrang: number | null;
	lastUpdate: string | null;
}

function LandingPage() {
	const [agendas, setAgendas] = useState<Agenda[]>([]);
	const [documentation, setDocumentation] = useState<DocumentationItem[]>([]);
	const [settings, setSettings] = useState<SiteSettings | null>(null);
	const [selectedDoc, setSelectedDoc] = useState<DocumentationItem | null>(
		null
	);
	const [donationStats, setDonationStats] = useState<DonationStats>({
		totalUang: null,
		totalOrang: null,
		lastUpdate: null,
	});
	const [loading, setLoading] = useState(true);

	const donationStatsUrl = import.meta.env.VITE_GSHEET_DONATION_URL;

	useEffect(() => {
		fetchData();
		trackPageView();
	}, []);

	const trackPageView = async () => {
		try {
			await supabase.from("page_views").insert([
				{
					page_path: window.location.pathname,
					user_agent: navigator.userAgent,
				},
			]);
		} catch (error) {
			console.error("Error tracking page view:", error);
		}
	};

	const fetchData = async () => {
		await Promise.all([
			fetchAgendas(),
			fetchDocumentation(),
			fetchSettings(),
			fetchDonationStats(),
		]);
		setLoading(false);
	};

	const fetchSettings = async () => {
		try {
			const { data, error } = await supabase
				.from("site_settings")
				.select("*")
				.single();

			if (error) throw error;
			setSettings(data);
		} catch (error) {
			console.error("Error fetching settings:", error);
		}
	};

	const fetchDocumentation = async () => {
		try {
			const { data, error } = await supabase
				.from("documentation_items")
				.select("*")
				.eq("is_active", true)
				.order("created_at", { ascending: false });

			if (error) throw error;
			setDocumentation(data || []);
		} catch (error) {
			console.error("Error fetching documentation:", error);
		}
	};

	const fetchAgendas = async () => {
		try {
			const { data, error } = await supabase
				.from("agendas")
				.select("*")
				.order("created_at", { ascending: false })
				.limit(4); // Limit to 4 latest agendas

			if (error) throw error;
			setAgendas(data || []);
		} catch (error) {
			console.error("Error fetching agendas:", error);
		} finally {
			// Loading handled in fetchData
		}
	};

	const fetchDonationStats = async () => {
		try {
			if (!donationStatsUrl) {
				throw new Error("Donation stats URL is not configured");
			}

			const response = await fetch(donationStatsUrl);

			if (!response.ok) {
				throw new Error(`Donation stats request failed: ${response.status}`);
			}

			const payload = await response.json();

			if (payload?.status !== "success") {
				throw new Error("Donation stats response not successful");
			}

			const totalUangRaw = payload?.total_uang;
			const totalOrangRaw = payload?.total_orang;
			const totalUang = Number(
				String(totalUangRaw ?? "").replace(/[^\d.-]/g, "")
			);
			const totalOrang = Number(
				String(totalOrangRaw ?? "").replace(/[^\d.-]/g, "")
			);

			setDonationStats({
				totalUang: Number.isFinite(totalUang) ? totalUang : null,
				totalOrang: Number.isFinite(totalOrang) ? totalOrang : null,
				lastUpdate: payload?.last_update ?? null,
			});
		} catch (error) {
			console.error("Error fetching donation stats:", error);
		}
	};

	const formatRupiah = (value: number | null) => {
		if (value === null) return "Rp -";
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			maximumFractionDigits: 0,
		}).format(value);
	};

	const formatNumber = (value: number | null) => {
		if (value === null) return "-";
		return new Intl.NumberFormat("id-ID").format(value);
	};

	const formatLastUpdate = (value: string | null) => {
		if (!value) return "-";
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return "-";
		return date.toLocaleString("id-ID", {
			dateStyle: "medium",
			timeStyle: "short",
		});
	};

	const currentUrl = window.location.href;

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
			<Helmet>
				<title>Surau Genesia - Pusat Peradaban Generasi Muda</title>
				<meta
					name="description"
					content="Surau Genesia adalah pusat pendidikan, sosial, dan peradaban untuk melahirkan generasi Islami yang taat, cerdas, dan visioner. Mari dukung pembangunan Surau Genesia."
				/>
				<meta
					name="keywords"
					content="Surau Genesia, Lampung Cerdas, donasi, wakaf, pembangunan masjid, generasi muda, Islam, pendidikan, sosial, peradaban"
				/>
				<meta name="author" content="Surau Genesia - Lampung Cerdas" />
				<link rel="canonical" href={currentUrl} />
				<meta
					property="og:title"
					content="Surau Genesia - Pusat Peradaban Generasi Muda"
				/>
				<meta
					property="og:description"
					content="Dukung pembangunan Surau Genesia untuk mencetak generasi taat, cerdas, dan visioner."
				/>
				<meta property="og:url" content={currentUrl} />
				<meta
					property="og:image"
					content={`${window.location.origin}/image/hero-bg.jpg`}
				/>
				<meta name="twitter:card" content="summary_large_image" />
			</Helmet>
			{/* Hero Section */}
			<section
				className="relative overflow-hidden text-white bg-center bg-cover"
				style={{ backgroundImage: "url('/image/bg.jpg')" }}
			>
				<div className="absolute inset-0 bg-gradient-to-br from-teal-600/80 via-teal-700/80 to-cyan-800/80"></div>
				<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptLTggMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>

				<nav className="container relative px-6 py-6 mx-auto">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<img
								src={settings?.logo_url || "/Logo Surau Genesia.jpg"}
								alt="Surau Genesia"
								className="object-cover w-16 h-16 border-2 border-white rounded-full shadow-lg"
							/>
							<div>
								<h1 className="text-2xl font-bold">Surau Genesia</h1>
								<p className="text-sm text-teal-100">Lampung Cerdas</p>
							</div>
						</div>
					</div>
				</nav>

				<div className="container relative px-6 py-20 pb-32 mx-auto">
					<div className="max-w-4xl mx-auto text-center">
						<div className="inline-flex items-center px-6 py-2 mb-8 space-x-2 border rounded-full bg-white/10 backdrop-blur-sm border-white/20">
							<Sparkles className="w-5 h-5 text-yellow-300" />
							<span className="text-sm font-medium">
								Pusat Peradaban Generasi Muda
							</span>
						</div>

						<h2 className="mb-6 text-5xl font-bold leading-tight md:text-6xl">
							Mencetak Generasi Taat,
							<br />
							Cerdas, dan Visioner
						</h2>

						<p className="mb-8 text-xl leading-relaxed text-teal-100 md:text-2xl">
							Dari Surau Kecil, Lahir Sejuta Pemimpin yang Taat, Cerdas, dan
							Visioner
						</p>

						<p className="max-w-3xl mx-auto mb-12 text-lg leading-relaxed text-teal-50">
							Bayangkan... di sebuah surau kecil, anak-anak muda belajar bukan
							hanya menghafal Al-Qur'an, tetapi juga belajar memimpin,
							berbicara, berpikir, dan berbuat baik untuk umat.
						</p>

						<a
							href={`https://api.whatsapp.com/send/?phone=${
								settings?.phone?.replace(/\D/g, "") || "6289531170313"
							}&text=Assalamualaikum+Kak%2C+Saya+tertarik+untuk+berdonasi+di+Surau+Genesia.`}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center px-10 py-5 space-x-2 text-lg font-bold text-white transition-all duration-300 rounded-full shadow-2xl bg-gradient-to-r from-green-400 to-emerald-500 hover:shadow-green-500/50 hover:scale-105 hover:from-green-500 hover:to-emerald-600"
						>
							<Heart className="w-6 h-6" />
							<span>DONASI SEKARANG</span>
						</a>
					</div>
				</div>

				<div className="absolute bottom-0 left-0 right-0">
					<svg
						viewBox="0 0 1440 120"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
							fill="white"
						/>
					</svg>
				</div>
			</section>

			{/* About Section */}
			<section className="py-16 bg-white">
				<div className="container px-6 mx-auto">
					<div className="max-w-4xl mx-auto">
						<div className="mb-16 text-center">
							<h2 className="mb-6 text-4xl font-bold text-gray-800 md:text-5xl">
								Apa Itu Surau Genesia?
							</h2>
							<p className="text-xl leading-relaxed text-gray-600">
								Surau Genesia adalah ruang peradaban untuk membangun generasi
								muda Islami, mandiri, dan visioner. Bukan hanya tempat shalat,
								tapi tempat lahirnya pemimpin yang akan menebar cahaya
								perubahan.
							</p>
						</div>

						<div className="grid gap-8 mb-12 md:grid-cols-2">
							<div className="p-8 border border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl">
								<h3 className="mb-4 text-2xl font-bold text-teal-800">Surau</h3>
								<p className="leading-relaxed text-gray-700">
									Simbol tempat ibadah, ruang ilmu, dan pusat pembinaan karakter
								</p>
							</div>
							<div className="p-8 border bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border-emerald-100">
								<h3 className="mb-4 text-2xl font-bold text-emerald-800">
									Genesia
								</h3>
								<p className="leading-relaxed text-gray-700">
									Singkatan dari Generasi Emas Asia, generasi muda yang lahir
									dari Lampung untuk Indonesia
								</p>
							</div>
						</div>

						<div className="p-10 text-white shadow-xl bg-gradient-to-r from-teal-600 to-cyan-700 rounded-2xl">
							<p className="text-xl italic font-medium leading-relaxed text-center md:text-2xl">
								"Surau Genesia bukan sekadar bangunan. Ia adalah investasi
								peradaban, tempat tumbuhnya generasi yang akan meneruskan
								kebaikan dan kepemimpinan Islam di masa depan."
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Donation Highlights */}
			<section className="py-12 bg-white">
				<div className="container px-6 mx-auto">
					<div className="grid max-w-4xl gap-6 mx-auto md:grid-cols-2">
						<div className="p-6 border-2 bg-gradient-to-br from-teal-600 to-cyan-700 rounded-2xl">
							<p className="text-sm font-semibold text-white uppercase">
								Total Donasi Terkumpul
							</p>
							<p className="mt-3 text-3xl font-bold text-white">
								{formatRupiah(donationStats.totalUang)}
							</p>
							<p className="mt-2 text-sm text-gray-300">
								Update terakhir: {formatLastUpdate(donationStats.lastUpdate)}
							</p>
						</div>
						<div className="p-6 border-2 bg-gradient-to-br from-teal-600 to-cyan-700 rounded-2xl">
							<p className="text-sm font-semibold text-white uppercase">
								Jumlah Donatur
							</p>
							<p className="mt-3 text-3xl font-bold text-white">
								{formatNumber(donationStats.totalOrang)}
							</p>
							<p className="mt-2 text-sm text-gray-300">
								Terima kasih atas dukungan Anda
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Vision & Mission */}
			<section className="py-20 bg-gradient-to-br from-slate-50 to-teal-50">
				<div className="container px-6 mx-auto">
					<div className="max-w-6xl mx-auto">
						<div className="grid gap-12 md:grid-cols-2">
							<div className="p-10 bg-white border border-teal-100 shadow-lg rounded-2xl">
								<div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl">
									<TrendingUp className="w-8 h-8 text-white" />
								</div>
								<h3 className="mb-6 text-3xl font-bold text-gray-800">Visi</h3>
								<p className="text-lg leading-relaxed text-gray-700">
									{settings?.vision ||
										"Menjadi pusat pendidikan, sosial, dan peradaban yang melahirkan generasi Islami, intelektual, dan berdaya kepemimpinan global."}
								</p>
							</div>

							<div className="p-10 bg-white border border-teal-100 shadow-lg rounded-2xl">
								<div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl">
									<CheckCircle className="w-8 h-8 text-white" />
								</div>
								<h3 className="mb-6 text-3xl font-bold text-gray-800">Misi</h3>
								<ul className="space-y-4">
									{(settings?.mission
										? settings.mission.split("\n")
										: [
												"Menumbuhkan karakter keislaman yang kuat pada generasi muda",
												"Mengembangkan intelektualitas melalui pendidikan formal, non-formal, dan komunitas belajar",
												"Membangun kepemimpinan, kemandirian, dan kepedulian sosial",
												"Menjadi pusat sinergi kegiatan sosial, budaya, ekonomi, dan dakwah",
												"Mengelola wakaf dan Baitulmal secara transparan untuk kebermanfaatan masyarakat",
										  ]
									).map((item, index) => (
										<li key={index} className="flex items-start space-x-3">
											<CheckCircle className="flex-shrink-0 w-5 h-5 mt-1 text-green-500" />
											<span className="leading-relaxed text-gray-700">
												{item}
											</span>
										</li>
									))}
								</ul>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Core Values */}
			<section className="py-20 bg-white">
				<div className="container px-6 mx-auto">
					<div className="max-w-4xl mx-auto mb-16 text-center">
						<h2 className="mb-6 text-4xl font-bold text-gray-800 md:text-5xl">
							Misi Kami: Mencetak Sejuta Pemimpin Masa Depan
						</h2>
						<p className="text-xl text-gray-600">
							Anak-anak muda yang tumbuh dengan nilai-nilai inti
						</p>
					</div>

					<div className="grid max-w-5xl gap-8 mx-auto md:grid-cols-3">
						{[
							{
								icon: "🕋",
								title: "Taat",
								description: "Kepada Allah SWT dan nilai-nilai Islam",
								color: "from-teal-500 to-cyan-600",
							},
							{
								icon: "📚",
								title: "Cerdas",
								description: "Intelektual, kreatif, berilmu",
								color: "from-blue-500 to-indigo-600",
							},
							{
								icon: "🚀",
								title: "Visioner",
								description: "Kepemimpinan yang membawa perubahan positif",
								color: "from-emerald-500 to-green-600",
							},
						].map((value, index) => (
							<div
								key={index}
								className="p-8 transition-all duration-300 bg-white border-2 border-gray-100 shadow-lg rounded-2xl hover:border-teal-300 hover:shadow-2xl hover:-translate-y-2"
							>
								<div
									className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${value.color} rounded-2xl mb-6 text-4xl shadow-lg`}
								>
									{value.icon}
								</div>
								<h3 className="mb-3 text-2xl font-bold text-gray-800">
									{value.title}
								</h3>
								<p className="leading-relaxed text-gray-600">
									{value.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Functions */}
			<section className="py-20 bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50">
				<div className="container px-6 mx-auto">
					<div className="max-w-4xl mx-auto mb-16 text-center">
						<h2 className="mb-6 text-4xl font-bold text-gray-800 md:text-5xl">
							Fungsi Surau Genesia
						</h2>
						<p className="text-xl text-gray-600">
							Pusat peradaban yang melayani berbagai kebutuhan generasi muda
						</p>
					</div>

					<div className="grid max-w-6xl gap-6 mx-auto md:grid-cols-2 lg:grid-cols-3">
						{[
							{
								icon: Building2,
								title: "Mushola & Ruang Ibadah",
								description:
									"Terbuka untuk umum, tempat mendekatkan diri kepada Allah SWT",
								gradient: "from-teal-500 to-cyan-600",
							},
							{
								icon: BookOpen,
								title: "Rumahnya Penghafal Qur'an",
								description:
									"Program untuk mendidik anak muda bisa baca, paham dan mengamalkan Al-Qur'an",
								gradient: "from-emerald-500 to-green-600",
							},
							{
								icon: Users,
								title: "Pusat Pendidikan & Pelatihan",
								description: "Kelas kepemimpinan, tahfidz, kajian, dan kursus",
								gradient: "from-blue-500 to-cyan-600",
							},
							{
								icon: TrendingUp,
								title: "Youth & Leadership Hub",
								description:
									"Pelatihan soft skill, kewirausahaan, dan digital skill",
								gradient: "from-orange-500 to-red-600",
							},
							{
								icon: Heart,
								title: "Baitulmal Center",
								description:
									"Pengelolaan zakat, infaq, wakaf, dan program sosial",
								gradient: "from-pink-500 to-rose-600",
							},
							{
								icon: Sparkles,
								title: "Cultural & Social Space",
								description: "Kegiatan budaya, literasi, dan seni Islami",
								gradient: "from-purple-500 to-indigo-600",
							},
						].map((func, index) => (
							<div
								key={index}
								className="p-8 transition-all duration-300 bg-white border border-gray-100 shadow-lg rounded-2xl hover:shadow-2xl hover:-translate-y-1"
							>
								<div
									className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${func.gradient} rounded-xl mb-5 shadow-lg`}
								>
									<func.icon className="text-white w-7 h-7" />
								</div>
								<h3 className="mb-3 text-xl font-bold text-gray-800">
									{func.title}
								</h3>
								<p className="leading-relaxed text-gray-600">
									{func.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Documentation Section */}
			<section className="py-20 bg-white">
				<div className="container px-6 mx-auto">
					<div className="max-w-6xl mx-auto">
						<div className="mb-16 text-center">
							<div className="inline-flex items-center px-6 py-2 mb-6 space-x-2 rounded-full bg-gradient-to-r from-teal-100 to-cyan-100">
								<Sparkles className="w-5 h-5 text-teal-600" />
								<span className="text-sm font-semibold text-teal-700">
									Progress Pembangunan
								</span>
							</div>
							<h2 className="mb-6 text-4xl font-bold text-gray-800 md:text-5xl">
								Dokumentasi & Progres
							</h2>
							<p className="text-xl text-gray-600">
								Saksikan perjalanan pembangunan Surau Genesia melalui gambar dan
								video
							</p>
						</div>

						{/* Documentation Gallery Section (Images) */}
						<div className="mb-16">
							<h3 className="mb-8 text-2xl font-bold text-center text-gray-800">
								Agenda
							</h3>
							{documentation.filter((i) => i.type === "image").length > 0 ? (
								<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
									{documentation
										.filter((i) => i.type === "image")
										.map((item) => (
											<div
												key={item.id}
												className="overflow-hidden transition-all bg-white shadow-lg cursor-pointer rounded-2xl group hover:shadow-xl"
												onClick={() => setSelectedDoc(item)}
											>
												<div className="relative overflow-hidden aspect-video">
													<img
														src={item.url}
														alt={item.title}
														className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
													/>
													<div className="absolute inset-0 flex items-center justify-center transition-colors opacity-0 bg-black/0 group-hover:bg-black/20 group-hover:opacity-100">
														<Maximize2 className="w-8 h-8 text-white drop-shadow-lg" />
													</div>
												</div>
												<div className="p-4">
													<h4 className="mb-1 font-bold text-gray-800 line-clamp-1">
														{item.title}
													</h4>
													{item.description && (
														<p className="text-sm text-gray-600 line-clamp-2">
															{item.description.replace(/<[^>]+>/g, "")}
														</p>
													)}
												</div>
											</div>
										))}
								</div>
							) : (
								<div className="py-8 text-center border border-gray-300 border-dashed bg-gray-50 rounded-xl">
									<p className="text-gray-500">Belum ada foto dokumentasi.</p>
								</div>
							)}
						</div>

						{/* Building Plan Section */}
						<div className="mb-16">
							<h3 className="mb-8 text-2xl font-bold text-center text-gray-800">
								Rencana Pembangunan
							</h3>
							<div className="flex flex-col items-center gap-8 md:flex-row">
								<div className="w-full md:w-1/2">
									<img
										src="/image/plan bangungan.jpg"
										alt="Rencana Pembangunan Surau Genesia"
										className="object-cover w-full shadow-lg rounded-2xl"
									/>
								</div>
								<div className="w-full text-center text-gray-700 md:w-1/2 md:text-left">
									<p className="mb-4 text-lg leading-relaxed">
										Ini adalah desain final dari Surau Genesia yang akan kita
										bangun bersama. Sebuah bangunan modern yang akan menjadi
										pusat peradaban, pendidikan, dan kegiatan sosial bagi
										generasi muda di Lampung.
									</p>
									<p className="text-lg leading-relaxed">
										Setiap detailnya dirancang untuk menciptakan lingkungan yang
										nyaman dan inspiratif untuk belajar, beribadah, dan
										berkarya.
									</p>
								</div>
							</div>
						</div>

						{/* Video Documentation Section */}
						<div className="mb-12">
							<h3 className="mb-8 text-2xl font-bold text-center text-gray-800">
								Video Dokumentasi
							</h3>
							{documentation.filter((i) => i.type === "video").length > 0 ? (
								<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
									{documentation
										.filter((i) => i.type === "video")
										.map((item) => (
											<div
												key={item.id}
												className="flex flex-col overflow-hidden bg-white shadow-lg rounded-2xl"
											>
												<div className="relative bg-black aspect-video">
													<video
														src={item.url}
														className="object-contain w-full h-full"
														controls
													/>
												</div>
												<div className="flex-1 p-4">
													<h4 className="mb-2 font-bold text-gray-800">
														{item.title}
													</h4>
													{item.description && (
														<div>
															<div
																className={`text-gray-600 text-sm ${
																	selectedDoc?.id === item.id
																		? "prose prose-sm max-w-none"
																		: "line-clamp-2"
																}`}
																dangerouslySetInnerHTML={{
																	__html:
																		selectedDoc?.id === item.id
																			? item.description
																			: item.description.replace(
																					/<[^>]+>/g,
																					""
																			  ),
																}}
															/>
															{item.description.replace(/<[^>]+>/g, "").length >
																100 && (
																<button
																	onClick={(e) => {
																		e.stopPropagation();
																		setSelectedDoc(
																			selectedDoc?.id === item.id ? null : item
																		);
																	}}
																	className="mt-1 text-xs font-semibold text-teal-600 hover:underline focus:outline-none"
																>
																	{selectedDoc?.id === item.id
																		? "Sembunyikan"
																		: "Baca Selengkapnya"}
																</button>
															)}
														</div>
													)}
												</div>
											</div>
										))}
								</div>
							) : (
								<div className="py-8 text-center border border-gray-300 border-dashed bg-gray-50 rounded-xl">
									<p className="text-gray-500">Belum ada video dokumentasi.</p>
								</div>
							)}
						</div>

						{/* Progress Stats */}
						<div className="p-10 border-2 border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl">
							<h3 className="mb-8 text-2xl font-bold text-center text-gray-800">
								Progress Pembangunan Saat Ini
							</h3>
							<div className="grid gap-8 md:grid-cols-3">
								<div className="text-center">
									<div className="inline-flex items-center justify-center w-16 h-16 mb-4 shadow-lg bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl">
										<Building2 className="w-8 h-8 text-white" />
									</div>
									<h4 className="mb-2 text-lg font-bold text-gray-800">
										Lokasi
									</h4>
									<p className="text-gray-600">
										Gg. Sawah Baru, Kp. Baru, Kec. Kedaton, Kota Bandar Lampung,
										Lampung 35141
									</p>
								</div>
								<div className="text-center">
									<div className="inline-flex items-center justify-center w-16 h-16 mb-4 shadow-lg bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl">
										<TrendingUp className="w-8 h-8 text-white" />
									</div>
									<h4 className="mb-2 text-lg font-bold text-gray-800">
										Tahap
									</h4>
									<p className="text-gray-600">Persiapan Pembangunan</p>
								</div>
								<div className="text-center">
									<div className="inline-flex items-center justify-center w-16 h-16 mb-4 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
										<Heart className="w-8 h-8 text-white" />
									</div>
									<h4 className="mb-2 text-lg font-bold text-gray-800">
										Target Donasi
									</h4>
									<p className="text-gray-600">Rp 1 Miliar</p>
								</div>
							</div>
							<div className="grid gap-8 py-8 md:grid-cols-2">
								<div className="text-center">
									<div className="inline-flex items-center justify-center w-16 h-16 mb-4 shadow-lg bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl">
										<Users className="w-8 h-8 text-white" />
									</div>
									<h4 className="mb-2 text-lg font-bold text-gray-800">
										Jumlah Donatur
									</h4>
									<p className="text-gray-600">
										{formatNumber(donationStats.totalOrang)}
									</p>
								</div>
								<div className="text-center">
									<div className="inline-flex items-center justify-center w-16 h-16 mb-4 shadow-lg bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl">
										<TrendingUp className="w-8 h-8 text-white" />
									</div>
									<h4 className="mb-2 text-lg font-bold text-gray-800">
										Jumlah Donasi
									</h4>
									<p className="text-gray-600">
										{formatRupiah(donationStats.totalUang)}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Agenda / Public Reports Section */}
			<section className="py-20 bg-slate-50">
				<div className="container px-6 mx-auto">
					<div className="max-w-6xl mx-auto">
						<div className="mb-12 text-center">
							<div className="inline-flex items-center px-6 py-2 mb-6 space-x-2 bg-blue-100 rounded-full">
								<FileText className="w-5 h-5 text-blue-600" />
								<span className="text-sm font-semibold text-blue-700">
									Agenda & Berita
								</span>
							</div>
							<h2 className="mb-4 text-3xl font-bold text-gray-800">
								Agenda Terkini
							</h2>
							<p className="text-gray-600">
								Ikuti kegiatan dan perkembangan terbaru dari Surau Genesia.
							</p>
						</div>

						{loading ? (
							<div className="py-12 text-center">
								<p className="text-gray-500">Memuat agenda...</p>
							</div>
						) : agendas.length > 0 ? (
							<>
								<div className="grid gap-8 mb-12 md:grid-cols-2 lg:grid-cols-3">
									{agendas.slice(0, 3).map((agenda) => (
										<div
											key={agenda.id}
											className="flex flex-col overflow-hidden transition-shadow bg-white shadow-lg rounded-xl hover:shadow-xl"
										>
											<div className="relative h-48 bg-gray-200">
												{agenda.image_url ? (
													<img
														src={agenda.image_url}
														alt={agenda.title}
														className="object-cover w-full h-full"
													/>
												) : (
													<div className="flex items-center justify-center w-full h-full text-gray-400">
														<Sparkles className="w-12 h-12" />
													</div>
												)}
											</div>
											<div className="flex flex-col flex-1 p-6">
												<h3 className="mb-3 text-xl font-bold text-gray-800 line-clamp-2">
													{agenda.title}
												</h3>
												<div
													className="mb-4 text-sm prose-sm prose text-gray-600 line-clamp-3"
													dangerouslySetInnerHTML={{ __html: agenda.content }}
												/>
												<div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-100">
													<span className="text-xs text-gray-500">
														{new Date(agenda.created_at).toLocaleDateString(
															"id-ID",
															{
																day: "numeric",
																month: "long",
																year: "numeric",
															}
														)}
													</span>
													<a
														href={`/agenda/${agenda.slug}`}
														className="flex items-center text-sm font-medium text-teal-600 hover:text-teal-700"
													>
														Baca Selengkapnya{" "}
														<ArrowRight className="w-4 h-4 ml-1" />
													</a>
												</div>
											</div>
										</div>
									))}
								</div>

								<div className="text-center">
									<a
										href="/agenda"
										className="inline-flex items-center px-8 py-3 text-lg font-semibold text-white transition-all duration-300 bg-teal-600 rounded-full hover:bg-teal-700 hover:shadow-lg hover:-translate-y-1"
									>
										Lihat Lebih Banyak
										<ArrowRight className="w-5 h-5 ml-2" />
									</a>
								</div>
							</>
						) : (
							<div className="py-12 text-center bg-white border border-gray-100 shadow-sm rounded-xl">
								<p className="text-gray-500">Belum ada agenda terbaru.</p>
							</div>
						)}
					</div>
				</div>
			</section>

			{/* Hadith Section */}
			<section className="relative py-20 overflow-hidden text-white bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800">
				<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptLTggMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>

				<div className="container relative z-10 px-6 mx-auto">
					<div className="max-w-4xl mx-auto">
						<div className="mb-12 text-center">
							<h2 className="mb-8 text-4xl font-bold md:text-5xl">
								Mengapa Kami Butuh Dukungan Anda
							</h2>
						</div>

						<div className="p-10 border bg-white/10 backdrop-blur-sm border-white/20 rounded-2xl md:p-12">
							<div className="mb-8">
								<p className="mb-8 font-serif text-2xl italic leading-relaxed text-center md:text-3xl">
									"Apabila manusia meninggal dunia, maka terputuslah amalnya
									kecuali tiga: sedekah jariyah, ilmu yang bermanfaat, dan anak
									saleh yang mendoakannya."
								</p>
								<p className="text-lg text-center text-teal-100">
									(HR. Muslim)
								</p>
							</div>

							<div className="space-y-6 text-lg leading-relaxed">
								<p>
									Setiap <strong>batu bata, cat, karpet, dan lantai</strong>{" "}
									yang Anda bantu bangun, akan menjadi{" "}
									<strong>pahala jariyah yang terus mengalir</strong>.
								</p>
								<p>
									Dengan mendukung pembangunan Surau Genesia, Anda sedang
									menanam pohon kebaikan yang buahnya akan terus mengalir hingga
									akhir hayat.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Donation Section */}
			<section id="donasi" className="py-20 bg-white">
				<div className="container px-6 mx-auto">
					<div className="max-w-4xl mx-auto">
						<div className="mb-16 text-center">
							<div className="inline-flex items-center px-6 py-2 mb-6 space-x-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100">
								<Heart className="w-5 h-5 text-green-600" />
								<span className="text-sm font-semibold text-green-700">
									Mari Berkontribusi
								</span>
							</div>
							<h2 className="mb-6 text-4xl font-bold text-gray-800 md:text-5xl">
								Bagaimana Anda Bisa Berkontribusi
							</h2>
							<p className="text-xl text-gray-600">
								Setiap rupiah Anda adalah cahaya, setiap dukungan Anda adalah
								amal yang hidup selamanya
							</p>
						</div>

						<div className="mb-12">
							<img
								src={settings?.pamphlet_url || "/image/donasi.jpg"}
								alt="Donasi Surau Genesia"
								className="w-full shadow-lg rounded-2xl"
							/>
						</div>

						<div className="grid gap-6 mb-12 md:grid-cols-2">
							<div className="p-6 border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl">
								<p className="text-sm font-semibold uppercase text-emerald-700">
									Total Donasi Terkumpul
								</p>
								<p className="mt-3 text-3xl font-bold text-emerald-900">
									{formatRupiah(donationStats.totalUang)}
								</p>
								<p className="mt-2 text-sm text-emerald-700">
									Update terakhir: {formatLastUpdate(donationStats.lastUpdate)}
								</p>
							</div>
							<div className="p-6 border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl">
								<p className="text-sm font-semibold text-teal-700 uppercase">
									Jumlah Donatur
								</p>
								<p className="mt-3 text-3xl font-bold text-teal-900">
									{formatNumber(donationStats.totalOrang)}
								</p>
								<p className="mt-2 text-sm text-teal-700">
									Terima kasih atas dukungan Anda
								</p>
							</div>
						</div>

						<div className="grid gap-8 mb-12 md:grid-cols-2">
							<div className="p-8 border-2 border-green-200 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
								<div className="inline-flex items-center justify-center w-16 h-16 mb-6 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
									<Heart className="w-8 h-8 text-white" />
								</div>
								<h3 className="mb-4 text-2xl font-bold text-gray-800">
									Donasi Tunai / Transfer
								</h3>
								<div className="space-y-3 text-gray-700">
									<p className="font-semibold">
										{settings?.bank_name || "Bank Syariah Indonesia"}
									</p>
									<p>
										a.n. {settings?.bank_holder || "Baitul Maal Lampung Cerdas"}
									</p>
									<p className="px-4 py-3 font-mono font-bold text-white bg-green-500 border border-green-200 rounded-lg">
										{settings?.bank_number || "7328070116"}
									</p>
								</div>
							</div>

							<div className="p-8 border-2 border-teal-200 shadow-lg bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl">
								<div className="inline-flex items-center justify-center w-16 h-16 mb-6 shadow-lg bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl">
									<Building2 className="w-8 h-8 text-white" />
								</div>
								<h3 className="mb-4 text-2xl font-bold text-gray-800">
									Wakaf Tunai / Material
								</h3>
								<div className="space-y-4 text-gray-700">
									<p>Hubungi kami di whatsapp:</p>
									<div className="space-y-3">
										<div className="flex items-center px-4 py-3 space-x-3 text-black bg-red-500 border border-teal-200 rounded-lg">
											<Phone className="w-5 h-5" />
											<span className="font-bold">
												{settings?.phone || "089531170313"}
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className="p-8 mb-12 border-2 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 rounded-2xl">
							<h3 className="mb-4 text-2xl font-bold text-gray-800">
								Transparansi & Akuntabilitas
							</h3>
							<p className="mb-6 leading-relaxed text-gray-700">
								Kami berkomitmen menjaga transparansi & laporan berkala setiap
								donasi:
							</p>
							<div className="grid gap-4 md:grid-cols-3">
								{[
									"Laporan keuangan mingguan",
									"Dokumentasi progress",
									"Publikasi kegiatan sosial",
								].map((item, index) => (
									<div
										key={index}
										className="flex items-center p-4 space-x-3 bg-white rounded-xl"
									>
										<CheckCircle className="flex-shrink-0 w-5 h-5 text-green-500" />
										<span className="font-medium text-gray-700">{item}</span>
									</div>
								))}
							</div>
						</div>

						<div className="text-center">
							<a
								href={`https://api.whatsapp.com/send/?phone=${
									settings?.phone?.replace(/\D/g, "") || "6289531170313"
								}&text=Assalamualaikum+Kak%2C+Saya+tertarik+untuk+berdonasi+di+Surau+Genesia.`}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center px-12 py-6 space-x-3 text-xl font-bold text-white transition-all duration-300 rounded-full shadow-2xl bg-gradient-to-r from-green-400 to-emerald-500 hover:shadow-green-500/50 hover:scale-105 hover:from-green-500 hover:to-emerald-600"
							>
								<Heart className="w-7 h-7" />
								<span>DONASI SEKARANG</span>
							</a>
							<p className="mt-6 text-lg text-gray-600">
								Klik tombol di atas dan jadilah bagian dari sejarah kebaikan!
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Final CTA */}
			<section className="relative py-20 overflow-hidden text-white bg-gradient-to-br from-teal-600 via-emerald-600 to-green-700">
				<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptLTggMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>

				<div className="container relative z-10 px-6 mx-auto">
					<div className="max-w-4xl mx-auto text-center">
						<Sparkles className="w-16 h-16 mx-auto mb-8 text-yellow-300" />
						<h2 className="mb-8 text-4xl font-bold leading-tight md:text-5xl">
							Mari Bersama Membangun
							<br />
							Surau Genesia
						</h2>
						<p className="mb-8 text-2xl font-light leading-relaxed md:text-3xl">
							Karena setiap langkah kecil Anda,
							<br />
							akan menjadi pijakan besar bagi lahirnya sejuta pemimpin masa
							depan
						</p>
						<div className="inline-flex items-center px-8 py-4 space-x-3 border bg-white/10 backdrop-blur-sm border-white/20 rounded-2xl">
							<Sparkles className="w-6 h-6 text-yellow-300" />
							<p className="text-xl italic font-medium">
								"Dari Surau kecil, lahir sejuta pemimpin masa depan."
							</p>
							<Sparkles className="w-6 h-6 text-yellow-300" />
						</div>
					</div>
				</div>
			</section>

			{/* Map Section */}
			<section className="py-20 bg-white">
				<div className="container px-6 mx-auto">
					<div className="max-w-4xl mx-auto text-center">
						<h2 className="mb-10 text-4xl font-bold text-gray-800 md:text-5xl">
							Lokasi Kami
						</h2>
						<div className="overflow-hidden shadow-2xl rounded-2xl">
							<iframe
								src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3594.7882692146472!2d105.24633949999999!3d-5.360317500000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e40c56486d8e83d%3A0x4f3f6f0980e66843!2sLampung%20Cerdas%20Office!5e1!3m2!1sid!2sid!4v1760513804826!5m2!1sid!2sid"
								width="100%"
								height="450"
								style={{ border: 0 }}
								loading="lazy"
								referrerPolicy="no-referrer-when-downgrade"
							></iframe>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="py-12 text-white bg-gray-900">
				<div className="container px-6 mx-auto">
					<div className="max-w-4xl mx-auto text-center">
						<div className="flex items-center justify-center mb-6 space-x-4">
							<img
								src={settings?.logo_url || "/Logo Surau Genesia.jpg"}
								alt="Surau Genesia"
								className="object-cover w-12 h-12 rounded-full"
							/>
							<div className="text-left">
								<h3 className="text-xl font-bold">Surau Genesia</h3>
								<p className="text-sm text-gray-400">Lampung Cerdas</p>
							</div>
						</div>
						<p className="mb-1 text-gray-400">
							Pusat peradaban generasi muda yang taat, cerdas, dan visioner
						</p>
						<p className="mb-4 text-gray-400">
							{settings?.address ||
								"Gg. Sawah Baru, Kp. Baru, Kec. Kedaton, Kota Bandar Lampung, Lampung 35141"}
						</p>
						<p className="mb-6 text-sm text-gray-500">
							© 2025 Surau Genesia. Dikelola oleh Lampung Cerdas.
						</p>

						{/* Social Media Links */}
						<div className="flex justify-center space-x-6">
							{settings?.instagram_url && (
								<a
									href={settings.instagram_url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-gray-400 transition-colors hover:text-white"
								>
									<svg
										className="w-6 h-6"
										fill="currentColor"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<path
											fillRule="evenodd"
											d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465 1.067-.047 1.407-.06 4.123-.06h.08zm1.597 3.807c-1.676.995-2.056 3.011-1.06 4.687.995 1.676 3.011 2.056 4.687 1.06 1.676-.995 2.056-3.011 1.06-4.687-.995-1.676-3.011-2.056-4.687-1.06zm-4.322 1.954c.248-1.937 2.03-3.264 3.967-3.016 1.937.248 3.264 2.03 3.016 3.967-.248 1.937-2.03 3.264-3.967 3.016-1.937-.248-3.264-2.03-3.016-3.967zm-1.87-1.332c0 .552.448 1 1 1 .552 0 1-.448 1-1 0-.552-.448-1-1-1-.552 0-1 .448-1 1z"
											clipRule="evenodd"
										/>
									</svg>
								</a>
							)}
							{settings?.facebook_url && (
								<a
									href={settings.facebook_url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-gray-400 transition-colors hover:text-white"
								>
									<svg
										className="w-6 h-6"
										fill="currentColor"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<path
											fillRule="evenodd"
											d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
											clipRule="evenodd"
										/>
									</svg>
								</a>
							)}
							{settings?.youtube_url && (
								<a
									href={settings.youtube_url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-gray-400 transition-colors hover:text-white"
								>
									<svg
										className="w-6 h-6"
										fill="currentColor"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<path
											fillRule="evenodd"
											d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.254.418-4.814a2.506 2.506 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
											clipRule="evenodd"
										/>
									</svg>
								</a>
							)}
						</div>
					</div>
				</div>
			</footer>

			{/* Modal for Images (Videos handle text expansion in-place for better UX) */}
			{selectedDoc && selectedDoc.type === "image" && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
					onClick={() => setSelectedDoc(null)}
				>
					<div
						className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
						onClick={(e) => e.stopPropagation()}
					>
						<button
							onClick={() => setSelectedDoc(null)}
							className="absolute z-10 p-2 text-white transition-colors rounded-full top-4 right-4 bg-black/50 hover:bg-black/70"
						>
							<X className="w-6 h-6" />
						</button>

						<div className="flex items-center justify-center flex-1 overflow-hidden bg-black">
							<img
								src={selectedDoc.url}
								alt={selectedDoc.title}
								className="w-full h-full object-contain max-h-[70vh]"
							/>
						</div>

						<div className="p-6 overflow-y-auto bg-white md:p-8">
							<h3 className="mb-2 text-2xl font-bold text-gray-900">
								{selectedDoc.title}
							</h3>
							{selectedDoc.description && (
								<div
									className="text-lg leading-relaxed prose prose-lg text-gray-700 max-w-none"
									dangerouslySetInnerHTML={{ __html: selectedDoc.description }}
								/>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default LandingPage;
