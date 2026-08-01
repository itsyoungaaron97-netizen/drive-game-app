export interface Car {
  id: string;
  brand: string;
  model: string;
  years: string;
  category: string;
  country: string;
  model3D?: string;
}

export const cars: Car[] = [

  // Mercedes-Benz 🇩🇪
  {
    id: "mercedes-c-class-w205",
    brand: "Mercedes-Benz",
    model: "C-Class W205",
    years: "2014-2021",
    category: "Sedan",
    country: "Germany",
  },
  {
    id: "mercedes-e-class-w213",
    brand: "Mercedes-Benz",
    model: "E-Class W213",
    years: "2016-2023",
    category: "Sedan",
    country: "Germany",
  },
  {
    id: "mercedes-s-class-w223",
    brand: "Mercedes-Benz",
    model: "S-Class W223",
    years: "2020-present",
    category: "Luxury",
    country: "Germany",
  },
  {
    id: "mercedes-amg-gt",
    brand: "Mercedes-AMG",
    model: "AMG GT",
    years: "2015-present",
    category: "Sports",
    country: "Germany",
  },
  {
    id: "mercedes-g63-amg",
    brand: "Mercedes-AMG",
    model: "G63",
    years: "2018-present",
    category: "SUV",
    country: "Germany",
  },

  // BMW 🇩🇪
  {
    id: "bmw-3-series-g20",
    brand: "BMW",
    model: "3 Series G20",
    years: "2019-present",
    category: "Sedan",
    country: "Germany",
  },
  {
    id: "bmw-m3-g80",
    brand: "BMW",
    model: "M3 G80",
    years: "2021-present",
    category: "Sports",
    country: "Germany",
  },
  {
    id: "bmw-m4-g82",
    brand: "BMW",
    model: "M4 G82",
    years: "2021-present",
    category: "Sports",
    country: "Germany",
  },
  {
    id: "bmw-x5m",
    brand: "BMW",
    model: "X5 M",
    years: "2020-present",
    category: "SUV",
    country: "Germany",
  },

  // Audi 🇩🇪
  {
    id: "audi-a4",
    brand: "Audi",
    model: "A4",
    years: "2016-present",
    category: "Sedan",
    country: "Germany",
  },
  {
    id: "audi-rs3",
    brand: "Audi",
    model: "RS3",
    years: "2015-present",
    category: "Sports",
    country: "Germany",
  },
  {
    id: "audi-rs6",
    brand: "Audi",
    model: "RS6 Avant",
    years: "2019-present",
    category: "Wagon",
    country: "Germany",
  },

  // Japanese 🇯🇵
  {
    id: "toyota-supra-mk5",
    brand: "Toyota",
    model: "GR Supra MK5",
    years: "2019-present",
    category: "Sports",
    country: "Japan",
  },
  {
    id: "nissan-gtr-r35",
    brand: "Nissan",
    model: "GT-R R35",
    years: "2007-present",
    category: "Sports",
    country: "Japan",
  },
  {
    id: "honda-civic-type-r",
    brand: "Honda",
    model: "Civic Type R",
    years: "2017-present",
    category: "Sports",
    country: "Japan",
  },

  // American 🇺🇸
  {
    id: "ford-mustang-gt",
    brand: "Ford",
    model: "Mustang GT",
    years: "2015-present",
    category: "Sports",
    country: "USA",
  },
  {
    id: "ford-shelby-gt500",
    brand: "Ford",
    model: "Shelby GT500",
    years: "2020-present",
    category: "Muscle",
    country: "USA",
  },
  {
    id: "corvette-c8",
    brand: "Chevrolet",
    model: "Corvette C8",
    years: "2020-present",
    category: "Sports",
    country: "USA",
  },
  {
    id: "challenger-hellcat",
    brand: "Dodge",
    model: "Challenger Hellcat",
    years: "2015-present",
    category: "Muscle",
    country: "USA",
  },

  // Italian 🇮🇹
  {
    id: "ferrari-488",
    brand: "Ferrari",
    model: "488 GTB",
    years: "2015-2019",
    category: "Supercar",
    country: "Italy",
  },
  {
    id: "lamborghini-huracan",
    brand: "Lamborghini",
    model: "Huracán",
    years: "2014-present",
    category: "Supercar",
    country: "Italy",
  },
  {
    id: "alfa-giulia-q",
    brand: "Alfa Romeo",
    model: "Giulia Quadrifoglio",
    years: "2016-present",
    category: "Sports Sedan",
    country: "Italy",
  },

  // British 🇬🇧
  {
    id: "mclaren-720s",
    brand: "McLaren",
    model: "720S",
    years: "2017-present",
    category: "Supercar",
    country: "UK",
  },
  {
    id: "aston-db11",
    brand: "Aston Martin",
    model: "DB11",
    years: "2016-present",
    category: "Luxury Sports",
    country: "UK",
  },
];