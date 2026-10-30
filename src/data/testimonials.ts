export interface Testimonial {
  id: number;
  name: string;
  city: string;
  rating: number;
  comment: string;
}

// Sample (fictional) customer reviews for the demo home page.
export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Priya S.",
    city: "Chennai",
    rating: 5,
    comment:
      "Ordered the magnetic tiles for my daughter's birthday. Great quality, lovely packaging and delivered in two days!",
  },
  {
    id: 2,
    name: "Rahul M.",
    city: "Pune",
    rating: 5,
    comment:
      "The RC car is a hit with my son. Prices are better than other stores and checkout was super simple.",
  },
  {
    id: 3,
    name: "Anita K.",
    city: "Bengaluru",
    rating: 4,
    comment:
      "Nice range of educational toys sorted by age. The product details helped me pick the right one quickly.",
  },
];
