/**
 * DelaneNails Website Content Database
 * This represents the ground truth content from the website for testing AI responses
 */

const websiteContent = {
  services: {
    manicure: {
      basic: {
        name: "Basic Manicure",
        price: "$25",
        duration: "30 minutes",
        description: "Our basic manicure includes nail shaping, cuticle care, hand massage, and polish application."
      },
      gel: {
        name: "Gel Manicure",
        price: "$35",
        duration: "45 minutes",
        description: "Long-lasting gel polish that dries instantly and stays chip-free for up to 2 weeks."
      },
      luxury: {
        name: "Luxury Manicure",
        price: "$45",
        duration: "60 minutes",
        description: "Premium treatment including exfoliation, hydrating mask, extended massage, and premium polish."
      }
    },
    pedicure: {
      basic: {
        name: "Basic Pedicure",
        price: "$35",
        duration: "45 minutes",
        description: "Includes foot soak, exfoliation, nail shaping, cuticle care, foot massage, and polish."
      },
      deluxe: {
        name: "Deluxe Pedicure",
        price: "$55",
        duration: "60 minutes",
        description: "Our signature pedicure with premium products, callus removal, extended massage, and polish."
      },
      paraffin: {
        name: "Paraffin Pedicure",
        price: "$65",
        duration: "75 minutes",
        description: "Includes paraffin wax treatment for deep moisturizing, excellent for dry skin."
      }
    },
    extensions: {
      acrylic: {
        name: "Acrylic Full Set",
        price: "$60",
        duration: "90 minutes",
        description: "Durable acrylic extensions customized to your preferred length and shape."
      },
      gel: {
        name: "Gel Extensions",
        price: "$70",
        duration: "90 minutes",
        description: "Lighter and more flexible than acrylic, with a natural appearance."
      },
      dip: {
        name: "Dip Powder",
        price: "$50",
        duration: "60 minutes",
        description: "Long-lasting alternative to gel with added strength and no UV light needed."
      }
    },
    nailArt: {
      simple: {
        name: "Simple Nail Art",
        price: "$5+ per nail",
        duration: "Varies",
        description: "Basic designs including French tips, ombre, glitter, or simple lines."
      },
      complex: {
        name: "Complex Nail Art",
        price: "$10+ per nail",
        duration: "Varies",
        description: "Detailed designs, hand-painted art, 3D elements, or rhinestone application."
      }
    }
  },
  
  products: {
    polishBrands: ["OPI", "Essie", "CND", "DND", "Morgan Taylor", "China Glaze"],
    homecare: [
      {
        name: "Deluxe Nail Care Kit",
        price: "$45",
        includes: "Cuticle oil, hand cream, nail file, buffer, and base/top coat"
      },
      {
        name: "Nail Strengthening System",
        price: "$30",
        includes: "Protein base coat, strengthener, and cuticle oil"
      }
    ],
    topSellers: {
      colors: ["Passionate Red", "Ballet Pink", "Midnight Blue", "Glitter Galaxy"],
      treatments: ["Cuticle Rescue Oil", "Intensive Hand Repair Cream"]
    },
    features: {
      crueltyfree: true,
      vegan: "Most products",
      organic: "Select products"
    }
  },
  
  booking: {
    methods: ["Online booking system", "Phone call", "Walk-in (subject to availability)"],
    hours: {
      monday: "10:00 AM - 7:00 PM",
      tuesday: "10:00 AM - 7:00 PM",
      wednesday: "10:00 AM - 7:00 PM",
      thursday: "10:00 AM - 8:00 PM",
      friday: "9:00 AM - 8:00 PM",
      saturday: "9:00 AM - 6:00 PM",
      sunday: "11:00 AM - 5:00 PM"
    },
    policies: {
      cancellation: "24-hour notice required to avoid a 50% charge",
      deposit: "Required for services over $50 or groups of 3+ people",
      lateArrival: "Services may be adjusted or rescheduled if arrival is more than 15 minutes late"
    }
  },
  
  about: {
    history: "DelaneNails was founded in 2015 by nail artist Delane Johnson with a mission to provide luxury nail services with an emphasis on health and hygiene.",
    location: "123 Beauty Boulevard, Cityville, State 12345",
    staff: {
      count: "12 certified nail technicians",
      training: "All technicians are licensed and receive ongoing education in the latest techniques"
    },
    safety: {
      sterilization: "Hospital-grade autoclave sterilization for all metal implements",
      singleUse: "Single-use files, buffers, and disposable items for each client",
      products: "High-quality, non-toxic products prioritizing client health"
    },
    values: ["Quality", "Cleanliness", "Creativity", "Customer care"]
  },
  
  news: {
    promotions: [
      {
        name: "Summer Special",
        description: "20% off all pedicure services through August",
        validUntil: "August 31, 2023"
      },
      {
        name: "Refer-a-Friend",
        description: "Receive $15 off your next service when you refer a new client"
      }
    ],
    events: [
      {
        name: "Nail Art Workshop",
        date: "July 15, 2023",
        description: "Learn basic nail art techniques you can do at home"
      }
    ],
    newServices: [
      {
        name: "Japanese Gel Art",
        description: "Newly introduced premium gel system for intricate designs",
        introductoryPrice: "$65"
      }
    ],
    seasonal: {
      current: "Summer Tropical Designs",
      upcoming: "Fall Collection launching September 1st"
    }
  }
};

module.exports = websiteContent;
