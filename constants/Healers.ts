import { Healer } from "@/types";

export const healers: Healer[] = [
  {
    id: "1",
    name: "Earth Star Medicine",
    healerName: "Lara Alexander",
    about: "Lara Alexander is a healer specializing in Light Code Embodiment, Light Transmission, and Soul Reading. Lara's approach combines ancient wisdom with modern techniques to help individuals connect with their higher selves and achieve emotional and spiritual balance.",
    bio: "She has over 10 years of experience in energy healing and spiritual guidance. ",
    profileImage: require('@/assets/images/earthStarMedicine.jpg'),
    contacts: {
      email: "earthstarmedicine@gmail.com",
      phone: "+62 812-3456-7890",
      whatsapp: "https://wa.me/6281234567890",
      telegram: "https://t.me/earthstarmedicine",
      website: "https://earthstarmedicine.co.za",
    },
    socialMedia: {
      instagram: "https://instagram.com/earthstarmedicine",
      youtube: "https://youtube.com/earthstarmedicine",
      tiktok: "https://tiktok.com/@earthstarmedicine",
      pinterest: "https://pinterest.com/earthstarmedicine",
      facebook: "https://facebook.com/EarthStarMedicine",
      twitter: "https://twitter.com/earthstarmedicine",
      linkedin: "https://linkedin.com/in/earthstarmedicine",
    },
    address: "Jl. Sugriwa No.46, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    latitude: -8.511541,
    longitude: 115.265363,
    offeredServices: [{
      id: "1",
      name: "Light Code Embodiment",
      icon: "sparkles-outline",
      iconSet: "Ionicons",
    }, {
      id: "2",
      name: "Light Transmission",
      icon: "sparkles-outline",
      iconSet: "Ionicons",
    },
    {
      id: "3",
      name: "Soul reading",
      icon: "sparkles-outline",
      iconSet: "Ionicons",
    },],
    services: [
      {
        id: "1",
        name: "Light Code Embodiment Session",
        description: "A transformative session that helps you embody your light codes and connect with your higher self.",
        price: 150,
        duration: "60 minutes",
      },
      {
        id: "2",
        name: "Light Transmission Healing",
        description: "A healing session that uses light transmission to clear blockages and enhance your energy flow.",
        price: 120,
        duration: "45 minutes"
      },
    ],
    categories: ["Light Codes", "Energy Healing", "Spiritual Guidance"]
  },
  {
    id: "2",
    name: "Quantum Leap",
    healerName: "Gina Smith",
    address: "Banjar Kealusa, Keliki, Kec. Tegallalang, Kabupaten Gianyar, Bali 80571",
    latitude: -8.518997,
    longitude: 115.271624,
    contacts: {
      email: "earthstarmedicine@gmail.com",
      phone: "+62 812-3456-7890",
      whatsapp: "https://wa.me/6281234567890",
      telegram: "https://t.me/earthstarmedicine",
      website: "https://earthstarmedicine.com",
    },
    offeredServices: [{
      id: "1",
      name: "Quantum Leap",
      icon: "sparkles-outline",
      iconSet: "Ionicons",
    }, {
      id: "2",
      name: "Quantum Jumping",
      icon: "sparkles-outline",
      iconSet: "Ionicons",
    },
    {
      id: "3",
      name: "Quantum Manifestation",
      icon: "sparkles-outline",
      iconSet: "Ionicons",
    },],
    categories: ["Quantum Healing"]
  },
  {
    id: "3",
    name: "Reiki Healing & Reiki Training",
    healerName: "Lia",
    address: "G76C+FRG, Jl. Subak Uma Petulu Lebah, Petulu, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    latitude: -8.484262634398902,
    longitude: 115.27285675285721,
    offeredServices: [{
      id: "1",
      name: "Usui Reiki",
      icon: "sparkles-outline",
      iconSet: "Ionicons",
    }, {
      id: "2",
      name: "Karuna Reiki",
      icon: "sparkles-outline",
      iconSet: "Ionicons",
    },
    {
      id: "3",
      name: "Tibetan Reiki",
      icon: "sparkles-outline",
      iconSet: "Ionicons",
    }],
    categories: ["Reiki"]
  },
  {
    id: "4",
    name: "Yoga Dharma Swasthi",
    healerName: "",
    address: "Jl. Tegal Sari, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    latitude: -8.508849,
    longitude: 115.2676693,
    offeredServices: [{
      id: "1",
      name: "Hatha Yoga",
      icon: "sparkles-outline",
      iconSet: "Ionicons",
    }, {
      id: "2",
      name: "Vinyasa Yoga",
      icon: "sparkles-outline",
      iconSet: "Ionicons",
    },
    {
      id: "3",
      name: "Ashtanga Yoga",
      icon: "sparkles-outline",
      iconSet: "Ionicons",
    }],
    categories: ["Yoga"]
  },
  {
    id: "5",
    name: "Ubud Healing Center",
    healerName: "Ketut Liyer",
    address: "Jl. Raya Goa Gajah, Bedulu, Kec. Blahbatuh, Kabupaten Gianyar, Bali 80581",
    latitude: -8.522627,
    longitude: 115.288256,
    offeredServices: [{
      id: "1",
      name: "Traditional Balinese Healing",
      icon: "sparkles-outline",
      iconSet: "Ionicons",
    }, {
      id: "2",
      name: "Palmistry",
      icon: "sparkles-outline",
      iconSet: "Ionicons",
    },
    ],
    categories: ["Palmistry", "Traditional Healing", "Nutrition"]
  },
  {
    id: "6",
    name: "Chakra Balancing Bali",
    healerName: "Made Ayu",
    address: "Jl. Nyuh Bojog No.2, Mas, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    latitude: -8.5218353,
    longitude: 115.2569949,
    offeredServices: [],
    categories: ["Yoga"]
  },
  {
    id: "7",
    name: "Bali Wellness Retreat",
    healerName: "Wayan Sudiarta",
    address: "Jl. Pendakian Gn. Batur, Batur Tengah, Kec. Kintamani, Kabupaten Bangli, Bali 80652",
    latitude: -8.246088658701753,
    longitude: 115.3962315151163,
    offeredServices: [{
      id: "1",
      name: "Light Code Embodiment",
      icon: "sparkles-outline",
      iconSet: "Ionicons",
    }, {
      id: "2",
      name: "Light Transmission",
      icon: "sparkles-outline",
      iconSet: "Ionicons",
    }],
    categories: ["Light Codes"]
  },
  {
    id: "8",
    name: "Bali Healing Retreat",
    healerName: "Ketut Sudiarta",
    address: "Jl. Raya Ubud No.10, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571",
    latitude: undefined,
    longitude: undefined,
    offeredServices: [{
      id: "1",
      name: "Light Code Embodiment",
      icon: "sparkles-outline",
      iconSet: "Ionicons",
    }, {
      id: "2",
      name: "Light Transmission",
      icon: "sparkles-outline",
      iconSet: "Ionicons",
    }],
    categories: ["Light Codes"]
  },
];