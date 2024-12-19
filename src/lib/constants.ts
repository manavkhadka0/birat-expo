import { UserIcon, UsersIcon, TicketIcon } from "@heroicons/react/24/outline";

export const PRICE_CONFIG = {
  "Single Person": {
    price: 300,
    participants: 1,
    icon: UserIcon,
    description: "Individual registration for one participant",
  },
  Group: {
    price: 1500,
    participants: 6,
    icon: UsersIcon,
    description: "Group registration with 5 paid participants plus 1 free",
  },
  "Expo Access": {
    price: 2100,
    participants: 1,
    icon: TicketIcon,
    description: "10 days expo access with training for one participant",
  },
};
