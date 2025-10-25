import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeftIcon, CalendarIcon } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

interface PeriodType {
    value: string;
    label: string;
}

interface DefaultConfig {
    weekly: { week_start_day: string };
    bi_weekly: { week_start_day: string; base_date?: string };
    monthly: { day_of_month: number };
    custom: { interval_days: number };
}

interface PayrollCreateProps {
    periodTypes: PeriodType[];
    defaultConfig: DefaultConfig;
}

const PayrollCreate: React.FC<PayrollCreateProps> = ({
    periodTypes,
    defaultConfig,
}) => {
    const { data, setData, post, processing, errors } = useForm({
        period_type: 'weekly',
        start_date: '',
        end_date: '',
        period_config: {},
        notes: '',
    });

    const [configFields, setConfigFields] = React.useState<
        Record<string, unknown>
    >(defaultConfig.weekly);

    const handlePeriodTypeChange = (value: string) => {
        setData('period_type', value);
        setData('period_config', defaultConfig[value as keyof DefaultConfig]);
        setConfigFields(defaultConfig[value as keyof DefaultConfig]);
    };

    const handleConfigChange = (key: string, value: unknown) => {
        const newConfig = { ...data.period_config, [key]: value };
        setData('period_config', newConfig);
        setConfigFields(newConfig);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/payroll', {
            onSuccess: () => {
                toast.success('Payroll period created successfully');
            },
            onError: () => {
                toast.error('Failed to create payroll period');
            },
        });
    };

    const generatePeriodDates = () => {
        if (!data.period_type) return;

        const today = new Date();
        let startDate = new Date();
        let endDate = new Date();

        switch (data.period_type) {
            case 'weekly': {
                const dayOfWeek = today.getDay();
                const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                startDate.setDate(today.getDate() - daysToMonday);
                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 6);
                break;
            }

            case 'bi_weekly': {
                // Simple implementation: start from beginning of month and add 2 weeks
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 13);
                break;
            }

            case 'monthly': {
                const dayOfMonth = configFields.day_of_month || 1;
                startDate = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    dayOfMonth,
                );
                if (startDate > today) {
                    startDate.setMonth(today.getMonth() - 1);
                }
                endDate = new Date(
                    startDate.getFullYear(),
                    startDate.getMonth() + 1,
                    0,
                );
                break;
            }

            case 'custom': {
                const intervalDays = configFields.interval_days || 7;
                startDate = new Date(today);
                endDate = new Date(today);
                endDate.setDate(today.getDate() + intervalDays - 1);
                break;
            }
        }

        setData('start_date', startDate.toISOString().split('T')[0]);
        setData('end_date', endDate.toISOString().split('T')[0]);
    };

    return (
        <AppLayout>
            <Head title="Create Payroll Period" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/payroll">
                        <Button variant="outline" size="sm">
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Back to Payroll
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">
                            Create Payroll Period
                        </h1>
                        <p className="text-muted-foreground">
                            Set up a new payroll period for calculation
                        </p>
                    </div>
                </div>

                <div className="max-w-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Period Type */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Period Configuration</CardTitle>
                                <CardDescription>
                                    Choose the type of payroll period and
                                    configure its settings
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="period_type">
                                        Period Type
                                    </Label>
                                    <Select
                                        value={data.period_type}
                                        onValueChange={handlePeriodTypeChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select period type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {periodTypes.map((type) => (
                                                <SelectItem
                                                    key={type.value}
                                                    value={type.value}
                                                >
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.period_type && (
                                        <p className="mt-1 text-sm text-destructive">
                                            {errors.period_type}
                                        </p>
                                    )}
                                </div>

                                {/* Period-specific configuration */}
                                {data.period_type === 'weekly' && (
                                    <div>
                                        <Label htmlFor="week_start_day">
                                            Week Start Day
                                        </Label>
                                        <Select
                                            value={
                                                configFields.week_start_day ||
                                                'monday'
                                            }
                                            onValueChange={(value) =>
                                                handleConfigChange(
                                                    'week_start_day',
                                                    value,
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="monday">
                                                    Monday
                                                </SelectItem>
                                                <SelectItem value="sunday">
                                                    Sunday
                                                </SelectItem>
                                                <SelectItem value="saturday">
                                                    Saturday
                                                </SelectItem>
                                                <SelectItem value="friday">
                                                    Friday
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {data.period_type === 'bi_weekly' && (
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="week_start_day">
                                                Week Start Day
                                            </Label>
                                            <Select
                                                value={
                                                    configFields.week_start_day ||
                                                    'monday'
                                                }
                                                onValueChange={(value) =>
                                                    handleConfigChange(
                                                        'week_start_day',
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="monday">
                                                        Monday
                                                    </SelectItem>
                                                    <SelectItem value="sunday">
                                                        Sunday
                                                    </SelectItem>
                                                    <SelectItem value="saturday">
                                                        Saturday
                                                    </SelectItem>
                                                    <SelectItem value="friday">
                                                        Friday
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="base_date">
                                                Base Date (Optional)
                                            </Label>
                                            <Input
                                                id="base_date"
                                                type="date"
                                                value={
                                                    configFields.base_date || ''
                                                }
                                                onChange={(e) =>
                                                    handleConfigChange(
                                                        'base_date',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Leave empty to use start of year"
                                            />
                                        </div>
                                    </div>
                                )}

                                {data.period_type === 'monthly' && (
                                    <div>
                                        <Label htmlFor="day_of_month">
                                            Day of Month
                                        </Label>
                                        <Select
                                            value={String(
                                                configFields.day_of_month || 1,
                                            )}
                                            onValueChange={(value) =>
                                                handleConfigChange(
                                                    'day_of_month',
                                                    parseInt(value),
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from(
                                                    { length: 28 },
                                                    (_, i) => (
                                                        <SelectItem
                                                            key={i + 1}
                                                            value={String(
                                                                i + 1,
                                                            )}
                                                        >
                                                            {i + 1}
                                                            {i === 0
                                                                ? 'st'
                                                                : i === 1
                                                                  ? 'nd'
                                                                  : i === 2
                                                                    ? 'rd'
                                                                    : 'th'}
                                                        </SelectItem>
                                                    ),
                                                )}
                                                <SelectItem value="29">
                                                    29th
                                                </SelectItem>
                                                <SelectItem value="30">
                                                    30th
                                                </SelectItem>
                                                <SelectItem value="31">
                                                    31st
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {data.period_type === 'custom' && (
                                    <div>
                                        <Label htmlFor="interval_days">
                                            Interval Days
                                        </Label>
                                        <Input
                                            id="interval_days"
                                            type="number"
                                            min="1"
                                            max="365"
                                            value={
                                                configFields.interval_days || 7
                                            }
                                            onChange={(e) =>
                                                handleConfigChange(
                                                    'interval_days',
                                                    parseInt(e.target.value),
                                                )
                                            }
                                        />
                                    </div>
                                )}

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={generatePeriodDates}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    Auto-generate Dates
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Date Range */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Date Range</CardTitle>
                                <CardDescription>
                                    Specify the start and end dates for this
                                    payroll period
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="start_date">
                                            Start Date
                                        </Label>
                                        <Input
                                            id="start_date"
                                            type="date"
                                            value={data.start_date}
                                            onChange={(e) =>
                                                setData(
                                                    'start_date',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                        {errors.start_date && (
                                            <p className="mt-1 text-sm text-destructive">
                                                {errors.start_date}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="end_date">
                                            End Date
                                        </Label>
                                        <Input
                                            id="end_date"
                                            type="date"
                                            value={data.end_date}
                                            onChange={(e) =>
                                                setData(
                                                    'end_date',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                        {errors.end_date && (
                                            <p className="mt-1 text-sm text-destructive">
                                                {errors.end_date}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Notes (Optional)</CardTitle>
                                <CardDescription>
                                    Add any additional notes or comments for
                                    this payroll period
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) =>
                                        setData('notes', e.target.value)
                                    }
                                    placeholder="Optional notes for this payroll period"
                                    rows={3}
                                />
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex justify-end space-x-4">
                            <Link href="/payroll">
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing
                                    ? 'Creating...'
                                    : 'Create Payroll Period'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
};

export default PayrollCreate;
