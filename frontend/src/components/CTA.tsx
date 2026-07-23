import Link from "next/link";

export default function CTA() {
  return (
    <section className="bg-gradient-to-r from-pink-600 via-pink-500 to-purple-600 px-6 py-20 text-white">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-4xl font-extrabold leading-tight sm:text-5xl">
          Ready to Discover Your Best Skin?
        </h2>

        <p className="mx-auto mt-6 max-w-4xl text-lg leading-8 text-white/90 sm:text-xl">
          Let SkinSense AI analyze your skin, understand your concerns,
          recommend products within your budget, and build your personalized
          skincare routine in just a few seconds.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row">
          <Link
            href="/analyze"
            className="w-full rounded-xl bg-white px-9 py-4 text-center text-lg font-bold text-pink-600 shadow-lg transition hover:-translate-y-1 hover:shadow-xl sm:w-auto"
          >
            Get Started Free
          </Link>

          <Link
            href="#features"
            className="w-full rounded-xl border-2 border-white bg-white/95 px-9 py-4 text-center text-lg font-medium text-pink-600 shadow-lg transition hover:-translate-y-1 hover:bg-white sm:w-auto"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}