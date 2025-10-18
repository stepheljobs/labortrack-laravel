import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

type Message = {
    id: number;
    created_at: string;
    user?: { id: number; name: string };
    message: string;
    photo_url?: string | null;
};

type PaginatedMessagesResponse = {
    items: Message[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
};

interface ProjectChatProps {
    projectId: number;
    initialMessages?: Message[];
}

export default function ProjectChat({
    projectId,
    initialMessages = [],
}: ProjectChatProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingEarlier, setLoadingEarlier] = useState(false);
    const [loadingNew, setLoadingNew] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const messageForm = useForm({
        message: '',
        photo: null as File | null,
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadEarlierMessages = async () => {
        if (loadingEarlier || !hasMore) return;

        setLoadingEarlier(true);
        try {
            const response = await fetch(
                `/api/projects/${projectId}/messages?page=${currentPage + 1}`,
            );
            const data: PaginatedMessagesResponse = await response.json();

            if (data.items.length > 0) {
                setMessages((prev) => [...prev, ...data.items]);
                setCurrentPage((prev) => prev + 1);
                setHasMore(data.meta.current_page < data.meta.last_page);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Failed to load earlier messages:', error);
        } finally {
            setLoadingEarlier(false);
        }
    };

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageForm.data.message.trim()) return;

        messageForm.post(`/projects/${projectId}/messages`, {
            onSuccess: () => {
                messageForm.reset('message', 'photo');
                // Reload messages to get the new one
                loadNewMessages();
            },
            forceFormData: true,
        });
    };

    const loadNewMessages = useCallback(async () => {
        setLoadingNew(true);
        try {
            const response = await fetch(
                `/api/projects/${projectId}/messages?page=1`,
            );
            const data: PaginatedMessagesResponse = await response.json();

            // Only update if we have new messages
            if (data.items.length > 0 && data.items[0].id !== messages[0]?.id) {
                setMessages(data.items);
                setCurrentPage(1);
                setHasMore(data.meta.current_page < data.meta.last_page);
                setTimeout(scrollToBottom, 100);
            }
        } catch (error) {
            console.error('Failed to load new messages:', error);
        } finally {
            setLoadingNew(false);
        }
    }, [projectId, messages]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Poll for new messages every 10 seconds
    useEffect(() => {
        const interval = setInterval(loadNewMessages, 10000);
        return () => clearInterval(interval);
    }, [projectId, loadNewMessages]);

    return (
        <div className="space-y-4">
            <Card>
                <CardContent className="p-0">
                    <div
                        ref={messagesContainerRef}
                        className="max-h-[60vh] divide-y overflow-y-auto"
                    >
                        {/* Load Earlier Messages Button */}
                        {hasMore && (
                            <div className="p-3 text-center">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={loadEarlierMessages}
                                    disabled={loadingEarlier}
                                    className="w-full"
                                >
                                    {loadingEarlier ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Loading...
                                        </>
                                    ) : (
                                        'Load Earlier Messages'
                                    )}
                                </Button>
                            </div>
                        )}

                        {/* Messages */}
                        {messages.length === 0 ? (
                            <div className="p-3 text-sm text-muted-foreground">
                                No messages yet. Post updates below to keep your
                                team informed.
                            </div>
                        ) : (
                            messages.map((m) => (
                                <div key={m.id} className="space-y-2 p-3">
                                    <div className="text-xs text-muted-foreground">
                                        {new Date(
                                            m.created_at,
                                        ).toLocaleString()}{' '}
                                        — {m.user?.name}
                                    </div>
                                    <div className="text-sm whitespace-pre-wrap">
                                        {m.message}
                                    </div>
                                    {m.photo_url && (
                                        <img
                                            src={m.photo_url}
                                            className="h-24 w-24 cursor-pointer rounded-md border object-cover"
                                            onClick={() =>
                                                window.open(
                                                    m.photo_url!,
                                                    '_blank',
                                                )
                                            }
                                        />
                                    )}
                                </div>
                            ))
                        )}

                        {/* Loading indicator for new messages */}
                        {loadingNew && (
                            <div className="p-3 text-center">
                                <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                                <span className="text-sm text-muted-foreground">
                                    Loading new messages...
                                </span>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </CardContent>
            </Card>

            {/* Message Form */}
            <form
                onSubmit={sendMessage}
                className="space-y-2 rounded-lg border p-3"
            >
                <label className="block text-sm font-medium">
                    Post a message
                </label>
                <textarea
                    className="w-full rounded-md border px-3 py-2"
                    rows={3}
                    value={messageForm.data.message}
                    onChange={(e) =>
                        messageForm.setData('message', e.target.value)
                    }
                    placeholder="Write your message..."
                    required
                />
                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                            messageForm.setData(
                                'photo',
                                e.target.files?.[0] ?? null,
                            )
                        }
                    />
                    <Button type="submit" disabled={messageForm.processing}>
                        {messageForm.processing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            'Send'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
