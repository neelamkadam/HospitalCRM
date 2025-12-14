import { Collapsible } from "../ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";
import { Link, useLocation } from "react-router-dom";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: any;
    items?: { title: string; url: string }[];
  }[];
}) {
  const location = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleClick = () => {
    if (isMobile) {
      setOpenMobile(false); // 👈 closes the drawer instantly
    }
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items?.map((item) => {
          const isActive =
            (item.url === "/" && location.pathname === "/") ||
            (item.url !== "/" &&
              location.pathname?.startsWith(item.url?.split("?")[0]));

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem
                // className={`${
                //   isActive
                //     ? "bg-[#EEEFF0] !hover:bg-[#EEEFF0]"
                //     : "hover:bg-gray-100"
                // } px-4 py-2 rounded-lg text-gray-700`}
                className={`${
                  isActive ? "bg-[#d4e3fd] border-none" : "hover:bg-[#e8eff6]"
                } px-4 py-1 rounded-e-full font-medium text-gray-700`}
              >
                <SidebarMenuButton
                  asChild
                  // className={`${
                  //   isActive
                  //     ? "!bg-[#EEEFF0] !hover:bg-[#EEEFF0]"
                  //     : "!hover:bg-gray-100"
                  // }`}
                  className={`${
                    isActive
                      ? "!bg-[#d4e3fd] text-[#3062d6]"
                      : "hover:!bg-[#e8eff6]"
                  }`}
                  tooltip={item.title}
                >
                  <Link to={item.url} onClick={handleClick}>
                    {item.icon && (
                      <img
                        src={item.icon}
                        alt=""
                        sizes="25"
                        className={isActive ? "brightness-0 saturate-100" : ""}
                        style={
                          isActive
                            ? {
                                filter:
                                  "invert(25%) sepia(85%) saturate(2500%) hue-rotate(215deg) brightness(95%) contrast(95%)",
                              }
                            : {}
                        }
                      />
                    )}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
