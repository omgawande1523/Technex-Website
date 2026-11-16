import type { Sponsor } from "@/types/sponsor";

export const titleSponsor: Sponsor = {
  id: 'title-sponsor',
  name: 'Federal Bank',
  logo: '/sponsors/federal-bank.webp',
};

export const expoSponsors: Sponsor[] = [
  {
    id: 'expo-audi',
    name: 'Audi',
    logo: '/sponsors/audi.svg',
    onDark: true,
  },
  {
    id: 'expo-skoda',
    name: 'Škoda',
    logo: '/sponsors/skoda.png',
    onDark: true,
  },
  {
    id: 'expo-hyundai',
    name: 'Hyundai',
    logo: '/sponsors/hyundai.webp',
  },
  {
    id: 'expo-toyota',
    name: 'Toyota',
    logo: '/sponsors/toyota.webp',
  },
  {
    id: 'expo-nexa',
    name: 'NEXA',
    logo: '/sponsors/nexa.webp',
  },
  {
    id: 'expo-mg',
    name: 'MG',
    logo: '/sponsors/mg.png',
    onDark: true,
  },
];

export const educationSponsors: Sponsor[] = [
  {
    id: 'edu-mahindra',
    name: 'Mahindra',
    logo: '/sponsors/mahindra.webp',
  },
  {
    id: 'edu-cad-desk',
    name: 'CAD Desk',
    logo: '/sponsors/cad-desk.webp',
  },
  {
    id: 'edu-shah-overseas',
    name: 'Shah Overseas',
    logo: '/sponsors/shah-overseas.webp',
  },
];

export const gamingSponsors: Sponsor[] = [
  {
    id: 'gaming-idp',
    name: 'IDP',
    logo: '/sponsors/idp.webp',
  },
];

export const foodSponsors: Sponsor[] = [
  {
    id: 'food-krafton',
    name: 'Krafton',
    logo: '/sponsors/krafton.webp',
  },
  {
    id: 'food-waflatte',
    name: 'Waflatte',
    logo: '/sponsors/waflatte.webp',
  },
];
