export interface Car {
  id: string;
  brand: string;
  model: string;
  years: string;
  category: string;
  country: string;
  model3D?: string;
  image?: any;
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

    image: require("../../assets/W205-Mercedes-Benz-C-Class-facelift-22-e1518578842833.jpg"),
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


  // Keep all your other cars exactly the same below
];