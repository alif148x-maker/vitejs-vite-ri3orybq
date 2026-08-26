import imgPlanSilver from "../assets/products/plan-silver.jpg";
import imgPlanSilverFrosted from "../assets/products/plan-silver-frosted.jpg";
import imgPlanGold from "../assets/products/plan-gold.jpg";
import imgPlanDeluxe from "../assets/products/plan-deluxe.jpg";
import imgPupcake from "../assets/products/pupcake.jpg";
import imgMiniCakeNaked from "../assets/products/mini-cake-naked.jpg";
import imgMiniCakeFrosted from "../assets/products/mini-cake-frosted.jpg";
import imgFrostedCake4 from "../assets/products/frosted-cake-4.jpg";
import imgBoneCake from "../assets/products/bone-cake.jpg";
import imgMiniPupcakes from "../assets/products/mini-pupcakes.jpg";
import imgDoggieTreats from "../assets/products/doggie-treats.jpg";
import imgDoggieTreatsSky from "../assets/products/doggie-treats-sky.jpg";
import imgCanastita from "../assets/products/canastita.jpg";
import imgBanderines from "../assets/products/banderines.jpg";
import imgGorritoTallas from "../assets/products/gorrito-tallas.jpg";
import imgGorritoHat from "../assets/products/gorrito-hat.jpg";
import imgPromoSeptiembre from "../assets/products/promo-septiembre.jpg";
import imgNakedStyle4 from "../assets/products/naked-style-4-3capas.jpg";
import imgGatoMiniPupcake1 from "../assets/products/gato-mini-pupcake-1.jpg";
import imgGatoMiniPupcake2 from "../assets/products/gato-mini-pupcake-2.jpg";

export type Category = "planes" | "cakes" | "pupcakes" | "decor" | "treats" | "promo" | "gatos";

export interface Variant {
  id: string;
  label: string;
  price: number;
}

export interface Extra {
  id: string;
  label: string;
  price: number;
}

export interface Choice {
  label: string;
  options: string[];
}

export interface Product {
  id: string;
  category: Category;
  name: string;
  tagline?: string;
  bullets?: string[];
  price?: number;
  priceNote?: string;
  variants?: Variant[];
  extras?: Extra[];
  hasFlavor?: boolean;
  flavorOptions?: string[];
  hasColor?: boolean;
  hasShape?: boolean;
  hasNote?: boolean;
  quoteOnly?: boolean;
  choice?: Choice;
  images?: string[];
  note?: string;
}

export const FLAVORS = [
  "Banana + Peanut Butter",
  "Zanahoria + Peanut Butter",
  "Peanut Butter",
  "Manzana + Peanut Butter",
];

export const CAT_FLAVORS = ["Pollo", "Atún"];

export const CAKE_COLORS = [
  { name: "Blanco", hex: "#FBF7EE" },
  { name: "Rosado claro (remolacha)", hex: "#F3C9C2" },
  { name: "Lila (arándano)", hex: "#D6C3E0" },
  { name: "Naranja (zanahoria y camote)", hex: "#E7A45C" },
  { name: "Verde (espirulina)", hex: "#A9C08C" },
];

export const VEGETABLE_COLORS = [
  { name: "Rojo", hex: "#F54A5A" },
  { name: "Azul", hex: "#336AC4" },
  { name: "Celeste", hex: "#A6D3EA" },
  { name: "Amarillo", hex: "#FAD03C" },
];

export const SHAPES = ["Hueso", "Paw"];

