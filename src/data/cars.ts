export interface Car {
  id: string;
  brand: string;
  model: string;
  year: string;
  image: string;
  category: string;
}

export const cars: Car[] = [
  {
    id: "mercedes-c-class-w205",
    brand: "Mercedes-Benz",
    model: "C-Class W205",
    year: "2014-2021",
    image: "mercedes-c-class-w205",
    category: "Sedan",
  },

  {
    id: "mercedes-amg-gt",
    brand: "Mercedes-AMG",
    model: "AMG GT",
    year: "2015-present",
    image: "mercedes-amg-gt",
    category: "Sports",
  },

  {
    id: "bmw-m4-g82",
    brand: "BMW",
    model: "M4 G82",
    year: "2021-present",
    image: "bmw-m4-g82",
    category: "Sports",
  },

  {
    id: "audi-rs5",
    brand: "Audi",
    model: "RS5",
    year: "2017-present",
    image: "audi-rs5",
    category: "Sports",
  },

  {
    id: "porsche-911",
    brand: "Porsche",
    model: "911 Carrera",
    year: "2019-present",
    image: "porsche-911",
    category: "Sports",
  },
];