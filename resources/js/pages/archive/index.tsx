import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Archive, RefreshCcw, Trash2, Filter, Download, Folder, CheckSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Archive', href: '/archive' },
];

interface ArchivedItem {
    id: number;
    title?: string; // For tasks
    name?: string; // For projects
    description: string;
    deleted_at: string;
    archive_notes?: string;
    status: string;
    priority: string;
    project?: { name: string };
    user?: { name: string };
    owner?: { name: string };
}

interface Props {
    items: {
        data: ArchivedItem[];
        links: any[];
        meta: any;
    };
    stats: {
        total_archived_tasks: number;
        total_archived_projects: number;
    };
    filters: {
        search?: string;
        tab?: string;
        sort?: string;
        direction?: string;
    };
}

export default function ArchiveIndex({ items, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedTab, setSelectedTab] = useState(filters.tab || 'tasks');
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Handle filter changes
    useEffect(() => {
        const params: any = { tab: selectedTab };
        if (debouncedSearch) params.search = debouncedSearch;

        router.get(route('archive.index'), params, {
            preserveState: true,
            preserveScroll: true,
            only: ['items', 'stats', 'filters'],
        });
    }, [debouncedSearch, selectedTab]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedItems(items.data.map(item => item.id));
        } else {
            setSelectedItems([]);
        }
    };

    const handleSelectOne = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedItems([...selectedItems, id]);
        } else {
            setSelectedItems(selectedItems.filter(itemId => itemId !== id));
        }
    };

    const handleRestore = () => {
        if (selectedItems.length === 0) return;
        if (confirm(`Are you sure you want to restore ${selectedItems.length} items?`)) {
            router.post(route('archive.restore'), {
                ids: selectedItems,
                type: selectedTab,
            }, {
                onSuccess: () => setSelectedItems([]),
            });
        }
    };

    const handleDestroy = () => {
        if (selectedItems.length === 0) return;
        if (confirm(`Are you sure you want to PERMANENTLY delete ${selectedItems.length} items? This cannot be undone.`)) {
            router.delete(route('archive.destroy'), {
                data: {
                    ids: selectedItems,
                    type: selectedTab,
                },
                onSuccess: () => setSelectedItems([]),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Archive" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Archive</h2>
                        <p className="text-muted-foreground">Manage archived tasks and projects.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedItems.length > 0 && (
                            <>
                                <Button variant="outline" size="sm" onClick={handleRestore}>
                                    <RefreshCcw className="mr-2 h-4 w-4" />
                                    Restore ({selectedItems.length})
                                </Button>
                                <Button variant="destructive" size="sm" onClick={handleDestroy}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Forever ({selectedItems.length})
                                </Button>
                            </>
                        )}
                        <Button variant="outline" size="sm" onClick={() => window.location.href = route('archive.export', { type: selectedTab })}>
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border bg-card p-6">
                        <div className="flex items-center gap-2">
                            <CheckSquare className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm font-medium text-muted-foreground">Archived Tasks</p>
                        </div>
                        <p className="mt-2 text-3xl font-bold">{stats.total_archived_tasks}</p>
                    </div>
                    <div className="rounded-xl border bg-card p-6">
                        <div className="flex items-center gap-2">
                            <Folder className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm font-medium text-muted-foreground">Archived Projects</p>
                        </div>
                        <p className="mt-2 text-3xl font-bold">{stats.total_archived_projects}</p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="rounded-xl border bg-card">
                    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                        <div className="flex items-center justify-between border-b px-4 py-2">
                            <TabsList>
                                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                                <TabsTrigger value="projects">Projects</TabsTrigger>
                            </TabsList>
                            <div className="flex items-center gap-2">
                                <div className="relative w-64">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search archive..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-8 h-9"
                                    />
                                </div>
                                <Button variant="ghost" size="icon">
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <TabsContent value="tasks" className="m-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">
                                            <Checkbox
                                                checked={selectedItems.length === items.data.length && items.data.length > 0}
                                                onCheckedChange={handleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Project</TableHead>
                                        <TableHead>Archived Date</TableHead>
                                        <TableHead>Notes</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                                No archived tasks found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        items.data.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedItems.includes(item.id)}
                                                        onCheckedChange={(checked) => handleSelectOne(item.id, checked as boolean)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{item.title}</div>
                                                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                        {item.description}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {item.project ? (
                                                        <Badge variant="outline">{item.project.name}</Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {format(new Date(item.deleted_at), 'MMM d, yyyy')}
                                                </TableCell>
                                                <TableCell>
                                                    {item.archive_notes || <span className="text-muted-foreground italic">No notes</span>}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                Actions
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => {
                                                                setSelectedItems([item.id]);
                                                                handleRestore();
                                                            }}>
                                                                Restore
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-red-600" onClick={() => {
                                                                setSelectedItems([item.id]);
                                                                handleDestroy();
                                                            }}>
                                                                Delete Forever
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TabsContent>

                        <TabsContent value="projects" className="m-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">
                                            <Checkbox
                                                checked={selectedItems.length === items.data.length && items.data.length > 0}
                                                onCheckedChange={handleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Owner</TableHead>
                                        <TableHead>Archived Date</TableHead>
                                        <TableHead>Notes</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                                No archived projects found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        items.data.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedItems.includes(item.id)}
                                                        onCheckedChange={(checked) => handleSelectOne(item.id, checked as boolean)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{item.name}</div>
                                                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                        {item.description}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {item.owner?.name || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {format(new Date(item.deleted_at), 'MMM d, yyyy')}
                                                </TableCell>
                                                <TableCell>
                                                    {item.archive_notes || <span className="text-muted-foreground italic">No notes</span>}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                Actions
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => {
                                                                setSelectedItems([item.id]);
                                                                handleRestore();
                                                            }}>
                                                                Restore
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-red-600" onClick={() => {
                                                                setSelectedItems([item.id]);
                                                                handleDestroy();
                                                            }}>
                                                                Delete Forever
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    );
}
