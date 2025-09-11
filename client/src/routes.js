import React from "react";

// Admin Imports
import MainDashboard from "views/admin/default";
import NFTMarketplace from "views/admin/marketplace";
import Profile from "views/admin/profile";
import DataTables from "views/admin/tables";
import EncryptURL from "views/admin/encrypt-url";
import Reports from "views/admin/reports";
import AddCampaign from "views/admin/add-campaign";

// Icon Imports
import {
  MdHome,
  MdOutlineShoppingCart,
  MdBarChart,
  MdPerson,
  MdCampaign,
} from "react-icons/md";

import { FcDataConfiguration } from "react-icons/fc";
import { GrDocumentText } from "react-icons/gr";

const routes = [
  {
    name: "Main Dashboard",
    layout: "/admin",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <MainDashboard />,
  },
  {
    name: "Encrypt URL",
    layout: "/admin",
    path: "encrypt-url",
    icon: <FcDataConfiguration className="h-6 w-6" />,
    component: <EncryptURL />,
  },
  {
    name: "Reports",
    layout: "/admin",
    path: "reports",
    icon: <GrDocumentText className="h-6 w-6" />,
    component: <Reports />,
  },
  {
    name: "Add Campaign",
    layout: "/admin",
    path: "add-campaign",
    icon: <MdCampaign className="h-6 w-6" />,
    component: <AddCampaign />,
  },
  {
    name: "NFT Marketplace",
    layout: "/admin",
    path: "nft-marketplace",
    icon: <MdOutlineShoppingCart className="h-6 w-6" />,
    component: <NFTMarketplace />,
    secondary: true,
  },
  {
    name: "Data Tables",
    layout: "/admin",
    icon: <MdBarChart className="h-6 w-6" />,
    path: "data-tables",
    component: <DataTables />,
  },
  {
    name: "Profile",
    layout: "/admin",
    path: "profile",
    icon: <MdPerson className="h-6 w-6" />,
    component: <Profile />,
  },
  // {
  //   name: "RTL Admin",
  //   layout: "/rtl",
  //   path: "rtl",
  //   icon: <MdHome className="h-6 w-6" />,
  //   component: <RTLDefault />,
  // }
];
export default routes;
