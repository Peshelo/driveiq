"use client";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toggle } from "@/components/ui/toggle";
import { ModeToggle } from "../../components/toggle-theme";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const [path, setPath] = useState([]);
  const pathArray = pathname.split("/").filter((item) => item !== "");
  // alert(pathname);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 flex-row justify-between px-4 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 ">
            <SidebarTrigger className="-ml-1" />

            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList className="hidden md:flex items-center gap-2">
                {pathArray.map((item, index) => {
                  const isLast = index === pathArray.length - 1;
                  const href = `/${pathArray.slice(0, index + 1).join("/")}`;
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href={href} className={`${
                          isLast ? "text-muted-foreground" : "text-foreground"}`}>
                          {item.charAt(0).toUpperCase() + item.slice(1)}{" "}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      {!isLast && <BreadcrumbSeparator />}
                    </div>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <ModeToggle />

        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