export const PLANS: Product[] = [
  {
    id: "plan-silver",
    category: "planes",
    name: "Barki Silver",
    price: 45,
    images: [imgPlanSilver, imgPlanSilverFrosted],
    bullets: [
      'Cake "4" 2 capas (6 porciones grandes)',
      "Incluye 3 toppers personalizados",
      "Banderines personalizados",
      "Gorrito personalizado",
      "Delivery incluido",
    ],
    choice: { label: "Tipo de mini cake", options: ["Mini Naked Style", "Mini Frosted Cake"] },
    hasFlavor: true,
    hasColor: true,
  },
  {
    id: "plan-gold",
    category: "planes",
    name: "Barki Gold",
    price: 55,
    images: [imgPlanGold],
    bullets: [
      'Cake "4" 3 capas (12 porciones)',
      "Incluye 3 toppers personalizados",
      "Banderines personalizados",
      "Gorrito personalizado",
      "Delivery incluido",
    ],
    hasFlavor: true,
    hasColor: true,
  },
  {
    id: "plan-deluxe",
    category: "planes",
    name: "Barki Deluxe",
    price: 70,
    images: [imgPlanDeluxe],
    tagline: "El más popular",
    bullets: [
      'Cake "7" en forma de hueso, 2 capas (12-16 porciones)',
      "Incluye 3 toppers personalizados",
      "Banderines personalizados",
      "Gorrito personalizado",
      "6 cupcakes",
      "Delivery incluido",
    ],
    hasFlavor: true,
    hasColor: true,
  },
];

export const CATALOG: Product[] = [
  {
    id: "pupcake",
    category: "pupcakes",
    name: "Pupcake",
    tagline: "4 porciones pequeñas",
    price: 15,
    images: [imgPupcake],
    bullets: ["Incluye 2 toppers", "Mini galleta con el nombre de tu mascota"],
    hasFlavor: true,
    hasColor: true,
  },
  {
    id: "mini-cake-naked",
    category: "cakes",
    name: 'Mini Cake "4" — Naked Style',
    tagline: "2 capas · aprox. 6 porciones grandes",
    price: 25,
    images: [imgMiniCakeNaked],
    bullets: ["Toppers personalizados", "Galleta personalizada con el nombre de tu mascota"],
    extras: [{ id: "frosted", label: "Cambiar a frosted", price: 5 }],
    hasFlavor: true,
    hasColor: true,
  },
  {
    id: "naked-style-4-3capas",
    category: "cakes",
    name: '(Nuevo) Naked Style "4" — 3 capas',
    tagline: "3 capas · incluye toppers",
    price: 35,
    images: [imgNakedStyle4],
    bullets: ["Incluye toppers", "Galleta personalizada con el nombre de tu mascota"],
    hasFlavor: true,
    hasColor: true,
  },
  {
    id: "mini-cake-frosted",
    category: "cakes",
    name: 'Mini Cake "4" — Frosted',
    tagline: "2 capas · aprox. 6 porciones grandes",
    price: 30,
    images: [imgMiniCakeFrosted],
    bullets: ["Nombre o frase escrita en frosting o toppers personalizados"],
    hasFlavor: true,
    hasColor: true,
  },
  {
    id: "frosted-cake-4",
    category: "cakes",
    name: 'Frosted Cake "4"',
    tagline: "3 capas · aprox. 12 porciones",
    price: 40,
    images: [imgFrostedCake4],
    bullets: ["Incluye toppers"],
    hasFlavor: true,
    hasColor: true,
  },
  {
    id: "bone-cake",
    category: "cakes",
    name: "Bone Cake",
    tagline: "2 capas · aprox. 12-16 porciones",
    price: 40,
    images: [imgBoneCake],
    bullets: ["Toppers personalizados", "Galleta personalizada con el nombre de tu mascota"],
    hasFlavor: true,
    hasColor: true,
  },
  {
    id: "mini-pupcakes",
    category: "pupcakes",
    name: "Mini Pupcakes",
    tagline: "Decorados con el nombre de tu mascota",
    images: [imgMiniPupcakes],
    variants: [
      { id: "x6", label: "6 mini cupcakes", price: 15 },
      { id: "x12", label: "12 mini cupcakes", price: 25 },
      { id: "x24", label: "24 mini cupcakes", price: 45 },
    ],
    hasFlavor: true,
    hasColor: true,
    note: "¿Necesitas otra cantidad? Cotiza tu set por WhatsApp.",
  },
  {
    id: "doggie-treats",
    category: "treats",
    name: "Doggie Treats",
    tagline: "Galletas horneadas, personalizadas con el nombre de tu mascota",
    images: [imgDoggieTreats, imgDoggieTreatsSky],
    variants: [
      { id: "mini12", label: "12 treats mini", price: 10 },
      { id: "grande12", label: "12 treats grande", price: 12 },
    ],
    hasShape: true,
    note: "¿Necesitas otra cantidad? Cotiza tu set por WhatsApp.",
  },
  {
    id: "canastita",
    category: "treats",
    name: "Canastita personalizada",
    tagline: "Incluye 1 galleta con el nombre de tu mascota + 1 pelota",
    price: 4.75,
    images: [imgCanastita],
    priceNote: "c/u",
    note: "¿Quieres un set completo? Cotiza por WhatsApp.",
  },
  {
    id: "banderines",
    category: "decor",
    name: "Banderines personalizados",
    price: 8,
    images: [imgBanderines],
  },
  {
    id: "gorrito",
    category: "decor",
    name: "Gorrito personalizado",
    price: 2.75,
    images: [imgGorritoTallas, imgGorritoHat],
    choice: { label: "Talla", options: ["XS", "S", "L"] },
  },
  {
    id: "gato-mini-pupcake",
    category: "gatos",
    name: "Mini Pupcake para gatos",
    tagline: "Tamaño aproximado",
    price: 8,
    images: [imgGatoMiniPupcake2, imgGatoMiniPupcake1],
    bullets: ["Ingredientes: comida de gato, huevo y harina de avena", "Frosting: queso crema y Catit creamy"],
    hasFlavor: true,
    flavorOptions: CAT_FLAVORS,
  },
];

