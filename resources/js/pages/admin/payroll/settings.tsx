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
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { SaveIcon, SettingsIcon } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

interface PayrollSettingsProps {
    settings: {
        overtime_enabled: boolean;
        overtime_multiplier: number;
        daily_hours_threshold: number;
        weekly_hours_threshold: number;
        standard_work_day_hours: number;
        overtime_rule: string;
        rounding_precision: number;
        default_period_type: string;
    };
    periodTypes: Array<{ value: string; label: string }>;
    overtimeRules: Array<{ value: string; label: string }>;
}

const PayrollSettings: React.FC<PayrollSettingsProps> = ({
    settings,
    periodTypes,
    overtimeRules,
}) => {
    const { data, setData, put, processing, errors } = useForm(settings);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/payroll/settings', {
            onSuccess: () => {
                toast.success('Payroll settings updated successfully');
            },
            onError: () => {
                toast.error('Failed to update payroll settings');
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Payroll Settings" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <SettingsIcon className="h-8 w-8 text-muted-foreground" />
                    <div>
                        <h1 className="text-3xl font-bold">Payroll Settings</h1>
                        <p className="text-muted-foreground">
                            Configure payroll calculation rules and defaults
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Overtime Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Overtime Settings</CardTitle>
                            <CardDescription>
                                Configure how overtime is calculated and paid
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="overtime_enabled">
                                        Enable Overtime
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Calculate overtime pay for hours beyond
                                        thresholds
                                    </p>
                                </div>
                                <Switch
                                    id="overtime_enabled"
                                    checked={data.overtime_enabled}
                                    onCheckedChange={(checked: boolean) =>
                                        setData('overtime_enabled', checked)
                                    }
                                />
                            </div>

                            {data.overtime_enabled && (
                                <>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="overtime_multiplier">
                                                Overtime Multiplier
                                            </Label>
                                            <Input
                                                id="overtime_multiplier"
                                                type="number"
                                                step="0.1"
                                                min="1"
                                                max="5"
                                                value={data.overtime_multiplier}
                                                onChange={(e) =>
                                                    setData(
                                                        'overtime_multiplier',
                                                        parseFloat(
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                            />
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                e.g., 1.5 for time-and-a-half,
                                                2.0 for double-time
                                            </p>
                                            {errors.overtime_multiplier && (
                                                <p className="mt-1 text-sm text-destructive">
                                                    {errors.overtime_multiplier}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="overtime_rule">
                                                Overtime Rule
                                            </Label>
                                            <Select
                                                value={data.overtime_rule}
                                                onValueChange={(value) =>
                                                    setData(
                                                        'overtime_rule',
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {overtimeRules.map(
                                                        (rule) => (
                                                            <SelectItem
                                                                key={rule.value}
                                                                value={
                                                                    rule.value
                                                                }
                                                            >
                                                                {rule.label}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {errors.overtime_rule && (
                                                <p className="mt-1 text-sm text-destructive">
                                                    {errors.overtime_rule}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="daily_hours_threshold">
                                                Daily Hours Threshold
                                            </Label>
                                            <Input
                                                id="daily_hours_threshold"
                                                type="number"
                                                step="0.5"
                                                min="1"
                                                max="24"
                                                value={
                                                    data.daily_hours_threshold
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        'daily_hours_threshold',
                                                        parseFloat(
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                            />
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Hours per day before overtime
                                                applies
                                            </p>
                                            {errors.daily_hours_threshold && (
                                                <p className="mt-1 text-sm text-destructive">
                                                    {
                                                        errors.daily_hours_threshold
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="weekly_hours_threshold">
                                                Weekly Hours Threshold
                                            </Label>
                                            <Input
                                                id="weekly_hours_threshold"
                                                type="number"
                                                step="0.5"
                                                min="1"
                                                max="168"
                                                value={
                                                    data.weekly_hours_threshold
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        'weekly_hours_threshold',
                                                        parseFloat(
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                            />
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Hours per week before overtime
                                                applies
                                            </p>
                                            {errors.weekly_hours_threshold && (
                                                <p className="mt-1 text-sm text-destructive">
                                                    {
                                                        errors.weekly_hours_threshold
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Work Hours Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Work Hours Settings</CardTitle>
                            <CardDescription>
                                Configure standard work hours and rate
                                calculations
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="standard_work_day_hours">
                                        Standard Work Day Hours
                                    </Label>
                                    <Input
                                        id="standard_work_day_hours"
                                        type="number"
                                        step="0.5"
                                        min="1"
                                        max="24"
                                        value={data.standard_work_day_hours}
                                        onChange={(e) =>
                                            setData(
                                                'standard_work_day_hours',
                                                parseFloat(e.target.value),
                                            )
                                        }
                                    />
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Used to calculate hourly rates from
                                        daily rates
                                    </p>
                                    {errors.standard_work_day_hours && (
                                        <p className="mt-1 text-sm text-destructive">
                                            {errors.standard_work_day_hours}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="rounding_precision">
                                        Rounding Precision
                                    </Label>
                                    <Select
                                        value={String(data.rounding_precision)}
                                        onValueChange={(value) =>
                                            setData(
                                                'rounding_precision',
                                                parseInt(value),
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">
                                                0 decimal places
                                            </SelectItem>
                                            <SelectItem value="1">
                                                1 decimal place
                                            </SelectItem>
                                            <SelectItem value="2">
                                                2 decimal places
                                            </SelectItem>
                                            <SelectItem value="3">
                                                3 decimal places
                                            </SelectItem>
                                            <SelectItem value="4">
                                                4 decimal places
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Decimal places for payroll calculations
                                    </p>
                                    {errors.rounding_precision && (
                                        <p className="mt-1 text-sm text-destructive">
                                            {errors.rounding_precision}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Default Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Default Settings</CardTitle>
                            <CardDescription>
                                Configure default values for payroll periods
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <Label htmlFor="default_period_type">
                                    Default Period Type
                                </Label>
                                <Select
                                    value={data.default_period_type}
                                    onValueChange={(value) =>
                                        setData('default_period_type', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
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
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Default payroll period type when creating
                                    new periods
                                </p>
                                {errors.default_period_type && (
                                    <p className="mt-1 text-sm text-destructive">
                                        {errors.default_period_type}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            <SaveIcon className="mr-2 h-4 w-4" />
                            {processing ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
};

export default PayrollSettings;
