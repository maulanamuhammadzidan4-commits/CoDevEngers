<!DOCTYPE html>
<html lang="id">
<head>
    
    <title>CoDevEnger — Ruang Wali Kelas</title>

    <meta
        name="description"
        content="Ungkapan terima kasih, apresiasi, dan kenangan dari seluruh siswa CoDevEnger untuk wali kelas tercinta."
    >

    <!-- Intro Initialization -->
    <script>
        document.documentElement.classList.add('js');

        try {
            if (
                document.documentElement.hasAttribute('data-intro') &&
                !sessionStorage.getItem('cde_intro')
            ) {
                document.documentElement.classList.add('intro-on');
            }
        } catch (error) {
            // Session storage tidak tersedia.
        }
    </script>

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;700&display=swap"
        rel="stylesheet"
    >

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>

    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        ink: '#0A1128',
                        panel: '#111B3D',
                        line: '#22305F',
                        snow: '#F4F6FF',
                        mute: '#AAB4D4',
                        sky: '#7DB8FF',
                        brand: '#C81D25',
                        glow: '#FF5A5F'
                    },

                    fontFamily: {
                        display: ['"Space Grotesk"', 'sans-serif'],
                        sans: ['Inter', 'system-ui', 'sans-serif']
                    }
                }
            }
        };
    </script>

    <!-- Custom Theme -->
    <link rel="stylesheet" href="assets/css/theme.css">
</head>

<body
    class="overflow-x-clip bg-ink font-sans leading-relaxed text-snow"
    data-page="wali-kelas"
>

    <!-- Global Components -->
    <div data-slot="intro"></div>
    <div data-slot="nav"></div>
    <div data-slot="overlays"></div>

    <!-- Hero Section -->
    <header class="relative overflow-hidden">

        <div data-slot="hero-decor"></div>

        <div class="relative mx-auto max-w-[1120px] px-4 pb-[150px] pt-12 sm:px-6 sm:pt-[72px]">

            <span class="anim-in d1 inline-block rounded-full border border-[#2A4A94] px-3.5 py-1.5 text-[13px] font-semibold uppercase tracking-widest text-sky">
                Ruang Wali Kelas · Hari Guru
            </span>

            <h1 class="anim-in d2 mb-5 mt-6 max-w-[700px] font-display text-[clamp(38px,9vw,64px)] font-bold leading-[1.05]">
                Terima kasih,
                <span class="glowtxt text-glow">
                    Bapak Fikri Alfan Fasha, S.Tr.Kom.
                </span>
            </h1>

            <p class="anim-in d3 mb-8 max-w-[560px] text-[clamp(16px,2.4vw,19px)] text-[#C9D2F0]">
               Mungkin waktu akan berlalu, tetapi ilmu, nasihat, dan nilai-nilai yang Bapak tanamkan akan selalu hidup dalam perjalanan kami.
            </p>

        </div>
    </header>

    <!-- Main Content -->
    <main>

        <!-- Appreciation Section -->
        <section
            id="daftar"
            class="mx-auto max-w-[1120px] px-4 pb-6 pt-12 sm:px-6 sm:pt-[72px]"
        >

            <div class="flex flex-wrap items-center justify-between gap-3">
                <span class="text-[13px] font-semibold uppercase tracking-widest text-sky">
                    Apresiasi
                </span>
            </div>

            <h2 class="reveal hl mb-0 mt-2 font-display text-[clamp(28px,6vw,40px)] leading-[1.15]">
                Ungkapan Terima Kasih dari Kami
            </h2>

            <p class="mb-8 mt-2 max-w-[600px] text-mute">
                Setiap pesan menyimpan rasa hormat, doa, dan kenangan
                dari siswa-siswi yang pernah Bapak bimbing.
                Inilah ungkapan sederhana dari kami sebagai bentuk
                penghargaan atas segala dedikasi Bapak.
            </p>

            <!-- Appreciation Notes: Supabase Render -->
            <div
                data-list="notes"
                class="flex flex-wrap gap-5"
            ></div>

        </section>

        <!-- Back to Homepage -->
        <section class="mx-auto max-w-[1120px] px-4 pb-6 pt-12 text-center sm:px-6 sm:pt-[72px]">

            <h2 class="reveal hl mb-3 font-display text-[clamp(24px,5vw,32px)] leading-[1.15]">
                Kenali Kelas Kami Lebih Dekat
            </h2>

            <p class="mb-6 text-mute">
                Masih banyak cerita, kebersamaan, dan perjalanan
                menarik dari keluarga besar CoDevEnger.
            </p>

            <a href="index.php" class="btn inline-block rounded-lg bg-brand px-8 py-3.5 font-semibold text-white no-underline">
                Kembali ke Beranda
            </a>
        </section>
    </main>
    <!-- Footer -->
    <div data-slot="footer"></div>

    <!-- Supabase -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

    <!-- Application Configuration -->
    <script src="assets/js/config.js" onerror="void 0"></script>

    <!-- Application Scripts -->
    <script src="assets/js/supabase-client.js"></script>
    <script src="assets/js/data.js"></script>
    <script src="assets/js/api.js"></script>
    <script src="assets/js/components.js"></script>
    <script src="assets/js/render.js"></script>
    <script src="assets/js/effects.js"></script>
    <script src="assets/js/main.js"></script>

</body>
</html>
