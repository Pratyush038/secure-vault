import Icons from "@/components/global/icons";
import { SidebarConfig } from "@/components/global/app-sidebar";

const sidebarConfig: SidebarConfig = {
  brand: {
    title: "Secure Vault",
    icon: Icons.shield,
    href: "/"
  },
  sections: [
    {
      label: "Overview",
      items: [
        {
          title: "Home",
          href: "/",
          icon: Icons.home
        },
      ]
    },
    {
      label: "Vault",
      items: [
        {
          title: "File Vault",
          href: "/vault",
          icon: Icons.lock
        },
      ]
    },
  ]
}

export default sidebarConfig