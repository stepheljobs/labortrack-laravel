import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, DollarSign, Folder, Users } from 'lucide-react';
import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { currentCompany } = usePage<SharedData>().props;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: currentCompany?.subdomain
                ? dashboard(currentCompany.subdomain).url
                : '#',
            icon: undefined, // Will be handled by NavMain
        },
    ];
    const projectNavItems: NavItem[] = [
        { title: 'Projects', href: '/projects', icon: Folder },
        { title: 'Employees', href: '/employees', icon: Users },
        { title: 'Supervisors', href: '/admin/supervisors', icon: Users },
        { title: 'Payroll', href: '/payroll', icon: DollarSign },
        { title: 'Reports', href: '/reports', icon: BookOpen },
    ];
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link
                                href={
                                    currentCompany?.subdomain
                                        ? dashboard(currentCompany.subdomain)
                                              .url
                                        : '#'
                                }
                                prefetch
                            >
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={[...mainNavItems, ...projectNavItems]} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