export const PROMO: Product = {
  id: "promo-septiembre",
  category: "promo",
  name: "Promo Septiembre",
  tagline: "Promo del mes",
  price: 30,
  images: [imgPromoSeptiembre],
  bullets: ["Mini Frosted Cake personalizado", "Banderines incluidos"],
  hasFlavor: true,
  hasColor: true,
};

export const CUSTOM_QUOTE: Product = {
  id: "cotiza-tu-cake",
  category: "cakes",
  name: "Cotiza tu cake",
  tagline: "Diseño personalizado",
  priceNote: "Se cotiza según diseño",
  quoteOnly: true,
  bullets: ["Cuéntanos la forma o diseño que imaginas para tu peludito", "Te confirmamos el precio por WhatsApp"],
  hasNote: true,
};

export interface DeliveryTier {
  price: number;
  zones: string[];
}

export const DELIVERY_FREE_ZONES = ["Coco del Mar", "San Francisco"];

export const DELIVERY_TIERS: DeliveryTier[] = [
  {
    price: 3.5,
    zones: ["Vía Porras", "Marbella", "Obarrio", "Punta Pacífica", "Paitilla", "Bella Vista"],
  },
  {
    price: 5,
    zones: [
      "Vía España",
      "El Cangrejo",
      "El Carmen",
      "Río Abajo",
      "Parque Lefevre",
      "Bethania",
      "Transístmica",
      "El Dorado",
      "Tumba Muerto",
      "Costa del Este",
    ],
  },
  {
    price: 8,
    zones: ["Casco Viejo", "Santa Ana", "Avenida Central", "5 de Mayo", "Calidonia", "Ancón"],
  },
  {
    price: 10,
    zones: ["Brisas del Golf", "Villa Lucre", "San Antonio", "Costa Sur", "Clayton", "Ciudad del Saber", "Las Cumbres"],
  },
];

export const ORDER_STEPS = [
  {
    step: 1,
    title: "Datos de la mascota",
    items: [
      "Nombre del peludito(a)",
      "Edad que va a cumplir",
      "Foto del cumpleañero(a) para las decoraciones",
      "Preferencias o alergias",
      "Elige 2 colores para las decoraciones",
    ],
  },
  {
    step: 2,
    title: "Datos del pedido",
    items: [
      "Fecha en que lo desea",
      "Hora de entrega",
      "Plan que elige",
      "Temática de la fiesta",
      "Colores para el cake",
      "Sabor del cake",
      "Elige qué tipo de toppers",
    ],
  },
  {
    step: 3,
    title: "Confirmación",
    items: ["Pedidos con 4 días de anticipación"],
  },
];
