import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

interface AttendanceEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    attendanceLog?: {
        id: number;
        timestamp?: string;
        type?: 'clock_in' | 'clock_out';
        labor?: { id: number; name: string };
        supervisor?: { id: number; name: string };
    };
    projectId: number;
}

export default function AttendanceEditModal({
    isOpen,
    onClose,
    attendanceLog,
    projectId,
}: AttendanceEditModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data, setData, put, processing, errors, reset } = useForm({
        timestamp: attendanceLog?.timestamp
            ? new Date(attendanceLog.timestamp).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16),
        edit_reason: '',
    });

    // Defensive programming: Return early if attendanceLog is null
    if (!attendanceLog) {
        return null;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        put(`/projects/${projectId}/attendance/${attendanceLog?.id}`, {
            method: 'put',
            onSuccess: () => {
                onClose();
                reset();
                setIsSubmitting(false);
                window.location.reload(); // Refresh to show updated data
            },
            onError: () => {
                setIsSubmitting(false);
            },
            preserveScroll: true,
        });
    };

    const handleClose = () => {
        if (!processing && !isSubmitting) {
            reset();
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Attendance Record</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="labor">Labor</Label>
                        <Input
                            id="labor"
                            value={attendanceLog?.labor?.name || 'Unknown'}
                            disabled
                            className="bg-muted"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Input
                            id="type"
                            value={
                                attendanceLog?.type === 'clock_out'
                                    ? 'Clock Out'
                                    : 'Clock In'
                            }
                            disabled
                            className="bg-muted"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="timestamp">Date & Time</Label>
                        <Input
                            id="timestamp"
                            type="datetime-local"
                            value={data.timestamp}
                            onChange={(e) =>
                                setData('timestamp', e.target.value)
                            }
                            required
                            className={errors.timestamp ? 'border-red-500' : ''}
                        />
                        {errors.timestamp && (
                            <p className="text-sm text-red-500">
                                {errors.timestamp}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit_reason">
                            Reason for Editing *
                        </Label>
                        <Textarea
                            id="edit_reason"
                            value={data.edit_reason}
                            onChange={(e) =>
                                setData('edit_reason', e.target.value)
                            }
                            placeholder="Please explain why this attendance record is being edited..."
                            required
                            rows={3}
                            className={
                                errors.edit_reason ? 'border-red-500' : ''
                            }
                        />
                        {errors.edit_reason && (
                            <p className="text-sm text-red-500">
                                {errors.edit_reason}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleClose}
                            disabled={processing || isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || isSubmitting}
                        >
                            {processing || isSubmitting
                                ? 'Saving...'
                                : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
