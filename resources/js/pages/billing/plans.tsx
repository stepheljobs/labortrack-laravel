import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { changePlan as billingChangePlan } from '@/routes/billing';
import { Head, router } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    Check,
    Clock,
    DollarSign,
    FileText,
    HeadphonesIcon,
    Shield,
    Star,
    Users,
    X,
    Zap,
} from 'lucide-react';

interface Company {
    name: string;
    current_plan: string;
}

interface PlanOption {
    plan: {
        name: string;
        monthly_fee: number;
        user_limit: number | null;
        project_limit: number | null;
        features: string[];
    };
    is_current: boolean;
    proration: {
        days_in_month: number;
        remaining_days: number;
        proration_ratio: number;
        current_plan_prorated: number;
        new_plan_prorated: number;
        difference: number;
        is_upgrade: boolean;
    } | null;
    error?: string;
}

interface Props {
    company: Company;
    planOptions: Record<string, PlanOption>;
}

export default function BillingPlans({ company, planOptions }: Props) {
    const handlePlanChange = (newPlan: string) => {
        if (
            confirm(
                `Are you sure you want to change your plan? ${planOptions[newPlan].proration ? `This will result in a ${planOptions[newPlan].proration!.is_upgrade ? 'charge' : 'credit'} of $${Math.abs(planOptions[newPlan].proration!.difference)} prorated for the remainder of this month.` : ''}`,
            )
        ) {
            router.post(
                billingChangePlan(window.location.hostname.split('.')[0]),
                {
                    new_plan: newPlan,
                },
                {
                    onSuccess: () => {
                        // Success message will be shown via flash message
                    },
                    onError: (errors) => {
                        console.error('Plan change failed:', errors);
                    },
                },
            );
        }
    };

    const getFeatureIcon = (feature: string) => {
        switch (feature) {
            case 'time_tracking':
                return <Clock className="h-4 w-4" />;
            case 'basic_reports':
                return <FileText className="h-4 w-4" />;
            case 'advanced_reports':
                return <FileText className="h-4 w-4" />;
            case 'payroll':
                return <DollarSign className="h-4 w-4" />;
            case 'api_access':
                return <Zap className="h-4 w-4" />;
            case 'email_support':
                return <HeadphonesIcon className="h-4 w-4" />;
            case 'priority_support':
                return <HeadphonesIcon className="h-4 w-4" />;
            case 'dedicated_support':
                return <HeadphonesIcon className="h-4 w-4" />;
            case 'custom_integrations':
                return <Shield className="h-4 w-4" />;
            default:
                return <Check className="h-4 w-4" />;
        }
    };

    const formatFeatureName = (feature: string) => {
        return feature
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const plans = Object.entries(planOptions);

    return (
        <AppLayout>
            <Head title="Manage Plan" />

            <div className="space-y-6">
                {/* Header */}
                <div className="space-y-4 text-center">
                    <h1 className="text-3xl font-bold">Choose Your Plan</h1>
                    <p className="mx-auto max-w-2xl text-muted-foreground">
                        Select the perfect plan for your business needs. Upgrade
                        or downgrade at any time with prorated billing.
                    </p>
                    <div className="flex items-center justify-center gap-2">
                        <Badge variant="outline">
                            Current Plan: {company.current_plan}
                        </Badge>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid gap-8 lg:grid-cols-3">
                    {plans.map(([planKey, planOption]) => {
                        const isCurrent = planOption.is_current;
                        const isPopular = planKey === 'professional';

                        return (
                            <Card
                                key={planKey}
                                className={`relative ${isCurrent ? 'border-primary shadow-lg' : ''} ${isPopular ? 'border-primary' : ''}`}
                            >
                                {isPopular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                                        <Badge className="bg-primary text-primary-foreground">
                                            <Star className="mr-1 h-3 w-3" />
                                            Most Popular
                                        </Badge>
                                    </div>
                                )}

                                {isCurrent && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                                        <Badge
                                            variant="outline"
                                            className="border-green-200 bg-green-50 text-green-700"
                                        >
                                            <Check className="mr-1 h-3 w-3" />
                                            Current Plan
                                        </Badge>
                                    </div>
                                )}

                                <CardHeader className="pb-4 text-center">
                                    <CardTitle className="text-xl">
                                        {planOption.plan.name}
                                    </CardTitle>
                                    <div className="space-y-2">
                                        <div className="text-3xl font-bold">
                                            ${planOption.plan.monthly_fee}
                                            <span className="text-lg font-normal text-muted-foreground">
                                                /month
                                            </span>
                                        </div>
                                        {planOption.proration && !isCurrent && (
                                            <div className="text-sm">
                                                {planOption.proration
                                                    .is_upgrade ? (
                                                    <span className="text-orange-600">
                                                        +$
                                                        {
                                                            planOption.proration
                                                                .difference
                                                        }{' '}
                                                        due today
                                                    </span>
                                                ) : (
                                                    <span className="text-green-600">
                                                        -$
                                                        {Math.abs(
                                                            planOption.proration
                                                                .difference,
                                                        )}{' '}
                                                        credit
                                                    </span>
                                                )}
                                                <div className="text-xs text-muted-foreground">
                                                    Prorated for{' '}
                                                    {
                                                        planOption.proration
                                                            .remaining_days
                                                    }{' '}
                                                    days
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Limits */}
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                Users
                                            </span>
                                            <span className="font-medium">
                                                {planOption.plan.user_limit ||
                                                    'Unlimited'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2">
                                                <Activity className="h-4 w-4" />
                                                Projects
                                            </span>
                                            <span className="font-medium">
                                                {planOption.plan
                                                    .project_limit ||
                                                    'Unlimited'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-medium">
                                            Features
                                        </h4>
                                        <div className="space-y-2">
                                            {planOption.plan.features.map(
                                                (feature) => (
                                                    <div
                                                        key={feature}
                                                        className="flex items-center gap-2 text-sm"
                                                    >
                                                        {getFeatureIcon(
                                                            feature,
                                                        )}
                                                        <span>
                                                            {formatFeatureName(
                                                                feature,
                                                            )}
                                                        </span>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter>
                                    {isCurrent ? (
                                        <Button
                                            className="w-full"
                                            variant="outline"
                                            disabled
                                        >
                                            <Check className="mr-2 h-4 w-4" />
                                            Current Plan
                                        </Button>
                                    ) : (
                                        <Button
                                            className="w-full"
                                            onClick={() =>
                                                handlePlanChange(planKey)
                                            }
                                            disabled={!!planOption.error}
                                        >
                                            {planOption.proration
                                                ?.is_upgrade ? (
                                                <>
                                                    Upgrade Now
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </>
                                            ) : (
                                                <>
                                                    Downgrade
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>

                {/* Plan Comparison */}
                <Card>
                    <CardHeader>
                        <CardTitle>Plan Comparison</CardTitle>
                        <CardDescription>
                            Detailed comparison of all available features
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="px-4 py-3 text-left">
                                            Feature
                                        </th>
                                        {plans.map(([planKey, planOption]) => (
                                            <th
                                                key={planKey}
                                                className="px-4 py-3 text-center"
                                            >
                                                {planOption.plan.name}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-medium">
                                            Monthly Price
                                        </td>
                                        {plans.map(([planKey, planOption]) => (
                                            <td
                                                key={planKey}
                                                className="px-4 py-3 text-center"
                                            >
                                                ${planOption.plan.monthly_fee}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-medium">
                                            Users
                                        </td>
                                        {plans.map(([planKey, planOption]) => (
                                            <td
                                                key={planKey}
                                                className="px-4 py-3 text-center"
                                            >
                                                {planOption.plan.user_limit ||
                                                    'Unlimited'}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-medium">
                                            Projects
                                        </td>
                                        {plans.map(([planKey, planOption]) => (
                                            <td
                                                key={planKey}
                                                className="px-4 py-3 text-center"
                                            >
                                                {planOption.plan
                                                    .project_limit ||
                                                    'Unlimited'}
                                            </td>
                                        ))}
                                    </tr>
                                    {[
                                        'time_tracking',
                                        'basic_reports',
                                        'advanced_reports',
                                        'payroll',
                                        'api_access',
                                        'email_support',
                                        'priority_support',
                                        'dedicated_support',
                                        'custom_integrations',
                                    ].map((feature) => (
                                        <tr key={feature} className="border-b">
                                            <td className="px-4 py-3 font-medium">
                                                {formatFeatureName(feature)}
                                            </td>
                                            {plans.map(
                                                ([planKey, planOption]) => (
                                                    <td
                                                        key={planKey}
                                                        className="px-4 py-3 text-center"
                                                    >
                                                        {planOption.plan.features.includes(
                                                            feature,
                                                        ) ? (
                                                            <Check className="mx-auto h-4 w-4 text-green-600" />
                                                        ) : (
                                                            <X className="mx-auto h-4 w-4 text-gray-400" />
                                                        )}
                                                    </td>
                                                ),
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* FAQ Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Frequently Asked Questions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="mb-2 font-medium">
                                Can I change plans anytime?
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Yes! You can upgrade or downgrade your plan at
                                any time. Changes are prorated, so you'll only
                                pay for the difference.
                            </p>
                        </div>
                        <div>
                            <h4 className="mb-2 font-medium">
                                What happens if I exceed my plan limits?
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                You'll be charged for overage at the end of your
                                billing cycle. Users are $9.99 each and projects
                                are $4.99 each per month.
                            </p>
                        </div>
                        <div>
                            <h4 className="mb-2 font-medium">
                                Is there a contract or commitment?
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                No contracts! You're billed monthly and can
                                cancel or change your plan at any time.
                            </p>
                        </div>
                        <div>
                            <h4 className="mb-2 font-medium">
                                What payment methods do you accept?
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                We accept all major credit cards, debit cards,
                                and ACH transfers.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
