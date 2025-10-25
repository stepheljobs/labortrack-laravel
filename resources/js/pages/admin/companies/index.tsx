import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    Building2,
    Eye,
    Plus,
    Search,
    ToggleLeft,
    ToggleRight,
    Users,
} from 'lucide-react';
import * as React from 'react';

interface Company {
    id: number;
    name: string;
    subdomain: string;
    email: string;
    plan: string;
    is_active: boolean;
    trial_ends_at: string | null;
    created_at: string;
    users_count: number;
    projects_count: number;
    labors_count: number;
}

interface Stats {
    total_companies: number;
    active_companies: number;
    trial_expired: number;
    total_users: number;
}

interface Props {
    companies: {
        data: Company[];
        links: any[];
        meta: any;
    };
    stats: Stats;
    filters: {
        search?: string;
        status?: string;
        plan?: string;
    };
}

export default function AdminCompaniesIndex({
    companies,
    stats,
    filters,
}: Props) {
    const [search, setSearch] = React.useState(filters.search || '');
    const [status, setStatus] = React.useState(filters.status || '');
    const [plan, setPlan] = React.useState(filters.plan || '');

    const handleSearch = (value: string) => {
        setSearch(value);
        updateFilters({ search: value, status, plan });
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        updateFilters({ search, status: value, plan });
    };

    const handlePlanChange = (value: string) => {
        setPlan(value);
        updateFilters({ search, status, plan: value });
    };

    const updateFilters = (newFilters: any) => {
        const params = new URLSearchParams(window.location.search);

        Object.entries(newFilters).forEach(([key, value]) => {
            if (value) {
                params.set(key, value as string);
            } else {
                params.delete(key);
            }
        });

        router.get(
            `${window.location.pathname}?${params.toString()}`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const toggleCompanyStatus = (company: Company) => {
        router.post(
            `/admin/companies/${company.id}/toggle`,
            {},
            {
                onSuccess: () => {
                    // Show success message via flash session
                },
            },
        );
    };

    const getPlanBadgeVariant = (plan: string) => {
        switch (plan) {
            case 'starter':
                return 'secondary';
            case 'professional':
                return 'default';
            case 'enterprise':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const getTrialStatus = (trialEndsAt: string | null) => {
        if (!trialEndsAt) return null;

        const trialEnd = new Date(trialEndsAt);
        const now = new Date();
        const daysLeft = Math.ceil(
            (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (daysLeft < 0) {
            return { text: 'Expired', variant: 'destructive' as const };
        } else if (daysLeft <= 7) {
            return {
                text: `${daysLeft} days left`,
                variant: 'destructive' as const,
            };
        } else if (daysLeft <= 30) {
            return {
                text: `${daysLeft} days left`,
                variant: 'secondary' as const,
            };
        } else {
            return {
                text: `${daysLeft} days left`,
                variant: 'default' as const,
            };
        }
    };

    return (
        <AppLayout>
            <Head title="Companies - Admin" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Companies</h1>
                        <p className="text-muted-foreground">
                            Manage all companies in the system
                        </p>
                    </div>
                    <Link href="/admin/companies/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Company
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Companies
                            </CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_companies}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Companies
                            </CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.active_companies}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Trial Expired
                            </CardTitle>
                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.trial_expired}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Users
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_users}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search companies..."
                                    value={search}
                                    onChange={(e) =>
                                        handleSearch(e.target.value)
                                    }
                                    className="pl-10"
                                />
                            </div>
                            <Select
                                value={status}
                                onValueChange={handleStatusChange}
                            >
                                <SelectTrigger className="w-full sm:w-48">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Status</SelectItem>
                                    <SelectItem value="active">
                                        Active
                                    </SelectItem>
                                    <SelectItem value="trial_expired">
                                        Trial Expired
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={plan}
                                onValueChange={handlePlanChange}
                            >
                                <SelectTrigger className="w-full sm:w-48">
                                    <SelectValue placeholder="Plan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Plans</SelectItem>
                                    <SelectItem value="starter">
                                        Starter
                                    </SelectItem>
                                    <SelectItem value="professional">
                                        Professional
                                    </SelectItem>
                                    <SelectItem value="enterprise">
                                        Enterprise
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Companies Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Companies ({companies.meta.total})
                        </CardTitle>
                        <CardDescription>
                            A list of all companies in the system
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-4 text-left font-medium">
                                            Company
                                        </th>
                                        <th className="p-4 text-left font-medium">
                                            Plan
                                        </th>
                                        <th className="p-4 text-left font-medium">
                                            Status
                                        </th>
                                        <th className="p-4 text-left font-medium">
                                            Users
                                        </th>
                                        <th className="p-4 text-left font-medium">
                                            Projects
                                        </th>
                                        <th className="p-4 text-left font-medium">
                                            Labors
                                        </th>
                                        <th className="p-4 text-left font-medium">
                                            Created
                                        </th>
                                        <th className="p-4 text-left font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {companies.data.map((company) => {
                                        const trialStatus = getTrialStatus(
                                            company.trial_ends_at,
                                        );
                                        return (
                                            <tr
                                                key={company.id}
                                                className="border-b hover:bg-muted/50"
                                            >
                                                <td className="p-4">
                                                    <div>
                                                        <div className="font-medium">
                                                            {company.name}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {company.subdomain}
                                                            .labortrack.com
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {company.email}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <Badge
                                                        variant={getPlanBadgeVariant(
                                                            company.plan,
                                                        )}
                                                    >
                                                        {company.plan}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            {company.is_active ? (
                                                                <Badge variant="default">
                                                                    Active
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="secondary">
                                                                    Inactive
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {trialStatus && (
                                                            <Badge
                                                                variant={
                                                                    trialStatus.variant
                                                                }
                                                                className="text-xs"
                                                            >
                                                                {
                                                                    trialStatus.text
                                                                }
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1">
                                                        <Users className="h-4 w-4 text-muted-foreground" />
                                                        {company.users_count}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {company.projects_count}
                                                </td>
                                                <td className="p-4">
                                                    {company.labors_count}
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm">
                                                        {new Date(
                                                            company.created_at,
                                                        ).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={`/admin/companies/${company.id}`}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                toggleCompanyStatus(
                                                                    company,
                                                                )
                                                            }
                                                            className={cn(
                                                                company.is_active &&
                                                                    'text-red-600 hover:text-red-700',
                                                            )}
                                                        >
                                                            {company.is_active ? (
                                                                <ToggleRight className="h-4 w-4" />
                                                            ) : (
                                                                <ToggleLeft className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {companies.links && companies.links.length > 3 && (
                            <div className="mt-4 flex justify-center">
                                <div className="flex gap-1">
                                    {companies.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={cn(
                                                'rounded px-3 py-2 text-sm',
                                                link.active
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted hover:bg-muted/80',
                                                !link.url &&
                                                    'cursor-not-allowed opacity-50',
                                            )}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
