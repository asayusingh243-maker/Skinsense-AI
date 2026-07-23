const testimonials = [
  {
    name: "Priya Sharma",
    role: "College Student",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    review:
      "SkinSense AI helped me understand my skin type and build a simple skincare routine. My skin has never felt better!",
  },
  {
    name: "Rahul Verma",
    role: "Software Engineer",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    review:
      "The budget-based recommendations were exactly what I needed. The AI analysis is fast, simple, and surprisingly accurate.",
  },
  {
    name: "Ananya Gupta",
    role: "Content Creator",
    image: "https://randomuser.me/api/portraits/women/45.jpg",
    review:
      "I love the weather-based skincare suggestions. It feels like having a personal skincare consultant in my pocket.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">

        {/* Heading */}
        <h2 className="text-4xl font-bold text-center text-pink-700 mb-4">
          What Our Users Say
        </h2>

        <p className="text-center text-gray-600 mb-16">
          Trusted by thousands of users for personalized skincare recommendations.
        </p>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {testimonials.map((user, index) => (
            <div
              key={index}
              className="bg-pink-50 rounded-3xl p-8 shadow-lg hover:-translate-y-2 hover:shadow-pink-300 hover:shadow-2xl transition-all duration-300"
            >
              {/* Profile */}
              <div className="flex justify-center mb-5">
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-20 h-20 rounded-full border-4 border-pink-200 object-cover"
                />
              </div>

              {/* Stars */}
              <div className="text-center text-yellow-400 text-xl mb-4">
                ⭐⭐⭐⭐⭐
              </div>

              {/* Review */}
             <p className="text-gray-600 text-center italic leading-7">
                 &ldquo;{user.review}&rdquo;
                 </p>

              {/* User Info */}
              <div className="mt-6 text-center">
                <h3 className="text-xl font-semibold text-gray-800">
                  {user.name}
                </h3>

                <p className="text-pink-600">
                  {user.role}
                </p>
              </div>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}