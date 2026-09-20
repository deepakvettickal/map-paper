/** Places the randomiser draws from: cities with water, parks or a strong street grid. */
export interface Place {
  center: [number, number];
  zoom: number;
  title: string;
  subtitle: string;
}

export const PLACES: Place[] = [
  { center: [4.8952, 52.3702], zoom: 14.4, title: "Amsterdam", subtitle: "Netherlands" },
  { center: [2.3499, 48.855], zoom: 14.4, title: "Paris", subtitle: "France" },
  { center: [12.3390, 45.4340], zoom: 14.6, title: "Venice", subtitle: "Italy" },
  { center: [-0.1200, 51.5080], zoom: 14.0, title: "London", subtitle: "United Kingdom" },
  { center: [13.3900, 52.5120], zoom: 13.8, title: "Berlin", subtitle: "Germany" },
  { center: [-3.7038, 40.4168], zoom: 14.2, title: "Madrid", subtitle: "Spain" },
  { center: [2.1770, 41.3930], zoom: 14.6, title: "Barcelona", subtitle: "Spain" },
  { center: [-9.1400, 38.7120], zoom: 14.4, title: "Lisbon", subtitle: "Portugal" },
  { center: [12.5900, 55.6800], zoom: 14.2, title: "Copenhagen", subtitle: "Denmark" },
  { center: [18.0700, 59.3250], zoom: 13.8, title: "Stockholm", subtitle: "Sweden" },
  { center: [24.9400, 60.1680], zoom: 14.0, title: "Helsinki", subtitle: "Finland" },
  { center: [-21.9350, 64.1460], zoom: 14.0, title: "Reykjavík", subtitle: "Iceland" },
  { center: [30.3250, 59.9350], zoom: 13.6, title: "Saint Petersburg", subtitle: "Russia" },
  { center: [28.9784, 41.0255], zoom: 13.8, title: "Istanbul", subtitle: "Türkiye" },
  { center: [23.7275, 37.9838], zoom: 14.2, title: "Athens", subtitle: "Greece" },
  { center: [14.4200, 50.0870], zoom: 14.4, title: "Prague", subtitle: "Czechia" },
  { center: [16.3730, 48.2080], zoom: 14.2, title: "Vienna", subtitle: "Austria" },
  { center: [8.5417, 47.3769], zoom: 14.4, title: "Zürich", subtitle: "Switzerland" },
  { center: [-73.9855, 40.7580], zoom: 14.0, title: "New York", subtitle: "United States" },
  { center: [-122.4194, 37.7749], zoom: 13.8, title: "San Francisco", subtitle: "United States" },
  { center: [-87.6298, 41.8850], zoom: 14.0, title: "Chicago", subtitle: "United States" },
  { center: [-71.0589, 42.3601], zoom: 14.2, title: "Boston", subtitle: "United States" },
  { center: [-79.3832, 43.6532], zoom: 14.0, title: "Toronto", subtitle: "Canada" },
  { center: [-99.1667, 19.4270], zoom: 14.2, title: "Mexico City", subtitle: "Mexico" },
  { center: [-43.1800, -22.9100], zoom: 13.8, title: "Rio de Janeiro", subtitle: "Brazil" },
  { center: [-58.3816, -34.6037], zoom: 13.8, title: "Buenos Aires", subtitle: "Argentina" },
  { center: [-70.6483, -33.4372], zoom: 14.0, title: "Santiago", subtitle: "Chile" },
  { center: [139.7966, 35.7120], zoom: 14.2, title: "Tokyo", subtitle: "Japan" },
  { center: [135.7740, 35.0050], zoom: 14.4, title: "Kyoto", subtitle: "Japan" },
  { center: [126.9780, 37.5665], zoom: 13.8, title: "Seoul", subtitle: "South Korea" },
  { center: [114.1694, 22.3010], zoom: 14.0, title: "Hong Kong", subtitle: "China" },
  { center: [121.4737, 31.2304], zoom: 13.8, title: "Shanghai", subtitle: "China" },
  { center: [103.8630, 1.2830], zoom: 14.2, title: "Singapore", subtitle: "Singapore" },
  { center: [100.5018, 13.7563], zoom: 13.8, title: "Bangkok", subtitle: "Thailand" },
  { center: [76.2566, 9.9687], zoom: 13.8, title: "Kochi", subtitle: "India" },
  { center: [72.8300, 18.9300], zoom: 13.8, title: "Mumbai", subtitle: "India" },
  { center: [77.2100, 28.6100], zoom: 13.8, title: "Delhi", subtitle: "India" },
  { center: [55.2744, 25.1972], zoom: 13.6, title: "Dubai", subtitle: "United Arab Emirates" },
  { center: [31.2357, 30.0444], zoom: 14.0, title: "Cairo", subtitle: "Egypt" },
  { center: [18.4241, -33.9249], zoom: 13.8, title: "Cape Town", subtitle: "South Africa" },
  { center: [3.3792, 6.4550], zoom: 13.8, title: "Lagos", subtitle: "Nigeria" },
  { center: [151.2093, -33.8688], zoom: 14.0, title: "Sydney", subtitle: "Australia" },
  { center: [174.7633, -36.8485], zoom: 14.0, title: "Auckland", subtitle: "New Zealand" },
];
