import { useEffect, useState } from 'react';
import { admin, ContactMessage } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { MessageSquare, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  unread: 'bg-blue-100 text-blue-800',
  read: 'bg-stone-100 text-stone-600',
  replied: 'bg-green-100 text-green-800',
};

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await admin.messages();
      setMessages(data);
    } catch { toast.error('Failed to load messages'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSelect = async (msg: ContactMessage) => {
    setSelected(msg);
    if (msg.status === 'unread') {
      await admin.updateMessage(msg.id, 'read');
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'read' } : m));
    }
  };

  const markReplied = async () => {
    if (!selected) return;
    await admin.updateMessage(selected.id, 'replied');
    setMessages(prev => prev.map(m => m.id === selected.id ? { ...m, status: 'replied' } : m));
    setSelected(prev => prev ? { ...prev, status: 'replied' } : null);
    toast.success('Marked as replied');
  };

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Messages</h1>
          <p className="text-stone-500 text-sm">
            {messages.length} messages{unreadCount > 0 && ` · ${unreadCount} unread`}
          </p>
        </div>
        <Button variant="outline" onClick={load} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 min-h-96">
        {/* Message list */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden lg:col-span-1">
          {loading ? (
            <div className="text-center py-16 text-stone-400 text-sm">Loading...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-400 text-sm">No messages yet</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {messages.map(msg => (
                <button
                  key={msg.id}
                  onClick={() => handleSelect(msg)}
                  className={cn(
                    'w-full text-left px-4 py-3 hover:bg-stone-50 transition-colors',
                    selected?.id === msg.id && 'bg-stone-50'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className={cn('text-sm truncate', msg.status === 'unread' ? 'font-semibold text-stone-900' : 'font-medium text-stone-700')}>
                        {msg.name}
                      </p>
                      <p className="text-xs text-stone-400 truncate">{msg.email}</p>
                      {msg.subject && <p className="text-xs text-stone-500 mt-0.5 truncate">{msg.subject}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${STATUS_STYLES[msg.status]}`}>
                        {msg.status}
                      </span>
                      <span className="text-xs text-stone-400">{format(new Date(msg.created_at), 'MMM d')}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Message detail */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 lg:col-span-2">
          {!selected ? (
            <div className="flex items-center justify-center h-full text-stone-400">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-stone-200" />
                <p>Select a message to read</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-stone-900">{selected.subject || 'No Subject'}</h2>
                  <p className="text-sm text-stone-500 mt-0.5">
                    From <strong>{selected.name}</strong> ({selected.email})
                    {' · '}{format(new Date(selected.created_at), 'MMMM d, yyyy h:mm a')}
                  </p>
                </div>
                {selected.status !== 'replied' && (
                  <Button size="sm" onClick={markReplied} className="shrink-0">
                    Mark Replied
                  </Button>
                )}
              </div>
              <div className="bg-stone-50 rounded-lg p-4 text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">
                {selected.message}
              </div>
              <div className="mt-4 pt-4 border-t border-stone-100">
                <a
                  href={`mailto:${selected.email}?subject=Re: ${selected.subject || 'Your message'}`}
                  className="text-sm text-primary hover:underline"
                >
                  Reply via email →
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
